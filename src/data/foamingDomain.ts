export interface ErpBomItem {
  erpPartNo: string;
  partName: string;
  category: 'MIX_HEAD' | 'PUMP' | 'HYDRAULIC' | 'HEATER' | 'SENSOR' | 'VALVE';
  spec: string;
  inStockQty: number;
  safetyStock: number;
  unitCost: number;
  warehouseLocation: string;
  lastUpdated: string;
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  factorySite: string;
  productionLine: string;
  qrCodeId: string;
  status: 'RUNNING' | 'FAULT_STOPPED' | 'MAINTENANCE_STANDBY' | 'INSPECTION';
  installDate: string;
  totalOperatingHours: number;
  image: string;
  bom: ErpBomItem[];
  recentHistory: {
    date: string;
    description: string;
    replacedParts: string[];
    technician: string;
    resolvedHours: number;
  }[];
}

export interface AlarmDefinition {
  code: string;
  name: string;
  applicableModels: string[];
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  location: string;
  sopQuickCheck: string;
}

export interface Technician {
  id: string;
  name: string;
  title: string;
  phone: string;
  avatar: string;
  experienceYears: number;
  distanceKm: number;
  status: 'AVAILABLE' | 'ON_CALL' | 'BUSY';
  skills: string[];
  avgMttrHours: number;
  firstTimeFixRate: number; // e.g. 96.5%
  currentLocation: string;
}

export interface RecommendedPart {
  erpPartNo: string;
  partName: string;
  spec: string;
  quantity: number;
  estimatedUnitCost: number;
  inStockQty: number;
  replacementPriority: 'MUST_BRING' | 'RECOMMENDED' | 'BACKUP';
  matchReason: string;
}

export interface WorkOrder {
  id: string;
  equipmentId: string;
  machineModel: string;
  plantLocation: string;
  reportedAt: string;
  reportedBy: string;
  operatorContact: string;
  alarmCode: string;
  faultLocation: string;
  symptomDescription: string;
  photoUrl?: string;
  status:
    | 'SUBMITTED' // 現場作業員剛掃碼送出報修
    | 'AI_DIAGNOSED' // AI 多模態初判完成 (推薦料號生成)
    | 'SUPERVISOR_APPROVED' // 客服/組長確認料號，鎖定 ERP 庫存並派工
    | 'DISPATCHED' // 技師出發
    | 'ON_SITE_REPAIR' // 現場維修中
    | 'TRIAL_INSPECTED' // 發泡試模驗收與主管簽核
    | 'RESOLVED'; // 結案數位履歷存檔
  aiDiagnosis?: {
    confidenceScore: number;
    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    stopMachineImmediately: boolean;
    probableCauses: string[];
    recommendedParts: RecommendedPart[];
    preliminaryInstructions: string[];
    estimatedRepairHours: number;
    technicianSkillRequired: string[];
    source: string;
  };
  assignedTechnician?: {
    technicianId: string;
    name: string;
    phone: string;
    dispatchedAt: string;
    etaMinutes: number;
  };
  confirmedParts?: {
    erpPartNo: string;
    partName: string;
    quantity: number;
    unitCost: number;
    lockedFromWarehouse: string;
  }[];
  repairLog?: {
    completedAt: string;
    actualRepairHours: number;
    actionSummary: string;
    replacedPartNos: string[];
    foamDensityGPerCm3: number; // e.g. 0.045
    foamHardnessAskerC: number; // e.g. 52
    moldPoreUniformity: 'EXCELLENT' | 'GOOD' | 'UNACCEPTABLE';
    supervisorSignature?: string; // Data URL or supervisor name
    supervisorSignerName?: string;
    supervisorComments?: string;
  };
}

