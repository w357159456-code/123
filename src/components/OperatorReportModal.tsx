import React, { useState } from 'react';
import {
  X,
  QrCode,
  Camera,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Package,
  ShieldAlert,
  Loader2,
  HelpCircle,
  Upload,
} from 'lucide-react';
import { Equipment, ALARM_CODES, WorkOrder, RecommendedPart } from '../data/foamingDomain';

interface OperatorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  preselectedEquipmentId?: string;
  onSubmitWorkOrder: (newOrder: WorkOrder) => void;
}

export const OperatorReportModal: React.FC<OperatorReportModalProps> = ({
  isOpen,
  onClose,
  equipments,
  preselectedEquipmentId,
  onSubmitWorkOrder,
}) => {
  const [selectedEqId, setSelectedEqId] = useState<string>(
    preselectedEquipmentId || equipments[0]?.id || 'EQ-PU-01'
  );
  const [alarmCode, setAlarmCode] = useState<string>('E-042');
  const [faultLocation, setFaultLocation] = useState<string>('高壓混合頭 / 注射針閥');
  const [symptomDescription, setSymptomDescription] = useState<string>(
    '雙組份混料出料口嚴重滴料，停機時噴嘴周圍發現淡黃色異氰酸酯硬化結晶，注料壓力表劇烈震盪，成品發泡孔徑分佈不均且有塌陷現象。'
  );
  const [operatorName, setOperatorName] = useState<string>('現場領班 張志成');
  const [operatorPhone, setOperatorPhone] = useState<string>('0928-112-990');
  const [photoPreview, setPhotoPreview] = useState<string>(
    '/src/assets/images/foaming_mixing_head_fault_1793077913101.jpg'
  );
  const [isScanningQr, setIsScanningQr] = useState<boolean>(false);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const currentEquipment = equipments.find((e) => e.id === selectedEqId) || equipments[0];

  const handleSimulateQrScan = (targetEqId: string) => {
    setIsScanningQr(true);
    setTimeout(() => {
      setSelectedEqId(targetEqId);
      setIsScanningQr(false);
      // Auto-set alarm code matching equipment
      if (targetEqId.includes('EVA')) {
        setAlarmCode('E-021');
        setFaultLocation('模具溫控單元 / 電熱板');
        setSymptomDescription(
          '第3加熱區升溫停滯於 135°C 無法達到設定 175°C，模具開模時鞋底發泡成型不良且發泡倍率不足。'
        );
        setPhotoPreview('/src/assets/images/foaming_machine_overview_1793077913140.jpg');
      } else {
        setAlarmCode('E-042');
        setFaultLocation('高壓混合頭 / 注射針閥');
        setSymptomDescription(
          '雙組份混料出料口嚴重滴料，停機時噴嘴周圍發現淡黃色異氰酸酯硬化結晶，注料壓力表劇烈震盪，成品發泡孔徑分佈不均且有塌陷現象。'
        );
        setPhotoPreview('/src/assets/images/foaming_mixing_head_fault_1793077913101.jpg');
      }
      setDiagnosisResult(null);
    }, 700);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const runAiDiagnosis = async () => {
    setIsDiagnosing(true);
    setErrorMsg('');
    try {
      const payload = {
        machineId: currentEquipment.id,
        machineModel: currentEquipment.model,
        alarmCode,
        symptomDescription,
        faultLocation,
        imageFile: photoPreview,
        recentHistory: currentEquipment.recentHistory
          .map((h) => `${h.date}: ${h.description}`)
          .join('; '),
        availableBOM: currentEquipment.bom,
      };

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`診斷服務回應異常: ${res.status}`);
      }

      const data = await res.json();
      setDiagnosisResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '連線初判服務異常，請稍後再試');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleConfirmSubmit = () => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const orderId = `WO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(100 + Math.random() * 900))}`;

    const newOrder: WorkOrder = {
      id: orderId,
      equipmentId: currentEquipment.id,
      machineModel: currentEquipment.model,
      plantLocation: `${currentEquipment.factorySite} ${currentEquipment.productionLine}`,
      reportedAt: nowStr,
      reportedBy: operatorName,
      operatorContact: operatorPhone,
      alarmCode,
      faultLocation,
      symptomDescription,
      photoUrl: photoPreview,
      status: diagnosisResult ? 'AI_DIAGNOSED' : 'SUBMITTED',
      aiDiagnosis: diagnosisResult
        ? {
            confidenceScore: diagnosisResult.confidenceScore || 0.94,
            urgency: diagnosisResult.urgency || 'HIGH',
            stopMachineImmediately: !!diagnosisResult.stopMachineImmediately,
            probableCauses: diagnosisResult.probableCauses || [],
            recommendedParts: diagnosisResult.recommendedParts || [],
            preliminaryInstructions: diagnosisResult.preliminaryInstructions || [],
            estimatedRepairHours: diagnosisResult.estimatedRepairHours || 2.0,
            technicianSkillRequired: diagnosisResult.technicianSkillRequired || ['高壓液壓系統'],
            source: diagnosisResult.source || 'AI_DIAGNOSIS',
          }
        : undefined,
    };

    onSubmitWorkOrder(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                現場一機一碼 QR Code 結構化報修
              </h2>
              <div className="text-xs text-slate-500">
                符合 SOP 標準化：照片 + 警報碼 + 故障部位必填 · 多模態 AI 備料初判
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: 一機一碼 QR 識別 */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                01. 設備銘牌識別（一機一碼）
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">快速模擬掃碼：</span>
                <button
                  type="button"
                  onClick={() => handleSimulateQrScan('EQ-PU-01')}
                  className={`text-xs px-2.5 py-1 rounded border transition ${
                    selectedEqId === 'EQ-PU-01'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  PU-H600 高壓發泡機
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateQrScan('EQ-EVA-02')}
                  className={`text-xs px-2.5 py-1 rounded border transition ${
                    selectedEqId === 'EQ-EVA-02'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  EVA-800 射出發泡機
                </button>
              </div>
            </div>

            {isScanningQr ? (
              <div className="py-6 flex flex-col items-center justify-center text-slate-600 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs">光學識別機台 QR 銘牌中...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-slate-400">機型與序號</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {currentEquipment.model} ({currentEquipment.serialNumber})
                  </div>
                  <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                    QR: {currentEquipment.qrCodeId}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">所在位置與產線</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {currentEquipment.factorySite}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {currentEquipment.productionLine}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">累計運轉時數 / 歷史</div>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">
                    {currentEquipment.totalOperatingHours.toLocaleString()} 小時
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    近 60 天維修次數: {currentEquipment.recentHistory.length} 次
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: 報修 SOP 標準化必填表單 */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-4">
            <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
              02. 現場故障狀況回報（SOP 標準化欄位）
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  控制面板警報代碼 <span className="text-red-500">*</span>
                </label>
                <select
                  value={alarmCode}
                  onChange={(e) => {
                    setAlarmCode(e.target.value);
                    const def = ALARM_CODES.find((a) => a.code === e.target.value);
                    if (def) setFaultLocation(def.location);
                  }}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ALARM_CODES.map((alarm) => (
                    <option key={alarm.code} value={alarm.code}>
                      [{alarm.code}] {alarm.name}
                    </option>
                  ))}
                  <option value="CUSTOM">其他異常 / 無特定警報代碼</option>
                </select>
                <div className="text-[11px] text-slate-500 mt-1">
                  選擇後將自動比對設備 BOM 表與原廠 SOP
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  異常組件部位 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={faultLocation}
                  onChange={(e) => setFaultLocation(e.target.value)}
                  placeholder="如：高壓混合頭、計量泵、電熱板"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">
                  故障現象詳細描述 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">快速填入範例：</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSymptomDescription(
                        '雙組份混料出料口嚴重滴料，停機時噴嘴周圍發現淡黃色異氰酸酯硬化結晶，注料壓力表劇烈震盪，成品發泡孔徑分佈不均且有塌陷現象。'
                      )
                    }
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    PU混合頭結晶
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSymptomDescription(
                        'A料高壓計量泵輸出壓力波動超過 35 bar，回油管劇烈抖動，出料重量每模減少 12%，懷疑柱塞泵或進料過濾網堵塞。'
                      )
                    }
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    計量泵壓差
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSymptomDescription(
                        '第3加熱區升溫停滯於 135°C 無法達到設定 175°C，模具開模時鞋底發泡成型不良且發泡倍率不足。'
                      )
                    }
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    EVA模溫異常
                  </button>
                </div>
              </div>
              <textarea
                rows={3}
                value={symptomDescription}
                onChange={(e) => setSymptomDescription(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>

            {/* Photo / Inspection attachment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  現場照片 / 故障特寫上傳 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                    <Camera className="w-3.5 h-3.5 text-slate-600" />
                    <span>上傳照片/影片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoPreview(
                        '/src/assets/images/foaming_mixing_head_fault_1793077913101.jpg'
                      )
                    }
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    使用實拍結晶特寫
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoPreview(
                        '/src/assets/images/hydraulic_metering_pump_1793077913143.jpg'
                      )
                    }
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    使用計量泵照片
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  AI 視覺引擎將直接分析照片結晶色澤、油封滲漏痕跡與儀表指針
                </div>
              </div>

              {photoPreview && (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-100 flex items-center justify-center">
                  <img
                    src={photoPreview}
                    alt="Fault attachment"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-1 right-2 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded">
                    現場佐證影像 (已附加)
                  </div>
                </div>
              )}
            </div>

            {/* Reporter contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  現場報修人員 / 組長
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  現場分機 / 手機
                </label>
                <input
                  type="text"
                  value={operatorPhone}
                  onChange={(e) => setOperatorPhone(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-1.5 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 3: AI 多模態初判與 ERP 備料推薦 */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  03. AI 多模態初判與 ERP 零件料號精準推薦
                </div>
                <div className="text-[11px] text-slate-500">
                  即時推論可能故障組件、原因與必備料號，杜絕技師帶錯零件跑二趟
                </div>
              </div>

              <button
                type="button"
                onClick={runAiDiagnosis}
                disabled={isDiagnosing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
              >
                {isDiagnosing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI 多模態分析中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>執行 AI 故障初判</span>
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            {diagnosisResult && (
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 text-xs">
                {/* Emergency banner if needed */}
                {diagnosisResult.stopMachineImmediately && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-800">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs">【緊急應變警示】建議立即切斷高壓動力</div>
                      <div className="text-[11px] mt-0.5 text-red-700">
                        檢測到異氰酸酯可能硬化結塊或高壓液壓閥失衡，強制作動恐導致高壓計量泵齒軸燒毀或推桿刮傷，請作業員依照下方安全指引立即處置。
                      </div>
                    </div>
                  </div>
                )}

                {/* AI diagnosis overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg">
                  <div>
                    <span className="text-slate-400">推論置信度</span>
                    <div className="text-base font-bold text-slate-900 font-mono">
                      {Math.round((diagnosisResult.confidenceScore || 0.94) * 100)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">緊急程度</span>
                    <div className="text-xs font-bold text-red-700 mt-1">
                      {diagnosisResult.urgency === 'CRITICAL' ? '極高緊急 (嚴重停機)' : '高 (影響良率)'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">預估維修工時</span>
                    <div className="text-xs font-bold font-mono text-slate-900 mt-1">
                      約 {diagnosisResult.estimatedRepairHours || 2.5} 小時
                    </div>
                  </div>
                </div>

                {/* Probable causes */}
                <div>
                  <div className="font-bold text-slate-900 mb-1.5">
                    可能根本原因推論 (Root Cause Analysis):
                  </div>
                  <ul className="space-y-1 text-slate-700">
                    {diagnosisResult.probableCauses?.map((cause: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">·</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended ERP Parts */}
                <div>
                  <div className="font-bold text-slate-900 mb-2 flex items-center justify-between">
                    <span>AI 推薦必備 ERP 料號清單（已與發泡機 BOM 表連動）：</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      確認後將自動鎖定倉庫庫存
                    </span>
                  </div>

                  <div className="space-y-2">
                    {diagnosisResult.recommendedParts?.map((part: RecommendedPart, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 border border-slate-200 rounded-md bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-900 text-xs">
                              {part.erpPartNo}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {part.partName}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                part.replacementPriority === 'MUST_BRING'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {part.replacementPriority === 'MUST_BRING' ? '必備料號' : '建議備用'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            規格: {part.spec} · 需求數量: {part.quantity} 件
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1 italic">
                            理由: {part.matchReason}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono text-slate-900 font-bold text-xs">
                            NT$ {part.estimatedUnitCost.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-emerald-700">
                            倉庫現存: {part.inStockQty} 件 (充足)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preliminary operator instructions */}
                {diagnosisResult.preliminaryInstructions?.length > 0 && (
                  <div className="border-t border-slate-100 pt-3">
                    <div className="font-bold text-slate-900 mb-1">
                      現場作業員安全緊急處置 SOP（技師抵達前）：
                    </div>
                    <div className="bg-amber-50/70 border border-amber-200 rounded p-2.5 space-y-1 text-amber-900 text-[11px]">
                      {diagnosisResult.preliminaryInstructions.map((inst: string, idx: number) => (
                        <div key={idx}>{inst}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            人工邊界確認：送出後將由設備客服與主管審核備料料號才正式指派技師
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>確認送出報修工單</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
