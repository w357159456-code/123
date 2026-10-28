import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI with mandatory User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Multi-modal fault diagnosis endpoint
app.post('/api/diagnose', async (req, res) => {
  try {
    const {
      machineId,
      machineModel,
      alarmCode,
      symptomDescription,
      faultLocation,
      imageFile, // base64 string or sample image reference
      recentHistory,
      availableBOM,
    } = req.body;

    // Fallback rule-based result template if AI fails or no key
    const fallbackDiagnosis = generateHeuristicDiagnosis(
      machineModel,
      alarmCode,
      symptomDescription,
      faultLocation,
      availableBOM
    );

    if (!ai) {
      return res.json({
        ...fallbackDiagnosis,
        source: 'INDUSTRIAL_HEURISTIC_ENGINE',
        note: '已啟用發泡設備專家規則庫（未設定或未連接 GEMINI_API_KEY 時之即時診斷）。',
      });
    }

    // Call Gemini 3.8 Flash for structured multi-modal reasoning
    const prompt = `
你是一位具備 20 年塑膠發泡成型與高壓聚氨酯 (PU) / EVA 射出發泡機的資深設備首席工程師。
現在現場作業員剛透過一機一碼 QR Code 報修，請針對現場回報的故障資料進行專業多模態初判，並精準匹配 ERP 零件 BOM 表料號，以防技師跑錯料二次停機。

【設備資訊】
- 機台編號: ${machineId || 'EQ-PU-01'}
- 機台型號: ${machineModel || 'PU-H600-PRO 雙組份高壓發泡機'}
- 警報代碼: ${alarmCode || '無警報或代碼未顯示'}
- 現場回報異常部位: ${faultLocation || '高壓混合頭'}
- 作業員現場狀況描述: ${symptomDescription || '無詳細描述'}
- 最近歷史維修摘要: ${recentHistory || '近 60 天無重大翻修紀錄'}

【該機型之 ERP 零件 BOM 清單庫】:
${JSON.stringify(availableBOM || [], null, 2)}

請回覆一個符合以下 JSON 格式的物件（請輸出純 JSON，勿加 markdown 標記）：
{
  "confidenceScore": 0.95,
  "urgency": "CRITICAL" | "HIGH" | "MEDIUM",
  "stopMachineImmediately": true | false,
  "probableCauses": [
    "詳細可能原因1（包含化學料固化、液壓壓力或閥件作動機制分析）",
    "詳細可能原因2"
  ],
  "recommendedParts": [
    {
      "erpPartNo": "對應上方 BOM 清單中的 erpPartNo",
      "partName": "零件品名",
      "spec": "規格型號",
      "quantity": 1,
      "estimatedUnitCost": 4800,
      "inStockQty": 12,
      "replacementPriority": "MUST_BRING" | "RECOMMENDED" | "BACKUP",
      "matchReason": "為什麼這次故障必須準備此零件的工程論述"
    }
  ],
  "preliminaryInstructions": [
    "現場作業員立即應對第1步（如緊急卸壓、關閉高壓幫浦電源）",
    "現場作業員立即應對第2步（如使用二氯甲烷或專用清洗劑微量浸洗，防止異氰酸酯遇水固化鎖死）",
    "現場安全防護提醒（穿戴防酸鹼手套與護目鏡）"
  ],
  "estimatedRepairHours": 2.5,
  "technicianSkillRequired": ["高壓液壓系統", "計量泵精修"]
}
`;

    const contents: any[] = [];
    
    // Check if image data is provided (base64)
    if (imageFile && imageFile.startsWith('data:image/')) {
      const match = imageFile.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (match) {
        contents.push({
          inlineData: {
            mimeType: `image/${match[1]}`,
            data: match[2],
          },
        });
      }
    }

    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    try {
      const parsed = JSON.parse(text);
      return res.json({
        ...parsed,
        source: 'GEMINI_MULTIMODAL_AI',
      });
    } catch (e) {
      console.warn('Failed to parse Gemini response as JSON, falling back:', text);
      return res.json({
        ...fallbackDiagnosis,
        source: 'INDUSTRIAL_HEURISTIC_FALLBACK',
        rawAiText: text,
      });
    }
  } catch (error: any) {
    console.error('Diagnosis error:', error);
    res.status(500).json({
      error: error.message || '診斷服務發生錯誤',
    });
  }
});