export const INITIAL_EQUIPMENTS: Equipment[] = [
  {
    id: 'EQ-PU-01',
    name: '雙組份高壓聚氨酯發泡機',
    model: 'PU-H600-PRO',
    serialNumber: '2024-PU-8821',
    factorySite: '彰化鹿港廠',
    productionLine: 'A棟車用座椅與方向盤發泡線',
    qrCodeId: 'FOAM-QR-PU-H600-01',
    status: 'FAULT_STOPPED',
    installDate: '2024-03-12',
    totalOperatingHours: 4820,
    image: '/src/assets/images/foaming_machine_overview_1793077913140.jpg',
    bom: [
      {
        erpPartNo: 'ERP-PU-9042',
        partName: '高壓混合頭針閥油壓密封組',
        category: 'MIX_HEAD',
        spec: 'HNBR 90 Shore A, 耐高壓 300 bar 耐異氰酸酯腐蝕',
        inStockQty: 12,
        safetyStock: 4,
        unitCost: 4800,
        warehouseLocation: '鹿港廠 A-03 貨架',
        lastUpdated: '2026-10-20',
      },
      {
        erpPartNo: 'ERP-HC-3011',
        partName: '混合頭自清潔液壓推桿',
        category: 'MIX_HEAD',
        spec: 'SKD11 鏡面研磨 鍍硬鉻 配合間隙 4μm',
        inStockQty: 5,
        safetyStock: 2,
        unitCost: 18500,
        warehouseLocation: '鹿港廠 A-04 貨架',
        lastUpdated: '2026-10-18',
      },
      {
        erpPartNo: 'ERP-PM-1250',
        partName: 'A料(ISO)軸向柱塞高壓計量泵體',
        category: 'PUMP',
        spec: 'REXROTH A2VK12 容積 12cc/rev 最高壓 250 bar',
        inStockQty: 3,
        safetyStock: 1,
        unitCost: 68000,
        warehouseLocation: '總部中心庫 B-01',
        lastUpdated: '2026-10-15',
      },
      {
        erpPartNo: 'ERP-FL-0880',
        partName: '異氰酸酯管路微孔高壓過濾器網芯',
        category: 'VALVE',
        spec: '100 Mesh 316L 不鏽鋼雙層包覆',
        inStockQty: 24,
        safetyStock: 8,
        unitCost: 2200,
        warehouseLocation: '鹿港廠 A-02 貨架',
        lastUpdated: '2026-10-22',
      },
      {
        erpPartNo: 'ERP-HY-5520',
        partName: '伺服比例方向控制閥組',
        category: 'HYDRAULIC',
        spec: 'Rexroth 4WREE 100 bar 液壓伺服換向閥',
        inStockQty: 4,
        safetyStock: 2,
        unitCost: 28000,
        warehouseLocation: '鹿港廠 A-07 貨架',
        lastUpdated: '2026-10-10',
      },
    ],
    recentHistory: [
      {
        date: '2026-09-14',
        description: '更換 A 料進料高壓微孔過濾網芯，排除管路微壓差波動',
        replacedParts: ['ERP-FL-0880'],
        technician: '陳建宏',
        resolvedHours: 1.2,
      },
      {
        date: '2026-06-30',
        description: '季度預防保養：更換液壓循環油與冷卻系統過濾片',
        replacedParts: ['ERP-HY-5520'],
        technician: '黃俊維',
        resolvedHours: 3.0,
      },
    ],
  },
  {
    id: 'EQ-EVA-02',
    name: 'EVA 全自動射出發泡成型機',
    model: 'EVA-800-SPEED',
    serialNumber: '2023-EVA-5519',
    factorySite: '桃園龜山廠',
    productionLine: 'B棟運動鞋中底二次加硫成型線',
    qrCodeId: 'FOAM-QR-EVA-800-02',
    status: 'RUNNING',
    installDate: '2023-08-19',
    totalOperatingHours: 7150,
    image: '/src/assets/images/foaming_machine_overview_1793077913140.jpg',
    bom: [
      {
        erpPartNo: 'ERP-HT-2200',
        partName: '模具合金加熱棒組',
        category: 'HEATER',
        spec: '220V 1500W φ16x300mm SUS321 耐高溫加熱',
        inStockQty: 18,
        safetyStock: 6,
        unitCost: 1200,
        warehouseLocation: '龜山廠 C-01 貨架',
        lastUpdated: '2026-10-24',
      },
      {
        erpPartNo: 'ERP-TC-0902',
        partName: 'K型熱電偶感溫補償導線',
        category: 'SENSOR',
        spec: 'Class 1 測溫精度 ±1.5°C 鐵氟龍屏蔽耐彎折',
        inStockQty: 30,
        safetyStock: 10,
        unitCost: 850,
        warehouseLocation: '龜山廠 C-02 貨架',
        lastUpdated: '2026-10-21',
      },
      {
        erpPartNo: 'ERP-SV-4410',
        partName: '射出螺桿端止逆環閥組',
        category: 'VALVE',
        spec: '雙合金耐磨耐腐蝕 φ45mm 射膠止回',
        inStockQty: 2,
        safetyStock: 1,
        unitCost: 32000,
        warehouseLocation: '總部中心庫 A-09',
        lastUpdated: '2026-10-11',
      },
      {
        erpPartNo: 'ERP-PL-1105',
        partName: '模具鎖模氣缸耐磨導向套',
        category: 'HYDRAULIC',
        spec: '銅合金自潤滑 φ90mm 高剛性耐磨',
        inStockQty: 8,
        safetyStock: 3,
        unitCost: 3600,
        warehouseLocation: '龜山廠 C-05 貨架',
        lastUpdated: '2026-10-19',
      },
    ],
    recentHistory: [
      {
        date: '2026-08-05',
        description: '校正射出第2段壓力感測器，更換密封油環',
        replacedParts: ['ERP-PL-1105'],
        technician: '林家豪',
        resolvedHours: 1.5,
      },
    ],
  },
  {
    id: 'EQ-PU-03',
    name: '低壓PU軟質海綿連續發泡機',
    model: 'PU-LP300-CONT',
    serialNumber: '2022-LP-3304',
    factorySite: '台南安平廠',
    productionLine: 'C棟隔音保溫泡棉連續生產線',
    qrCodeId: 'FOAM-QR-PU-LP300-03',
    status: 'RUNNING',
    installDate: '2022-11-04',
    totalOperatingHours: 9400,
    image: '/src/assets/images/foaming_machine_overview_1793077913140.jpg',
    bom: [
      {
        erpPartNo: 'ERP-PU-9042',
        partName: '低壓攪拌齒輪密封環',
        category: 'MIX_HEAD',
        spec: 'PTFE + 碳纖複合材質 耐磨密封',
        inStockQty: 8,
        safetyStock: 3,
        unitCost: 2600,
        warehouseLocation: '安平廠 B-03 貨架',
        lastUpdated: '2026-10-14',
      },
    ],
    recentHistory: [],
  },
];

