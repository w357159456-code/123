import React from 'react';
import { ShieldCheck, QrCode, FileText } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenReportModal: () => void;
  onOpenProposalModal: () => void;
  activeWorkOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenReportModal,
  onOpenProposalModal,
  activeWorkOrdersCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <button
              onClick={() => onSelectTab('dispatch')}
              className="text-left group transition"
            >
              <div className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                FoamGuard 發泡智修
              </div>
              <div className="text-[11px] text-slate-500 font-medium tracking-normal whitespace-nowrap">
                塑膠發泡設備智慧報修與備料派工系統
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-line, whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => onSelectTab('dispatch')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'dispatch'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              工單調度看板
              {activeWorkOrdersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-xs font-mono bg-blue-600 text-white rounded-full">
                  {activeWorkOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('operator')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'operator'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              現場掃碼報修端
            </button>

            <button
              onClick={() => onSelectTab('technician')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'technician'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              現場技師工單端
            </button>

            <button
              onClick={() => onSelectTab('pedigree')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'pedigree'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              設備主檔與數位履歷
            </button>

            <button
              onClick={() => onSelectTab('kpi')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'kpi'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              效益與 ROI 分析
            </button>
          </nav>

          {/* Zone 3: Primary Action + Proposal Doc Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenProposalModal}
              title="檢視10項引導問題與提案對照"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-xs whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>提案架構對照</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-98 transition shadow-xs whitespace-nowrap shrink-0"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>一機一碼報修</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