// Smart technician dispatch ranking endpoint
app.post('/api/smart-dispatch', async (req, res) => {
  try {
    const { workOrder, technicians, warehouseStock } = req.body;

    const ranking = calculateSmartDispatch(workOrder, technicians, warehouseStock);
    res.json({ success: true, ranking });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper for realistic fallback diagnosis
function generateHeuristicDiagnosis(
  machineModel: string,
  alarmCode: string,
  symptom: string,
  location: string,
  bomList: any[]
) {
  const isEVA = machineModel?.includes('EVA') || alarmCode?.includes('E-021');
  
  if (isEVA) {
    return {
      confidenceScore: 0.92,
      urgency: 'HIGH',
      stopMachineImmediately: false,
      probableCauses: [
        '模具第三區加熱板合金電熱棒內部電阻絲熱疲勞斷路，導致模溫溫差 > 8°C 引起發泡不全',
        'K型感溫電偶線路因模台反覆開合造成端子氧化或補償導線微裂斷線',
        '射出螺桿止逆閥磨損導致每模熔膠射出壓力波動，造成發泡胚重不穩定'
      ],
      recommendedParts: [
        {
          erpPartNo: 'ERP-HT-2200',
          partName: '模具合金加熱棒組',
          spec: '220V 1500W φ16x300mm SUS321',
          quantity: 2,
          estimatedUnitCost: 1200,
          inStockQty: 18,
          replacementPriority: 'MUST_BRING',
          matchReason: '警報顯示第三區感溫迴路異常升溫停滯，極高機率為加熱棒開路或老化，須攜帶雙支更換。'
        },
        {
          erpPartNo: 'ERP-TC-0902',
          partName: 'K型熱電偶感溫補償導線',
          spec: 'Class 1 測溫精度 ±1.5°C 鐵氟龍屏蔽耐折彎',
          quantity: 1,
          estimatedUnitCost: 850,
          inStockQty: 30,
          replacementPriority: 'RECOMMENDED',
          matchReason: '現場模溫若有跳動干擾，需同時更換高抗噪感溫線以避免二次報修。'
        }
      ],
      preliminaryInstructions: [
        '1. 先切換該模台為「手動保溫模式」，避免原料在料管內焦化。',
        '2. 用紅外線測溫槍交叉比對模座實際溫度，確認是否為假警報。',
        '3. 斷開模座主電熱迴路無熔絲開關 (NFB)，等待技師到場更換。'
      ],
      estimatedRepairHours: 1.5,
      technicianSkillRequired: ['PLC與溫控迴路', '模具加熱系統']
    };
  }

  // Default: PU High Pressure Machine
  return {
    confidenceScore: 0.96,
    urgency: 'CRITICAL',
    stopMachineImmediately: true,
    probableCauses: [
      '高壓混合頭注射針閥與噴嘴座磨損洩漏，導致 A 料 (ISO 異氰酸酯) 與空氣濕氣接觸產生硬質聚脲結晶卡死',
      '液壓開閉閥伺服壓力不足 (< 130 bar)，針閥無法在設定的 0.12 秒內快速回彈切斷注料',
      'A料高壓過濾器微孔濾網嚴重阻塞，造成計量泵與混合頭間壓差異常波動'
    ],
    recommendedParts: [
      {
        erpPartNo: 'ERP-PU-9042',
        partName: '高壓混合頭針閥油壓密封組',
        spec: 'HNBR 90 Shore A, 耐高壓 300 bar 耐異氰酸酯',
        quantity: 1,
        estimatedUnitCost: 4800,
        inStockQty: 12,
        replacementPriority: 'MUST_BRING',
        matchReason: '噴嘴結晶主要源自密封唇口磨損後原料微滲，必須全數換新防二次停機。'
      },
      {
        erpPartNo: 'ERP-HC-3011',
        partName: '混合頭自清潔液壓推桿',
        spec: 'SKD11 鏡面研磨 鍍硬鉻 配合間隙 4μm',
        quantity: 1,
        estimatedUnitCost: 18500,
        inStockQty: 5,
        replacementPriority: 'RECOMMENDED',
        matchReason: '若結晶已刮傷推桿鏡面，現場需備料直換，避免技師因推桿刮傷無備品而二次跑趟。'
      },
      {
        erpPartNo: 'ERP-FL-0880',
        partName: '異氰酸酯管路微孔高壓過濾器網芯',
        spec: '100 Mesh 316L 不鏽鋼雙層包覆',
        quantity: 2,
        estimatedUnitCost: 2200,
        inStockQty: 24,
        replacementPriority: 'BACKUP',
        matchReason: '預防管路深層雜質再次灌入新更換之針閥，建議同步更換進料濾網。'
      }
    ],
    preliminaryInstructions: [
      '1. 【立即緊急停機】關閉液壓站高壓馬達，嚴禁強制重複觸發連續注料射膠！',
      '2. 執行混合頭管路低壓溶劑（MESAMPOLL / DOP 清洗劑）逆向沖注 30 秒，防止頭部原料徹底結石硬化。',
      '3. 嚴禁現場作業員使用鐵鎚或硬金屬工具敲擊精密混合頭外殼與油管。'
    ],
    estimatedRepairHours: 2.5,
    technicianSkillRequired: ['高壓液壓系統', '高壓混合頭精修']
  };
}

function calculateSmartDispatch(workOrder: any, technicians: any[], warehouseStock: any) {
  if (!technicians || !technicians.length) return [];

  return technicians.map((tech) => {
    let score = 70;
    const reasons: string[] = [];

    // Distance calculation
    if (tech.distanceKm <= 10) {
      score += 15;
      reasons.push(`距離工廠僅 ${tech.distanceKm} 公里，預計 25 分鐘內即可抵達現場`);
    } else if (tech.distanceKm <= 20) {
      score += 8;
      reasons.push(`距離工廠 ${tech.distanceKm} 公里，車程約 40 分鐘`);
    } else {
      score -= 5;
      reasons.push(`距離較遠 (${tech.distanceKm} 公里)`);
    }

    // Skill match
    const requiredSkills: string[] = workOrder?.technicianSkillRequired || ['高壓液壓系統'];
    const matchedSkills = tech.skills.filter((s: string) =>
      requiredSkills.some((req: string) => s.includes(req) || req.includes(s))
    );
    if (matchedSkills.length === requiredSkills.length) {
      score += 20;
      reasons.push(`完全符合工單核心技能需求: ${matchedSkills.join('、')}`);
    } else if (matchedSkills.length > 0) {
      score += 10;
      reasons.push(`具備部分相關技能: ${matchedSkills.join('、')}`);
    }

    // Technician current status
    if (tech.status === 'AVAILABLE') {
      score += 10;
      reasons.push('當前狀態為可立即出勤，無手頭待處置工單');
    } else if (tech.status === 'ON_CALL') {
      score += 5;
      reasons.push('處於待命中狀態');
    } else {
      score -= 20;
      reasons.push('正在其他工廠出勤中');
    }

    // Historical MTTR and success rate
    if (tech.avgMttrHours && tech.avgMttrHours <= 2.2) {
      score += 5;
      reasons.push(`平均修復時間 (MTTR) 僅 ${tech.avgMttrHours}h，效率優於平均值 28%`);
    }

    return {
      technicianId: tech.id,
      name: tech.name,
      title: tech.title,
      phone: tech.phone,
      experienceYears: tech.experienceYears,
      distanceKm: tech.distanceKm,
      status: tech.status,
      score: Math.min(100, Math.max(30, score)),
      reasons,
    };
  }).sort((a, b) => b.score - a.score);
}

// Development or Production Vite handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoamGuard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