export const ALARM_CODES: AlarmDefinition[] = [
  {
    code: 'E-042',
    name: '高壓混合頭注射閥閉鎖逾時 / 壓力異常',
    applicableModels: ['PU-H600-PRO', 'PU-LP300-CONT'],
    severity: 'CRITICAL',
    location: '高壓混合頭 / 注射針閥',
    sopQuickCheck: '關閉高壓幫浦，檢查出料噴嘴是否有異氰酸酯硬化結晶，不可連續強制作動以免推桿拉傷。',
  },
  {
    code: 'E-108',
    name: 'A料(ISO)高壓計量泵吐出壓力失衡 (> 35 bar)',
    applicableModels: ['PU-H600-PRO'],
    severity: 'CRITICAL',
    location: 'A料(ISO)高壓計量泵組',
    sopQuickCheck: '立即切換至低壓回流循環，檢查進料微孔過濾網是否飽和結晶堵塞。',
  },
  {
    code: 'E-021',
    name: '模具第3區加熱板升溫停滯 / 感溫迴路開路',
    applicableModels: ['EVA-800-SPEED'],
    severity: 'HIGH',
    location: '模具溫控單元 / 電熱板',
    sopQuickCheck: '切換手動保溫，紅外線測溫槍比對實測溫差，檢查電熱管端子阻抗。',
  },
  {
    code: 'E-088',
    name: '模具鎖模保壓不足致溢料飛邊',
    applicableModels: ['PU-H600-PRO', 'EVA-800-SPEED'],
    severity: 'MEDIUM',
    location: '液壓鎖模站 / 比例方向閥',
    sopQuickCheck: '檢查鎖模液壓站油位與比例方向閥回饋電壓是否偏移。',
  },
];

