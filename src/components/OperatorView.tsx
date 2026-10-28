import React from 'react';
import { Equipment } from '../data/foamingDomain';
import {
  QrCode,
  Camera,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Smartphone,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface OperatorViewProps {
  equipments: Equipment[];
  onOpenReportModalWithMachine: (equipmentId: string) => void;
}

export const OperatorView: React.FC<OperatorViewProps> = ({
  equipments,
  onOpenReportModalWithMachine,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          現場作業員 / 組長行動端報修工作台
        </h1>
        <div className="text-xs text-slate-500 mt-1">
          手機無須安裝 App · 掃描發泡機銘牌 QR Code 即刻帶出機台主資料與報修 SOP
        </div>
      </div>

      {/* Hero Banner: Realistic Factory Operator Experience */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 h-64 lg:h-auto relative bg-slate-100">
            <img
              src="/src/assets/images/plant_operator_scan_1793077914162.jpg"
              alt="Operator scanning machine QR"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
              <span className="text-white text-xs font-medium">
                車間現場實景：作業員以手機掃描機身一機一碼 QR Code
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-800 text-xs font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>現場作業員 30 秒標準化報修流程</span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                告別口述與 Line 訊息描述不清 · 標準化資料精準傳遞
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed">
                傳統報修因作業員非專業技師，無法精確描述警報代碼與故障現象，導致技師常帶錯零件二次停機。透過一機一碼銘牌，系統直接鎖定機型 BOM 表與歷史履歷，作業員只需拍照並勾選面板警報碼，AI 即時進行初判並推論必備 ERP 料號！
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="font-bold text-slate-900 mb-0.5">1. 掃描銘牌</div>
                <div className="text-[11px] text-slate-500">
                  自動帶出機型、出廠序號與 ERP 零件樹
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="font-bold text-slate-900 mb-0.5">2. 拍照選代碼</div>
                <div className="text-[11px] text-slate-500">
                  拍攝漏料/結晶照片，勾選控制面板警報碼
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="font-bold text-slate-900 mb-0.5">3. 獲得安全 SOP</div>
                <div className="text-[11px] text-slate-500">
                  即刻取得防固化清洗指引，推播調度備料
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Cards for Direct Reporting */}
      <div>
        <div className="text-sm font-bold text-slate-900 mb-3">
          選擇車間設備直接體驗掃碼報修：
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {equipments.map((eq) => (
            <div
              key={eq.id}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 hover:border-blue-400 hover:shadow-xs transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                    {eq.id}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      eq.status === 'RUNNING'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {eq.status === 'RUNNING' ? '生產運轉中' : '報修維修中'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{eq.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    型號: {eq.model} · 產線: {eq.productionLine}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>銘牌 QR ID:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {eq.qrCodeId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>累計運轉:</span>
                    <span className="font-mono text-slate-800">
                      {eq.totalOperatingHours.toLocaleString()} 小時
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenReportModalWithMachine(eq.id)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center justify-center gap-2"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>模擬掃描此機台 QR 報修</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Notice for Operators */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
        <div className="font-bold flex items-center gap-1.5 text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          現場作業員發泡設備安全防護須知
        </div>
        <div className="text-[11px] text-amber-900/90 leading-relaxed">
          異氰酸酯 (A料) 遇空氣濕氣極易迅速結晶硬化，若發現高壓混合頭滴料或計量泵異常壓力，請切勿連續嘗試強行射膠！應立即使用掃碼報修並依照初判建議進行低壓溶劑逆向沖注或手動關閉液壓站動力，嚴禁用硬物敲擊高精度配合推桿。
        </div>
      </div>
    </div>
  );
};
