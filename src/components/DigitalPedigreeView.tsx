import React, { useState } from 'react';
import { Equipment, ErpBomItem, WorkOrder } from '../data/foamingDomain';
import {
  QrCode,
  Layers,
  History,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Clock,
  Printer,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface DigitalPedigreeViewProps {
  equipments: Equipment[];
  workOrders: WorkOrder[];
  onOpenReportForMachine: (equipmentId: string) => void;
}

export const DigitalPedigreeView: React.FC<DigitalPedigreeViewProps> = ({
  equipments,
  workOrders,
  onOpenReportForMachine,
}) => {
  const [selectedEqId, setSelectedEqId] = useState<string>(equipments[0]?.id || 'EQ-PU-01');
  const [activeTab, setActiveTab] = useState<'BOM' | 'HISTORY' | 'QR_BADGE'>('BOM');

  const currentEquipment =
    equipments.find((e) => e.id === selectedEqId) || equipments[0];

  // Related work orders from system
  const machineOrders = workOrders.filter(
    (wo) => wo.equipmentId === currentEquipment.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            發泡設備主主檔與數位履歷庫
          </h1>
          <div className="text-xs text-slate-500 mt-1">
            落實「一機一碼」銘牌與 ERP BOM 零件連動 · 徹底解決手寫紙本履歷散落問題
          </div>
        </div>

        {/* Machine Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">切換設備主檔：</span>
          <select
            value={selectedEqId}
            onChange={(e) => setSelectedEqId(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name} ({eq.model}) - {eq.factorySite}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Identity Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 rounded-lg overflow-hidden border border-slate-200 h-44 bg-slate-100">
            <img
              src={currentEquipment.image}
              alt={currentEquipment.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-semibold">
                  {currentEquipment.id}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {currentEquipment.name} ({currentEquipment.model})
                </h2>
                <div className="text-xs text-slate-500">
                  出廠序號: {currentEquipment.serialNumber} · 安裝上線: {currentEquipment.installDate}
                </div>
              </div>

              <button
                onClick={() => onOpenReportForMachine(currentEquipment.id)}
                className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>以此機台發起報修</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[10px]">所在廠區與產線</div>
                <div className="font-semibold text-slate-800 mt-0.5 truncate">
                  {currentEquipment.factorySite}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentEquipment.productionLine}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[10px]">累計運轉時數</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5 text-sm">
                  {currentEquipment.totalOperatingHours.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500 ml-1">h</span>
                </div>
                <div className="text-[11px] text-slate-500">高壓泵運轉良好</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[10px]">機台運轉狀態</div>
                <div className="font-semibold mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentEquipment.status === 'RUNNING'
                        ? 'bg-emerald-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span
                    className={
                      currentEquipment.status === 'RUNNING'
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }
                  >
                    {currentEquipment.status === 'RUNNING' ? '正常生產運轉' : '停機報修中'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">即時感測器連線</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[10px]">一機一碼 QR ID</div>
                <div className="font-mono font-bold text-blue-700 mt-0.5 text-xs truncate">
                  {currentEquipment.qrCodeId}
                </div>
                <div className="text-[11px] text-slate-500">掃碼帶入履歷</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit mb-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('BOM')}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === 'BOM'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          清洗統一後之 ERP BOM 零件對照表 ({currentEquipment.bom.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === 'HISTORY'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          完整維修數位履歷與成型試模紀錄 ({currentEquipment.recentHistory.length + machineOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('QR_BADGE')}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === 'QR_BADGE'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          機台實體 QR Code 銘牌預覽與列印
        </button>
      </div>

      {/* Tab 1: Cleaned ERP BOM Master List */}
      {activeTab === 'BOM' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">
                發泡設備核心組件 ERP 零件主資料清單
              </div>
              <div className="text-[11px] text-slate-500">
                徹底解決根本原因第 4 點「主資料混亂：設備料號未與 ERP 庫存連動」問題
              </div>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono font-medium">
              ERP 系統同步率 100%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">ERP 料號</th>
                  <th className="px-4 py-3">組件品名</th>
                  <th className="px-4 py-3">原廠規格型號</th>
                  <th className="px-4 py-3 text-right">即時庫存</th>
                  <th className="px-4 py-3 text-right">安全庫存</th>
                  <th className="px-4 py-3 text-right">標準單價</th>
                  <th className="px-4 py-3">倉庫儲位</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentEquipment.bom.map((part) => (
                  <tr key={part.erpPartNo} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-mono font-bold text-blue-900">
                      {part.erpPartNo}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {part.partName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                      {part.spec}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      <span
                        className={
                          part.inStockQty <= part.safetyStock
                            ? 'text-amber-600 font-bold'
                            : 'text-emerald-700'
                        }
                      >
                        {part.inStockQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                      {part.safetyStock}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-800">
                      NT$ {part.unitCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {part.warehouseLocation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Chronological Digital Maintenance Pedigree */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              該機台生命週期維修與保養數位履歷 (Audit Trail)
            </h3>
            <div className="text-xs text-slate-500">
              永久留存更換料號、處置作法與試模成型品質，杜絕重複故障 (30天內重複故障率從 18% 降至 2.4%)
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {/* Live Work Orders on this machine */}
            {machineOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-lg border border-blue-200 bg-blue-50/20 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-900">{order.id}</span>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      即時工單 · {order.status}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    報修時間: {order.reportedAt}
                  </span>
                </div>

                <div className="text-slate-800">
                  <strong>故障現象：</strong>
                  {order.symptomDescription}
                </div>

                {order.repairLog && (
                  <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
                    <div className="text-slate-700">
                      <strong>維修處置：</strong>
                      {order.repairLog.actionSummary}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      更換料號: {order.repairLog.replacedPartNos.join(', ')} · 耗時: {order.repairLog.actualRepairHours}h · 試模密度: {order.repairLog.foamDensityGPerCm3} g/cm³ · 硬度: {order.repairLog.foamHardnessAskerC} 度
                    </div>
                    <div className="text-emerald-700 font-medium text-[11px]">
                      驗收簽署主管: {order.repairLog.supervisorSignerName} ({order.repairLog.supervisorComments})
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Historical Maintenance Records */}
            {currentEquipment.recentHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-slate-700">
                    歷史紀錄 · {item.date}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    主修技師: {item.technician} · 耗時 {item.resolvedHours}h
                  </span>
                </div>
                <div className="text-slate-800">{item.description}</div>
                <div className="text-[11px] text-slate-500">
                  更換組件料號: <span className="font-mono font-bold text-slate-700">{item.replacedParts.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Machine QR Code Physical Badge Preview */}
      {activeTab === 'QR_BADGE' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="max-w-md mx-auto border-2 border-slate-800 rounded-xl p-6 bg-amber-50/30 text-center space-y-4 shadow-sm">
            <div className="text-xs font-bold tracking-widest text-slate-700 uppercase">
              FOAMGUARD INDUSTRIAL EQUIPMENT ID
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-300 inline-block shadow-xs">
              <QrCode className="w-32 h-32 text-slate-900 mx-auto" />
              <div className="font-mono text-xs font-bold text-slate-800 mt-2">
                {currentEquipment.qrCodeId}
              </div>
            </div>

            <div>
              <div className="text-base font-bold text-slate-900">
                {currentEquipment.name}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                型號: {currentEquipment.model} · 序號: {currentEquipment.serialNumber}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                安裝位址: {currentEquipment.factorySite} ({currentEquipment.productionLine})
              </div>
            </div>

            <div className="p-2.5 bg-yellow-100/70 border border-yellow-300 rounded text-amber-900 text-[11px]">
              「一機一碼」防呆銘牌：現場遇任何漏料、壓力異常或異音，手機掃碼即刻觸發多模態初判與精準備料！
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
