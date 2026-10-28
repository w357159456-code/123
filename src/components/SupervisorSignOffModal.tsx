import React, { useRef, useState, useEffect } from 'react';
import { WorkOrder } from '../data/foamingDomain';
import { X, CheckCircle2, RotateCcw, PenTool, ShieldCheck } from 'lucide-react';

interface SupervisorSignOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  onConfirmSignOff: (
    workOrderId: string,
    signerName: string,
    signatureDataUrl: string,
    comments: string
  ) => void;
}

export const SupervisorSignOffModal: React.FC<SupervisorSignOffModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  onConfirmSignOff,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState('廠務副理 許文豪');
  const [comments, setComments] = useState(
    '現場試模發泡 5 模，閉孔率良好無坍塌，壓力維持 160 bar，准予驗收結案。'
  );

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
      }
    }
  }, [isOpen]);

  if (!isOpen || !workOrder) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleApplyPresetSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    ctx.font = 'italic 28px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(signerName, 40, 75);
    setHasSignature(true);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : '';
    onConfirmSignOff(workOrder.id, signerName, signatureDataUrl, comments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                廠務主管現場試模成型驗收與電子簽核
              </h2>
              <div className="text-xs text-slate-500">
                人工邊界確認點：試運轉發泡品質質檢通過後結案存入數位履歷
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Trial metrics inspection summary */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>驗收設備: {workOrder.machineModel} ({workOrder.equipmentId})</span>
              <span className="font-mono text-slate-500">工單 {workOrder.id}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-center">
              <div className="bg-white p-2 rounded border border-slate-100">
                <div className="text-slate-400 text-[10px]">發泡密度</div>
                <div className="font-mono font-bold text-slate-900">
                  {workOrder.repairLog?.foamDensityGPerCm3 || 0.048} g/cm³
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-100">
                <div className="text-slate-400 text-[10px]">硬度 (Asker C)</div>
                <div className="font-mono font-bold text-slate-900">
                  {workOrder.repairLog?.foamHardnessAskerC || 54} 度
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-100">
                <div className="text-slate-400 text-[10px]">泡孔外觀</div>
                <div className="font-bold text-emerald-700">
                  {workOrder.repairLog?.moldPoreUniformity === 'EXCELLENT' ? '優良無坍塌' : '合格'}
                </div>
              </div>
            </div>

            <div className="text-slate-600 pt-1 text-[11px]">
              維修總結：{workOrder.repairLog?.actionSummary || '完成針閥密封更換與高壓管路清洗沖注'}
            </div>
          </div>

          {/* Supervisor input fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                驗收審批主管姓名 / 職稱
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                驗收意見評語
              </label>
              <input
                type="text"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-900"
              />
            </div>
          </div>

          {/* Electronic Signature Canvas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-slate-700 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-slate-500" />
                <span>主管手寫電子簽章板 (Mouse / Touch)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyPresetSignature}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  帶入主管授權簽署
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-0.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>重繪</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={590}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-28 cursor-crosshair touch-none"
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              簽章將綁定數位時間戳，存入設備數位履歷，不可竄改。
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            驗收完成後設備狀態將自動切換為「正常運轉」
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>確認簽署並正式結案</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
