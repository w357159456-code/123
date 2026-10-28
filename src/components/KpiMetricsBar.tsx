import React from 'react';
import { ArrowDownRight, ArrowUpRight, Clock, PackageCheck, AlertCircle, TrendingUp } from 'lucide-react';

interface KpiMetricsBarProps {
  onOpenRoiDetails?: () => void;
}

export const KpiMetricsBar: React.FC<KpiMetricsBarProps> = ({ onOpenRoiDetails }) => {
  return (
    <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>發泡產線維修運維指標</span>
            <span aria-hidden="true">·</span>
            <span>彰化鹿港廠 / 桃園龜山廠 / 台南安平廠</span>
            <span aria-hidden="true">·</span>
            <span>即時統計週期：本月累計</span>
          </div>
          {onOpenRoiDetails && (
            <button
              onClick={onOpenRoiDetails}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
            >
              <span>檢視 ROI 節省試算模型</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          {/* Metric 1: 二次到場率 (帶錯零件) */}
          <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                二次到場 (帶錯零件) 率
              </span>
              <span className="text-[11px] text-slate-400">過去 25%</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                4.2%
              </span>
              <span className="text-xs font-medium text-emerald-700 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" />
                -20.8%
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              目標 &lt; 5% · 已連續 42 張工單一次備料齊全
            </div>
          </div>

          {/* Metric 2: MTTR 平均復歸時間 */}
          <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                平均修復時間 (MTTR)
              </span>
              <span className="text-[11px] text-slate-400">過去 6.0h</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                3.8<span className="text-sm font-sans font-normal text-slate-500 ml-1">h</span>
              </span>
              <span className="text-xs font-medium text-emerald-700 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" />
                -36.7%
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              每單省 2.2 小時停機等待 · 減少原料固化報廢
            </div>
          </div>

          {/* Metric 3: 30天重複故障率 */}
          <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                30 天重複故障率
              </span>
              <span className="text-[11px] text-slate-400">過去 18%</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                2.4%
              </span>
              <span className="text-xs font-medium text-emerald-700 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" />
                -15.6%
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              數位履歷溯源追蹤 · 徹底根除治標不治本
            </div>
          </div>

          {/* Metric 4: 累計避免停機損失 */}
          <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                累計節省停機損失
              </span>
              <span className="text-[11px] text-slate-400">每小時 NT$2萬</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-blue-900 tabular-nums">
                NT$ 1.48M
              </span>
              <span className="text-xs font-medium text-emerald-700 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                高投報
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              線上電子簽核率 96.8% · 審批時間減少 50%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
