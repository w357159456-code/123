import React, { useState } from 'react';
import {
  WorkOrder,
  Technician,
  TECHNICIANS_LIST,
  Equipment,
  RecommendedPart,
} from '../data/foamingDomain';
import {
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  UserCheck,
  Send,
  Sparkles,
  MapPin,
  ShieldCheck,
  FileCheck2,
  ExternalLink,
  Lock,
  Layers,
} from 'lucide-react';

interface SupervisorDispatchViewProps {
  workOrders: WorkOrder[];
  equipments: Equipment[];
  onApproveAndDispatch: (
    workOrderId: string,
    confirmedParts: any[],
    technician: Technician
  ) => void;
  onOpenSignModal: (workOrder: WorkOrder) => void;
  onSelectWorkOrderForDetails?: (orderId: string) => void;
  onOpenReportModal: () => void;
}

export const SupervisorDispatchView: React.FC<SupervisorDispatchViewProps> = ({
  workOrders,
  equipments,
  onApproveAndDispatch,
  onOpenSignModal,
  onOpenReportModal,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    workOrders[0]?.id || ''
  );
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('TECH-01');
  const [confirmedPartsState, setConfirmedPartsState] = useState<Record<string, boolean>>({});

  const currentOrder =
    workOrders.find((wo) => wo.id === selectedOrderId) || workOrders[0];

  const currentEquipment = equipments.find(
    (e) => e.id === currentOrder?.equipmentId
  );

  // Initialize confirmed parts toggle state when order changes
  React.useEffect(() => {
    if (currentOrder?.aiDiagnosis?.recommendedParts) {
      const initial: Record<string, boolean> = {};
      currentOrder.aiDiagnosis.recommendedParts.forEach((p) => {
        initial[p.erpPartNo] = true;
      });
      setConfirmedPartsState(initial);
    }
  }, [currentOrder?.id]);

  const filteredOrders = workOrders.filter((wo) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING_APPROVAL')
      return wo.status === 'SUBMITTED' || wo.status === 'AI_DIAGNOSED';
    if (filterStatus === 'IN_PROGRESS')
      return (
        wo.status === 'SUPERVISOR_APPROVED' ||
        wo.status === 'DISPATCHED' ||
        wo.status === 'ON_SITE_REPAIR'
      );
    if (filterStatus === 'PENDING_SIGN') return wo.status === 'TRIAL_INSPECTED';
    if (filterStatus === 'RESOLVED') return wo.status === 'RESOLVED';
    return true;
  });

  // Calculate smart dispatch scoring for technicians
  const rankedTechnicians = TECHNICIANS_LIST.map((tech) => {
    let score = 70;
    const notes: string[] = [];
    const requiredSkills =
      currentOrder?.aiDiagnosis?.technicianSkillRequired || ['高壓液壓系統'];

    // Distance factor
    if (tech.distanceKm <= 10) {
      score += 15;
      notes.push(`距離近 (${tech.distanceKm}km)，20分鐘內可抵達`);
    } else if (tech.distanceKm <= 20) {
      score += 8;
      notes.push(`車程約 35 分鐘 (${tech.distanceKm}km)`);
    } else {
      score -= 5;
      notes.push(`車程稍遠 (${tech.distanceKm}km)`);
    }

    // Skill match factor
    const matchCount = tech.skills.filter((sk) =>
      requiredSkills.some((req) => sk.includes(req) || req.includes(sk))
    ).length;
    if (matchCount >= 2) {
      score += 20;
      notes.push('精準掌握高壓混合頭與計量泵技術');
    } else if (matchCount === 1) {
      score += 10;
      notes.push('具備相應設備電控維修專長');
    }

    // Availability factor
    if (tech.status === 'AVAILABLE') {
      score += 10;
      notes.push('目前待命無手頭未結工單');
    } else {
      score -= 10;
      notes.push('目前正在其他產線');
    }

    // MTTR track record
    if (tech.avgMttrHours < 2.0) {
      score += 5;
      notes.push(`平均修復時間 (MTTR) 僅 ${tech.avgMttrHours}h`);
    }

    return {
      ...tech,
      calculatedScore: Math.min(100, Math.max(40, score)),
      rankingNotes: notes,
    };
  }).sort((a, b) => b.calculatedScore - a.calculatedScore);

  const handleExecuteDispatch = () => {
    if (!currentOrder) return;
    const targetTech =
      TECHNICIANS_LIST.find((t) => t.id === selectedTechnicianId) ||
      rankedTechnicians[0];

    // Filter confirmed parts
    const confirmedList =
      currentOrder.aiDiagnosis?.recommendedParts
        ?.filter((p) => confirmedPartsState[p.erpPartNo] !== false)
        .map((p) => ({
          erpPartNo: p.erpPartNo,
          partName: p.partName,
          quantity: p.quantity,
          unitCost: p.estimatedUnitCost,
          lockedFromWarehouse: currentEquipment?.factorySite
            ? `${currentEquipment.factorySite} 備品庫`
            : '總部中心庫 A區',
        })) || [];

    onApproveAndDispatch(currentOrder.id, confirmedList, targetTech);
  };

  const getStatusBadge = (status: WorkOrder['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="text-amber-700 font-medium">現場剛報修</span>;
      case 'AI_DIAGNOSED':
        return <span className="text-blue-700 font-medium">AI 已初判備料</span>;
      case 'SUPERVISOR_APPROVED':
        return <span className="text-indigo-700 font-medium">主管已核定備料</span>;
      case 'DISPATCHED':
        return <span className="text-purple-700 font-medium">技師出勤中</span>;
      case 'ON_SITE_REPAIR':
        return <span className="text-blue-800 font-medium">現場拆裝檢修</span>;
      case 'TRIAL_INSPECTED':
        return <span className="text-amber-800 font-medium font-semibold">待主管試模簽章</span>;
      case 'RESOLVED':
        return <span className="text-emerald-700 font-medium">已結案數位履歷</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Title & Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            發泡設備維修工單與智慧派工看板
          </h1>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>落實「人工邊界」：AI 推薦備料經主管確認後鎖庫</span>
            <span aria-hidden="true">·</span>
            <span>現場試模主管手寫簽核驗收</span>
          </div>
        </div>

        {/* Filter buttons - segmented control */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-xs self-start md:self-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 font-medium rounded-md transition ${
              filterStatus === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            全部工單 ({workOrders.length})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING_APPROVAL')}
            className={`px-3 py-1.5 font-medium rounded-md transition ${
              filterStatus === 'PENDING_APPROVAL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            待審核備料
          </button>
          <button
            onClick={() => setFilterStatus('IN_PROGRESS')}
            className={`px-3 py-1.5 font-medium rounded-md transition ${
              filterStatus === 'IN_PROGRESS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            處理中
          </button>
          <button
            onClick={() => setFilterStatus('PENDING_SIGN')}
            className={`px-3 py-1.5 font-medium rounded-md transition ${
              filterStatus === 'PENDING_SIGN'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            待試模簽名
          </button>
          <button
            onClick={() => setFilterStatus('RESOLVED')}
            className={`px-3 py-1.5 font-medium rounded-md transition ${
              filterStatus === 'RESOLVED'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            已結案
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Left Order List, Right Order Detail & Dispatch Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Work Orders List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
            <span>即時工單隊列 ({filteredOrders.length})</span>
            <button
              onClick={onOpenReportModal}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              + 模擬現場報修
            </button>
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-lg text-xs text-slate-500">
                目前此篩選條件下無工單紀錄。
              </div>
            ) : (
              filteredOrders.map((wo) => {
                const isSelected = wo.id === currentOrder?.id;
                return (
                  <div
                    key={wo.id}
                    onClick={() => setSelectedOrderId(wo.id)}
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
                      <span className="text-[11px]">
                        {getStatusBadge(wo.status)}
                      </span>
                    </div>

                    <div className="mt-1 font-semibold text-slate-800">
                      {wo.machineModel} · {wo.faultLocation}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {wo.symptomDescription}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span>{wo.alarmCode}</span>
                        <span>·</span>
                        <span>{wo.reportedAt.split(' ')[1]}</span>
                      </div>
                      <span className="text-slate-600 font-medium truncate max-w-[120px]">
                        {wo.reportedBy}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Work Order Detail & Dispatch Action Console (8 cols) */}
        {currentOrder ? (
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            {/* Header of selected work order */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {currentOrder.id}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {getStatusBadge(currentOrder.status)}
                  </span>
                  {currentOrder.aiDiagnosis?.urgency === 'CRITICAL' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800 font-semibold">
                      緊急停機
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  報修機台: {currentOrder.machineModel} ({currentOrder.equipmentId}) · 報修位置: {currentOrder.plantLocation}
                </div>
              </div>

              <div className="text-right text-xs shrink-0">
                <div className="text-slate-400">報修時間與聯絡人</div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {currentOrder.reportedBy} ({currentOrder.operatorContact})
                </div>
                <div className="font-mono text-slate-400 text-[11px] mt-0.5">
                  {currentOrder.reportedAt}
                </div>
              </div>
            </div>

            {/* Section 1: 現場異常現象與照片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 text-xs space-y-2">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  現場回報故障現象與警報碼
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">警報代碼:</span>
                    <span className="font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                      {currentOrder.alarmCode}
                    </span>
                    <span className="text-slate-500 ml-2">故障部位:</span>
                    <span className="font-medium text-slate-900">
                      {currentOrder.faultLocation}
                    </span>
                  </div>
                  <div className="text-slate-700 pt-1 leading-relaxed">
                    {currentOrder.symptomDescription}
                  </div>
                </div>
              </div>

              {/* Photo preview */}
              <div className="text-xs space-y-1">
                <div className="font-semibold text-slate-700">現場上傳佐證影像</div>
                <div className="rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-100 relative">
                  {currentOrder.photoUrl ? (
                    <img
                      src={currentOrder.photoUrl}
                      alt="Fault photo"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                      無附件照片
                    </div>
                  )}
                  <span className="absolute bottom-1 right-2 text-[10px] bg-slate-900/70 text-white px-1.5 py-0.5 rounded">
                    高解析特寫
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: AI 多模態初判與根本原因 */}
            {currentOrder.aiDiagnosis && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI 多模態故障初判與機理分析 (Gemini 3.8 Flash)
                  </div>
                  <div className="text-[11px] font-mono text-blue-800">
                    分析置信度: {Math.round(currentOrder.aiDiagnosis.confidenceScore * 100)}%
                  </div>
                </div>

                <div className="space-y-1 text-slate-700">
                  <div className="font-semibold text-slate-900">推論潛在根本原因：</div>
                  {currentOrder.aiDiagnosis.probableCauses.map((cause, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 pl-1">
                      <span className="text-blue-600 font-bold">·</span>
                      <span>{cause}</span>
                    </div>
                  ))}
                </div>

                {currentOrder.aiDiagnosis.preliminaryInstructions?.length > 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
                    <span className="font-bold">現場作業員安全處置指引：</span>{' '}
                    {currentOrder.aiDiagnosis.preliminaryInstructions[0]}
                  </div>
                )}
              </div>
            )}

            {/* Section 3: 人工邊界 1 — 客服 / 維修主管審核備料料號 (ERP 庫存鎖定) */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    人工邊界確認點：ERP 零件備料審核與庫存鎖定
                  </div>
                  <div className="text-[11px] text-slate-500">
                    客服 / 主管必須確認帶備零件後，才觸發派工與倉儲鎖庫（解決帶錯料率 25% 痛點）
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  連線 ERP 即時庫存正常
                </span>
              </div>

              {/* Recommended parts list with interactive checkboxes */}
              <div className="space-y-2">
                {currentOrder.aiDiagnosis?.recommendedParts?.map((part) => {
                  const isChecked = confirmedPartsState[part.erpPartNo] !== false;
                  return (
                    <div
                      key={part.erpPartNo}
                      className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                        isChecked
                          ? 'bg-white border-blue-300'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setConfirmedPartsState((prev) => ({
                              ...prev,
                              [part.erpPartNo]: e.target.checked,
                            }))
                          }
                          className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">
                              {part.erpPartNo}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {part.partName}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                              需求: {part.quantity} 件
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            規格: {part.spec}
                          </div>
                          <div className="text-[11px] text-blue-700 mt-0.5">
                            推薦理由: {part.matchReason}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-slate-900">
                          NT$ {part.estimatedUnitCost.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium">
                          現有庫存: {part.inStockQty} 件 (已準備)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 4: 智慧派工推薦 (Smart Dispatch Recommendation) */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    智慧派工推薦（依據技師位置、技能專長與歷史 MTTR 排序）
                  </div>
                  <div className="text-[11px] text-slate-500">
                    推薦最優到場技師，縮短平均等待時間 6 小時至 3.8 小時以內
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {rankedTechnicians.map((tech, rankIdx) => {
                  const isSelected = selectedTechnicianId === tech.id;
                  const isTopRanked = rankIdx === 0;

                  return (
                    <div
                      key={tech.id}
                      onClick={() => setSelectedTechnicianId(tech.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition relative ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {isTopRanked && (
                        <div className="absolute top-2 right-2 text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-semibold">
                          推薦首選 #1
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                          {tech.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{tech.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {tech.title} · {tech.experienceYears} 年資
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            距離工廠:
                          </span>
                          <span className="font-mono font-semibold text-slate-800">
                            {tech.distanceKm} km
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>平均修復 (MTTR):</span>
                          <span className="font-mono text-emerald-700 font-semibold">
                            {tech.avgMttrHours}h
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>一次修復率:</span>
                          <span className="font-mono text-slate-800">
                            {tech.firstTimeFixRate}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-blue-700 bg-blue-50/80 p-1.5 rounded">
                        {tech.rankingNotes[0] || '專長契合發泡設備維修'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dispatch Action Button */}
              {currentOrder.status === 'SUBMITTED' ||
              currentOrder.status === 'AI_DIAGNOSED' ? (
                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={handleExecuteDispatch}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>主管確認備料並立即派工 (通知技師)</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      已指派技師：
                      <strong className="text-slate-900">
                        {currentOrder.assignedTechnician?.name || '陳建宏'}
                      </strong>
                      （已鎖定備料，出勤中）
                    </span>
                  </div>
                  {currentOrder.status === 'TRIAL_INSPECTED' && (
                    <button
                      onClick={() => onOpenSignModal(currentOrder)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>主管現場試模簽核</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Section 5: 人工邊界 2 — 發泡試模驗收與結案簽章結果 (If inspected/resolved) */}
            {currentOrder.repairLog && (
              <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/20 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    人工邊界驗收點：發泡試模品質質檢與主管手寫電子簽章
                  </div>
                  <span className="font-mono text-emerald-800 text-[11px]">
                    完成時間: {currentOrder.repairLog.completedAt}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-emerald-100">
                  <div>
                    <div className="text-slate-400">發泡成型密度</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {currentOrder.repairLog.foamDensityGPerCm3} g/cm³
                    </div>
                    <div className="text-[10px] text-emerald-600">標準值內 (合格)</div>
                  </div>
                  <div>
                    <div className="text-slate-400">發泡硬度 (Asker C)</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {currentOrder.repairLog.foamHardnessAskerC} 度
                    </div>
                    <div className="text-[10px] text-emerald-600">回彈力符合規範</div>
                  </div>
                  <div>
                    <div className="text-slate-400">泡孔均勻度與外觀</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {currentOrder.repairLog.moldPoreUniformity === 'EXCELLENT'
                        ? '優良 (無塌陷針孔)'
                        : '合格'}
                    </div>
                    <div className="text-[10px] text-emerald-600">無溢料飛邊</div>
                  </div>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900">
                    現場維修總結：{currentOrder.repairLog.actionSummary}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    更換料號: {currentOrder.repairLog.replacedPartNos.join(', ')} · 實際修復工時: {currentOrder.repairLog.actualRepairHours} 小時
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-slate-600">
                    主管驗收評語：<strong>{currentOrder.repairLog.supervisorComments || '試模發泡合格，准予結案'}</strong>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">廠務主管電子簽章確認</div>
                    <div className="font-semibold text-slate-900 underline decoration-blue-500 font-mono text-sm">
                      {currentOrder.repairLog.supervisorSignerName || '廠務副理 許文豪'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
            請從左側點選工單查看詳細調度與備料資訊。
          </div>
        )}
      </div>
    </div>
  );
};
