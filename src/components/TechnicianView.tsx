import React, { useState } from 'react';
import { WorkOrder, Equipment } from '../data/foamingDomain';
import {
  Wrench,
  CheckSquare,
  Square,
  Navigation,
  Phone,
  Clock,
  Sparkles,
  Layers,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface TechnicianViewProps {
  workOrders: WorkOrder[];
  equipments: Equipment[];
  onUpdateRepairProgress: (
    workOrderId: string,
    newStatus: WorkOrder['status'],
    repairDetails?: any
  ) => void;
  onOpenSignModal: (workOrder: WorkOrder) => void;
}

export const TechnicianView: React.FC<TechnicianViewProps> = ({
  workOrders,
  equipments,
  onUpdateRepairProgress,
  onOpenSignModal,
}) => {
  // Find assigned orders for current technician
  const assignedOrders = workOrders.filter(
    (wo) =>
      wo.status === 'SUPERVISOR_APPROVED' ||
      wo.status === 'DISPATCHED' ||
      wo.status === 'ON_SITE_REPAIR' ||
      wo.status === 'TRIAL_INSPECTED'
  );

  const [activeOrderId, setActiveOrderId] = useState<string>(
    assignedOrders[0]?.id || workOrders[0]?.id || ''
  );

  const activeOrder =
    workOrders.find((w) => w.id === activeOrderId) || assignedOrders[0] || workOrders[0];

  const activeEquipment = equipments.find((e) => e.id === activeOrder?.equipmentId);

  // Checked parts checklist state
  const [checkedParts, setCheckedParts] = useState<Record<string, boolean>>({});

  // Trial form state
  const [actualHours, setActualHours] = useState<number>(2.0);
  const [repairNotes, setRepairNotes] = useState<string>(
    '現場拆卸混合頭，發現針閥密封圈老化微滲導致聚脲硬化塊，以超音波溶劑洗滌閥腔，更換全新 HNBR 耐壓密封組與推桿，重測回油壓力 160 bar 正常。'
  );
  const [density, setDensity] = useState<number>(0.048);
  const [hardness, setHardness] = useState<number>(54);
  const [uniformity, setUniformity] = useState<'EXCELLENT' | 'GOOD' | 'UNACCEPTABLE'>(
    'EXCELLENT'
  );

  const handleTogglePartCheck = (erpPartNo: string) => {
    setCheckedParts((prev) => ({
      ...prev,
      [erpPartNo]: !prev[erpPartNo],
    }));
  };

  const handleArriveSite = () => {
    if (!activeOrder) return;
    onUpdateRepairProgress(activeOrder.id, 'ON_SITE_REPAIR');
  };

  const handleSubmitTrialData = () => {
    if (!activeOrder) return;
    onUpdateRepairProgress(activeOrder.id, 'TRIAL_INSPECTED', {
      actualRepairHours: actualHours,
      actionSummary: repairNotes,
      replacedPartNos: activeOrder.confirmedParts?.map((p) => p.erpPartNo) || [
        'ERP-PU-9042',
      ],
      foamDensityGPerCm3: density,
      foamHardnessAskerC: hardness,
      moldPoreUniformity: uniformity,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          現場維修技師行動端作業台
        </h1>
        <div className="text-xs text-slate-500 mt-1">
          防呆備料出勤確認 · 現場更換處置與發泡試模檢測回報
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: My Dispatched Orders (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-700 px-1">
            指派給我的待出勤 / 處理中工單 ({assignedOrders.length})
          </div>

          <div className="space-y-2.5">
            {assignedOrders.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-lg text-xs text-slate-500">
                目前無正在執行的派工單，處於待命狀態。
              </div>
            ) : (
              assignedOrders.map((wo) => {
                const isSelected = wo.id === activeOrder?.id;
                return (
                  <div
                    key={wo.id}
                    onClick={() => setActiveOrderId(wo.id)}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">
                        {wo.id}
                      </span>
                      <span className="text-[11px] text-blue-700 font-medium">
                        {wo.status === 'SUPERVISOR_APPROVED' && '已派工待出發'}
                        {wo.status === 'DISPATCHED' && '路程出勤中'}
                        {wo.status === 'ON_SITE_REPAIR' && '現場維修中'}
                        {wo.status === 'TRIAL_INSPECTED' && '待主管試模驗收'}
                      </span>
                    </div>

                    <div className="mt-1 font-semibold text-slate-800">
                      {wo.machineModel} · {wo.faultLocation}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1">
                      {wo.plantLocation}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono">{wo.alarmCode}</span>
                      <span className="text-slate-600 font-medium">
                        報修人: {wo.reportedBy}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Technician Profile Card */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                陳
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">陳建宏 (技師)</div>
                <div className="text-slate-500 text-[11px]">
                  資深發泡設備技術專家 · 彰化服務據點
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
              <div className="bg-slate-50 p-2 rounded">
                <div className="text-slate-400 text-[10px]">平均 MTTR</div>
                <div className="font-mono font-bold text-slate-900 text-sm">1.8h</div>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <div className="text-slate-400 text-[10px]">一次修復率</div>
                <div className="font-mono font-bold text-emerald-700 text-sm">97.4%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Console (8 cols) */}
        {activeOrder ? (
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-mono text-slate-900">
                    {activeOrder.id}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                    {activeOrder.machineModel}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>廠區：{activeOrder.plantLocation}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-red-600 font-semibold">
                    警報 {activeOrder.alarmCode}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${activeOrder.operatorContact}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>致電領班 ({activeOrder.operatorContact})</span>
                </a>
              </div>
            </div>

            {/* Checklist: 防呆備料確認清單 (Critical for KPI: 降低帶錯料率) */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    出發前備料防呆核對清單（主管已核定與鎖庫）
                  </div>
                  <div className="text-[11px] text-slate-500">
                    出勤前請逐項打勾確認零件已取入工具車，杜絕二次到場
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  帶錯料率 KPI: &lt; 5%
                </span>
              </div>

              <div className="space-y-2">
                {(activeOrder.confirmedParts && activeOrder.confirmedParts.length > 0
                  ? activeOrder.confirmedParts
                  : activeOrder.aiDiagnosis?.recommendedParts || []
                ).map((part: any) => {
                  const isChecked = !!checkedParts[part.erpPartNo];
                  return (
                    <div
                      key={part.erpPartNo}
                      onClick={() => handleTogglePartCheck(part.erpPartNo)}
                      className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">
                              {part.erpPartNo}
                            </span>
                            <span className="font-semibold">{part.partName}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                              數量: {part.quantity} 件
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            儲位: {part.lockedFromWarehouse || '工廠備品庫 A-03 貨架'}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          isChecked
                            ? 'bg-emerald-200/60 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isChecked ? '已取料點檢' : '待點檢'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workflow Action State */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-4 text-xs">
              <div className="font-bold text-slate-900">現場維修處置流程節點</div>

              <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <span className="font-medium text-slate-800">
                    目前狀態：
                    {activeOrder.status === 'SUPERVISOR_APPROVED' && '主管已核發備料單，請取料後出發'}
                    {activeOrder.status === 'DISPATCHED' && '技師已出發在途中'}
                    {activeOrder.status === 'ON_SITE_REPAIR' && '已抵達現場，正在拆裝與更換組件'}
                    {activeOrder.status === 'TRIAL_INSPECTED' && '試模完成，等待主管簽核驗收'}
                    {activeOrder.status === 'RESOLVED' && '已驗收結案'}
                  </span>
                </div>

                {activeOrder.status === 'SUPERVISOR_APPROVED' && (
                  <button
                    onClick={() =>
                      onUpdateRepairProgress(activeOrder.id, 'DISPATCHED')
                    }
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    確認取料齊全 · 開始出勤
                  </button>
                )}

                {activeOrder.status === 'DISPATCHED' && (
                  <button
                    onClick={handleArriveSite}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>回報抵達現場 · 開始拆檢</span>
                  </button>
                )}
              </div>

              {/* If on-site repair: fill trial inspection data */}
              {(activeOrder.status === 'ON_SITE_REPAIR' ||
                activeOrder.status === 'TRIAL_INSPECTED') && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="font-semibold text-slate-900">
                    現場更換紀錄與發泡試模品管數據回填
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">
                      維修處置總結說明
                    </label>
                    <textarea
                      rows={2}
                      value={repairNotes}
                      onChange={(e) => setRepairNotes(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">
                        實際維修耗時 (小時)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={actualHours}
                        onChange={(e) => setActualHours(parseFloat(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">
                        試模發泡密度 (g/cm³)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={density}
                        onChange={(e) => setDensity(parseFloat(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">
                        發泡硬度 (Asker C 度)
                      </label>
                      <input
                        type="number"
                        value={hardness}
                        onChange={(e) => setHardness(parseInt(e.target.value, 10))}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">
                      發泡孔隙結構與外觀均勻度
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUniformity('EXCELLENT')}
                        className={`px-3 py-1.5 rounded-lg border font-medium ${
                          uniformity === 'EXCELLENT'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        優良 (閉孔均勻、無坍塌)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUniformity('GOOD')}
                        className={`px-3 py-1.5 rounded-lg border font-medium ${
                          uniformity === 'GOOD'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        良好 (微細氣泡符合標準)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUniformity('UNACCEPTABLE')}
                        className={`px-3 py-1.5 rounded-lg border font-medium ${
                          uniformity === 'UNACCEPTABLE'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        不合格 (有大氣泡或硬塊)
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleSubmitTrialData}
                      className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
                    >
                      儲存試模品管數據 · 呈報主管驗收
                    </button>
                    {activeOrder.status === 'TRIAL_INSPECTED' && (
                      <button
                        type="button"
                        onClick={() => onOpenSignModal(activeOrder)}
                        className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>呼叫主管電子簽章</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
            目前無選取的派工單。
          </div>
        )}
      </div>
    </div>
  );
};
