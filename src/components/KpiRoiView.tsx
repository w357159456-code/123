import React, { useState } from 'react';
import {
  TrendingUp,
  PackageCheck,
  Clock,
  AlertOctagon,
  Calculator,
  ShieldCheck,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Layers,
} from 'lucide-react';

export const KpiRoiView: React.FC = () => {
  // Interactive ROI Calculator sliders
  const [machineCount, setMachineCount] = useState<number>(6);
  const [monthlyIncidents, setMonthlyIncidents] = useState<number>(8);
  const [hourlyDowntimeCost, setHourlyDowntimeCost] = useState<number>(22000); // NT$ 15,000 ~ 30,000
  const [wrongPartSecondTripReduction, setWrongPartSecondTripReduction] = useState<number>(20.8); // 25% -> 4.2%

  // Calculations
  // 1. Hours saved from MTTR reduction: 2.2 hours per incident (6.0h -> 3.8h)
  const mttrHoursSavedPerMonth = monthlyIncidents * 2.2;
  // 2. Second trip avoided (each second trip wastes ~4 hours of waiting & travel)
  const secondTripsAvoidedPerMonth = monthlyIncidents * (wrongPartSecondTripReduction / 100);
  const secondTripHoursSaved = secondTripsAvoidedPerMonth * 4.5;

  const totalDowntimeHoursSavedPerMonth = mttrHoursSavedPerMonth + secondTripHoursSaved;
  const monthlyCostSavings = totalDowntimeHoursSavedPerMonth * hourlyDowntimeCost;
  const annualCostSavings = monthlyCostSavings * 12;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          KPI 指標與發泡產線停機損失 ROI 效益驗證
        </h1>
        <div className="text-xs text-slate-500 mt-1">
          對照現況痛點數字與導入改善實績 · 停機損失試算模型
        </div>
      </div>

      {/* Comparison Grid: 現況痛點 vs FoamGuard 實績 (Strictly follows section 3 & 9) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">二次到場率 (帶錯料)</span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">已達標</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400">改善前現況</div>
              <div className="text-lg font-bold font-mono text-slate-400 line-through">
                25.0%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-600 font-medium">FoamGuard 改善後</div>
              <div className="text-xl font-bold font-mono text-emerald-700">
                4.2%
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            目標 &lt; 5% · AI 初判精準對照 ERP BOM 料號，出發前核對防呆清單。
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">平均修復時間 (MTTR)</span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">-36.7%</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400">改善前平均</div>
              <div className="text-lg font-bold font-mono text-slate-400 line-through">
                6.0 小時
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-600 font-medium">FoamGuard 改善後</div>
              <div className="text-xl font-bold font-mono text-emerald-700">
                3.8 小時
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            智慧派工依照技師距離與專長推薦，技師出發備料齊全，現場快速組裝。
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">30天重複故障率</span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">-15.6%</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400">改善前現況</div>
              <div className="text-lg font-bold font-mono text-slate-400 line-through">
                18.0%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-600 font-medium">FoamGuard 改善後</div>
              <div className="text-xl font-bold font-mono text-emerald-700">
                2.4%
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            一機一碼數位履歷追溯歷史更換耗材，搭配主管試模成型質檢驗收。
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">線上電子簽核審批</span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">提升至 96.8%</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400">紙本跑單耗時</div>
              <div className="text-lg font-bold font-mono text-slate-400 line-through">
                約 4 小時
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-600 font-medium">線上簽核耗時</div>
              <div className="text-xl font-bold font-mono text-emerald-700">
                18 分鐘
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            達成率 96.8% (目標 95%) · 報價核准與結案審批時間大幅減少 50% 以上。
          </div>
        </div>
      </div>

      {/* Interactive ROI Calculator */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <div className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              塑膠發泡工廠停機損失節省 ROI 試算模型
            </div>
            <div className="text-xs text-slate-500">
              發泡機停機損失含原料結晶固化報廢、模具預熱損失、產線作業員閒置與交期延誤成本
            </div>
          </div>
          <span className="text-xs font-mono bg-blue-50 text-blue-800 px-3 py-1 rounded-full font-semibold self-start sm:self-auto">
            NT$ 15,000–30,000 / 停機小時
          </span>
        </div>

        {/* Sliders & Outputs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders column (7 cols) */}
          <div className="lg:col-span-7 space-y-5 text-xs">
            {/* Slider 1: 廠內發泡機台數 */}
            <div>
              <div className="flex items-center justify-between font-medium text-slate-700 mb-1">
                <span>廠內發泡設備數量</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {machineCount} 台
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={machineCount}
                onChange={(e) => setMachineCount(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Slider 2: 每月預估報修次數 */}
            <div>
              <div className="flex items-center justify-between font-medium text-slate-700 mb-1">
                <span>廠區每月設備故障/報修次數</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {monthlyIncidents} 次 / 月
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={30}
                value={monthlyIncidents}
                onChange={(e) => setMonthlyIncidents(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Slider 3: 單次停機每小時損失 */}
            <div>
              <div className="flex items-center justify-between font-medium text-slate-700 mb-1">
                <span>發泡設備單次停機每小時綜合損失 (NT$)</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  NT$ {hourlyDowntimeCost.toLocaleString()} / 小時
                </span>
              </div>
              <input
                type="range"
                min={15000}
                max={30000}
                step={1000}
                value={hourlyDowntimeCost}
                onChange={(e) => setHourlyDowntimeCost(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>NT$ 15,000 (低壓/小型)</span>
                <span>NT$ 22,000 (標準雙組份高壓)</span>
                <span>NT$ 30,000 (連續大量發泡)</span>
              </div>
            </div>
          </div>

          {/* Result Highlight Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl p-6 space-y-4 shadow-md">
            <div className="text-xs text-blue-200 font-medium">
              導入 FoamGuard 預期產生之經濟效益
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-slate-300">每月節省停機損失</div>
              <div className="text-3xl font-extrabold font-mono tracking-tight text-white tabular-nums">
                NT$ {Math.round(monthlyCostSavings).toLocaleString()}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-1">
              <div className="text-[11px] text-blue-200">年度累計預估效益 (ROI)</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                NT$ {Math.round(annualCostSavings).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">
                相當於每年避免 {Math.round(totalDowntimeHoursSavedPerMonth * 12)} 小時的無效停機廢料耗損
              </div>
            </div>

            <div className="p-3 bg-white/10 rounded-lg text-[11px] text-blue-100 space-y-1">
              <div>
                • 每月避免 <strong className="text-white">{secondTripsAvoidedPerMonth.toFixed(1)} 次</strong> 帶錯零件二次停機跑趟
              </div>
              <div>
                • 每月縮減 <strong className="text-white">{totalDowntimeHoursSavedPerMonth.toFixed(1)} 小時</strong> 產線停滯與原料固化
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
