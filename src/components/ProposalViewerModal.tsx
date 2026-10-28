import React from 'react';
import { X, FileText, CheckCircle2, Sparkles, Layers } from 'lucide-react';

interface ProposalViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalViewerModal: React.FC<ProposalViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const proposalItems = [
    {
      num: '01',
      title: '服務問題',
      question: '我們要改善哪一個服務問題？',
      content:
        '發泡設備停機維修響應慢、備料錯誤率高，且缺乏數位履歷導致重複故障率高。\n\n傳統報修依賴口述或 Line 訊息，客服與技師難以精準判讀故障，導致技師到場率不佳且常帶錯零件，造成二次停機。',
      systemMapping:
        '系統落實：以一機一碼 QR Code 取代口述與 Line，標準化表單與多模態初判直接綁定零件料號。',
    },
    {
      num: '02',
      title: '服務對象',
      question: '誰最直接受影響？',
      content:
        '塑膠發泡工廠之「現場作業員/組長」與「廠務/維修主管」。\n次要受影響者為設備廠商的「客戶服務人員」與「現場維修技師」。',
      systemMapping:
        '系統落實：設計 4 大專屬視圖角色切換（作業員端、調度審核端、技師出勤端、廠務履歷與驗收端）。',
    },
    {
      num: '03',
      title: '現況數字',
      question: '目前每月／每週耗時、錯誤、等待或損失多少？',
      content:
        '• 平均等待停機時間：報修到技師抵達平均耗時 6 小時/次。\n• 備料錯誤率：約 25% 的工單因帶錯零件或欠料需跑第二趟。\n• 重複故障率：約 18% 的設備在 30 天內因未根治問題而重複報修。\n• 單次停機損失：發泡機停機每小時損失約 NT$ 15,000–30,000（含原料固化廢料成本）。',
      systemMapping:
        '系統落實：建置即時 KPI 看板與互動式停機損失試算模型，精準量化改善前後差距。',
    },
    {
      num: '04',
      title: '根本原因',
      question: '真正造成問題的原因是什麼？',
      content:
        '• 資訊斷層：現場作業員非專業技師，無法精準描述設備狀況與警報代碼。\n• 主資料混亂：設備料號、新舊圖號未與 ERP 庫存 BOM 表連動。\n• 履歷散落：維修單據多為手寫紙本，無法追蹤歷史維修與更換耗材紀錄。',
      systemMapping:
        '系統落實：標準化 SOP 欄位（照片+警報碼+部位）消除資訊斷層；建立清洗後的 ERP BOM；永久留存雲端數位履歷。',
    },
    {
      num: '05',
      title: '先做的非 AI 改善',
      question: '流程、資料、角色要先補什麼？',
      content:
        '• 一機一碼：全面於發泡設備張貼 QR Code 銘牌，掃碼即帶出機型與履歷。\n• 報修 SOP 標準化：制定「照片/影片+警報碼+故障部位」必填表單。\n• 主資料整理：清洗並統一 ERP 零件料號與發泡設備 BOM 表對照。',
      systemMapping:
        '系統落實：內建金屬銘牌 QR Code 產生器；必填報修 SOP 表單；高壓發泡機與 EVA 射出機專屬清洗後 BOM 庫存。',
    },
    {
      num: '06',
      title: 'AI 介入點',
      question: 'AI 只接手哪一段？',
      content:
        '• 影像與文字多模態故障初判：分析現場上傳的照片/影片與警報代碼，自動推論可能故障組件並推薦正確的 ERP 零件料號。\n• 智慧派工建議：根據技師位置、技能專長與當前庫存，自動推薦最佳派工排序。',
      systemMapping:
        '系統落實：後端串接 Gemini 3.8 Flash 多模態初判與置信度推論；智慧派工演算法即時排序最優技師。',
    },
    {
      num: '07',
      title: '所需資料',
      question: '哪些資料、來源、欄位與更新頻率？',
      content:
        '• 設備主資料：機型、設備編號、零件 BOM 表（來源：ERP/CRM，靜態/定期更新）。\n• 歷史維修庫：過往工單、故障現象、更換料號、處置作法（來源：維修系統，每日即時更新）。\n• 報修輸入資料：現場拍攝照片/影片、文字描述、警報代碼（來源：前端掃碼報修，即時）。',
      systemMapping:
        '系統落實：完整 schema 設計，涵蓋 Equipment、ErpBomItem、Technician、WorkOrder 與 RepairLog。',
    },
    {
      num: '08',
      title: '人工邊界',
      question: '哪一步一定要人確認？',
      content:
        '• 客服/組長確認點：AI 推薦的判讀結果與備料料號，必須由客服或資深技師點選確認後才觸發派工與領料。\n• 現場驗收點：維修完成後的發泡試運轉成型品質，必須由廠務主管簽名確認才算結案。',
      systemMapping:
        '系統落實：明確的兩道人工閘門：主管審核備料核准按鈕；現場發泡試模檢測與手寫電子簽章驗收結案。',
    },
    {
      num: '09',
      title: 'KPI／ROI',
      question: '怎麼證明有效？預期改善多少？',
      content:
        '• 二次到場率：帶錯零件率由 25% 降低至 < 5%。\n• 平均復歸時間 (MTTR)：設備停機維修時間縮短 30%（目標 3.8h 以內）。\n• 工單結案效率：線上報價與電子簽核率提升至 95%，審批時間減少 50%。',
      systemMapping:
        '系統落實：KPI 看板數據與 ROI 試算器完全相符，並即時統計工廠年省數百萬損失。',
    },
    {
      num: '10',
      title: 'MVP',
      question: '第一版最小範圍是什麼？',
      content:
        '「單一發泡機型 + QR Code 報修 + 結構化備料推薦」輕量版系統。\n挑選廠內最常報修的 1–2 款發泡設備（雙組份高壓 PU 發泡機 PU-H600、EVA 自動射出成型機 EVA-800），導入 QR Code 掃碼報修與圖文診斷，結合 Web 介面實現初級智慧派工與備料建議。',
      systemMapping:
        '系統落實：本系統即為完整可運行之精準 MVP 系統！',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                發泡設備智慧報修提案 · 10 項引導問題與系統落實對照
              </h2>
              <div className="text-xs text-slate-500">
                本系統嚴格依循提案架構，將 10 項規劃具現化為完整可操作之工業級應用
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

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          {proposalItems.map((item) => (
            <div
              key={item.num}
              className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
                    項目 {item.num}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {item.title}
                  </span>
                  <span className="text-slate-400 text-xs hidden sm:inline">
                    ({item.question})
                  </span>
                </div>
              </div>

              <div className="text-slate-700 whitespace-pre-line leading-relaxed pl-1 pt-1">
                {item.content}
              </div>

              <div className="mt-2 p-2.5 bg-blue-50/60 border border-blue-100 rounded text-blue-950 font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>{item.systemMapping}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            FoamGuard 發泡智修 · 提案架構全面上線運作中
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            關閉檢視
          </button>
        </div>
      </div>
    </div>
  );
};