export const TECHNICIANS_LIST: Technician[] = [
  {
    id: 'TECH-01',
    name: '陳建宏',
    title: '資深發泡設備技術專家',
    phone: '0912-384-912',
    avatar: '陳',
    experienceYears: 12,
    distanceKm: 8,
    status: 'AVAILABLE',
    skills: ['高壓液壓系統', '高壓混合頭精修', '計量泵精修', '成型工藝調試'],
    avgMttrHours: 1.8,
    firstTimeFixRate: 97.4,
    currentLocation: '彰化服務據點 (距鹿港廠 8km)',
  },
  {
    id: 'TECH-02',
    name: '林家豪',
    title: '機電自動化維修工程師',
    phone: '0935-812-704',
    avatar: '林',
    experienceYears: 7,
    distanceKm: 15,
    status: 'AVAILABLE',
    skills: ['PLC與溫控迴路', '模具加熱系統', '伺服驅動器', '電控配線'],
    avgMttrHours: 2.1,
    firstTimeFixRate: 94.8,
    currentLocation: '台中工業區維修部 (距鹿港廠 15km)',
  },
  {
    id: 'TECH-03',
    name: '黃俊維',
    title: '液壓機械裝配技師',
    phone: '0978-654-219',
    avatar: '黃',
    experienceYears: 4,
    distanceKm: 24,
    status: 'ON_CALL',
    skills: ['液壓閥件組裝', '機械油封更換', '管路清洗'],
    avgMttrHours: 2.6,
    firstTimeFixRate: 91.2,
    currentLocation: '南投草屯據點 (距鹿港廠 24km)',
  },
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-20261026-001',
    equipmentId: 'EQ-PU-01',
    machineModel: 'PU-H600-PRO',
    plantLocation: '彰化鹿港廠 A棟產線',
    reportedAt: '2026-10-26 19:40',
    reportedBy: '現場領班 張志成',
    operatorContact: '0928-112-990',
    alarmCode: 'E-042',
    faultLocation: '高壓混合頭 / 注射針閥',
    symptomDescription: '雙組份混料出料口嚴重滴料，停機時噴嘴周圍發現淡黃色異氰酸酯硬化結晶，注料壓力表劇烈震盪，成品發泡孔徑分佈不均且有塌陷現象。',
    photoUrl: '/src/assets/images/foaming_mixing_head_fault_1793077913101.jpg',
    status: 'TRIAL_INSPECTED',
    aiDiagnosis: {
      confidenceScore: 0.96,
      urgency: 'CRITICAL',
      stopMachineImmediately: true,
      probableCauses: [
        '高壓混合頭注射針閥與噴嘴座密封磨損洩漏，導致 A 料 (ISO 異氰酸酯) 與空氣濕氣接觸產生硬質聚脲結晶卡死',
        '液壓開閉閥伺服壓力不足 (< 130 bar)，針閥無法在設定的 0.12 秒內快速回彈切斷注料',
        'A料高壓過濾器微孔濾網嚴重阻塞，造成計量泵與混合頭間壓差異常波動',
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
          matchReason: '噴嘴結晶主要源自密封唇口磨損後原料微滲，必須全數換新防二次停機。',
        },
        {
          erpPartNo: 'ERP-HC-3011',
          partName: '混合頭自清潔液壓推桿',
          spec: 'SKD11 鏡面研磨 鍍硬鉻 配合間隙 4μm',
          quantity: 1,
          estimatedUnitCost: 18500,
          inStockQty: 5,
          replacementPriority: 'RECOMMENDED',
          matchReason: '若結晶已刮傷推桿鏡面，現場需備料直換，避免技師因推桿刮傷無備品而二次跑趟。',
        },
      ],
      preliminaryInstructions: [
        '1. 【立即緊急停機】關閉液壓站高壓馬達，嚴禁強制重複觸發連續注料射膠！',
        '2. 執行混合頭管路低壓溶劑（MESAMPOLL / DOP 清洗劑）逆向沖注 30 秒，防止頭部原料徹底結石硬化。',
        '3. 嚴禁現場作業員使用鐵鎚或硬金屬工具敲擊精密混合頭外殼與油管。',
      ],
      estimatedRepairHours: 2.5,
      technicianSkillRequired: ['高壓液壓系統', '高壓混合頭精修'],
      source: 'GEMINI_MULTIMODAL_AI',
    },
    assignedTechnician: {
      technicianId: 'TECH-01',
      name: '陳建宏',
      phone: '0912-384-912',
      dispatchedAt: '2026-10-26 20:05',
      etaMinutes: 20,
    },
    confirmedParts: [
      {
        erpPartNo: 'ERP-PU-9042',
        partName: '高壓混合頭針閥油壓密封組',
        quantity: 1,
        unitCost: 4800,
        lockedFromWarehouse: '鹿港廠 A-03 貨架',
      },
      {
        erpPartNo: 'ERP-HC-3011',
        partName: '混合頭自清潔液壓推桿',
        quantity: 1,
        unitCost: 18500,
        lockedFromWarehouse: '鹿港廠 A-04 貨架',
      },
    ],
    repairLog: {
      completedAt: '2026-10-26 22:05',
      actualRepairHours: 2.0,
      actionSummary: '現場拆卸混合頭，發現針閥密封圈老化微滲導致聚脲硬化塊，以超音波溶劑洗滌閥腔，更換全新 HNBR 耐壓密封組與推桿，重測回油壓力 160 bar 正常。',
      replacedPartNos: ['ERP-PU-9042', 'ERP-HC-3011'],
      foamDensityGPerCm3: 0.048,
      foamHardnessAskerC: 54,
      moldPoreUniformity: 'EXCELLENT',
      supervisorSignerName: '廠務副理 許文豪',
      supervisorComments: '試模 5 模發泡均勻無氣孔坍塌，回油保壓穩定，准予結案歸檔。',
    },
  },
  {
    id: 'WO-20261025-004',
    equipmentId: 'EQ-EVA-02',
    machineModel: 'EVA-800-SPEED',
    plantLocation: '桃園龜山廠 B棟產線',
    reportedAt: '2026-10-25 14:15',
    reportedBy: '產線副組長 李冠宇',
    operatorContact: '0918-223-455',
    alarmCode: 'E-021',
    faultLocation: '模具溫控單元 / 電熱板',
    symptomDescription: '第3加熱區升溫停滯於 135°C 無法達到設定 175°C，模具開模時鞋底發泡成型不良且發泡倍率不足。',
    status: 'RESOLVED',
    aiDiagnosis: {
      confidenceScore: 0.94,
      urgency: 'HIGH',
      stopMachineImmediately: false,
      probableCauses: [
        '第3區合金電熱棒內部發熱線圈斷路，導致模溫熱平衡崩潰',
        'K型感溫補償線接點受機械震動鬆脫或氧化',
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
          matchReason: '感溫斷路與升溫停滯特徵，高機率需即時抽換加熱棒。',
        },
      ],
      preliminaryInstructions: [
        '1. 鎖模切至低溫保溫模式。',
        '2. 測溫槍確認實際模溫，避免誤判。',
      ],
      estimatedRepairHours: 1.5,
      technicianSkillRequired: ['PLC與溫控迴路', '模具加熱系統'],
      source: 'GEMINI_MULTIMODAL_AI',
    },
    assignedTechnician: {
      technicianId: 'TECH-02',
      name: '林家豪',
      phone: '0935-812-704',
      dispatchedAt: '2026-10-25 14:30',
      etaMinutes: 25,
    },
    confirmedParts: [
      {
        erpPartNo: 'ERP-HT-2200',
        partName: '模具合金加熱棒組',
        quantity: 2,
        unitCost: 1200,
        lockedFromWarehouse: '龜山廠 C-01 貨架',
      },
    ],
    repairLog: {
      completedAt: '2026-10-25 16:10',
      actualRepairHours: 1.6,
      actionSummary: '三用電表測得第3區加熱棒呈現斷路，現場即時抽換 2 支全新加熱棒，升溫測試 175°C 正常，試模發泡倍率達 1.65 標竿。',
      replacedPartNos: ['ERP-HT-2200'],
      foamDensityGPerCm3: 0.185,
      foamHardnessAskerC: 48,
      moldPoreUniformity: 'EXCELLENT',
      supervisorSignerName: '維修主管 吳俊良',
      supervisorComments: '備料準確一次修復，無二次停機。',
    },
  },
];
