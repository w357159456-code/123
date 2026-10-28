/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  INITIAL_EQUIPMENTS,
  INITIAL_WORK_ORDERS,
  Equipment,
  WorkOrder,
  Technician,
} from './data/foamingDomain';
import { Header } from './components/Header';
import { KpiMetricsBar } from './components/KpiMetricsBar';
import { SupervisorDispatchView } from './components/SupervisorDispatchView';
import { OperatorView } from './components/OperatorView';
import { TechnicianView } from './components/TechnicianView';
import { DigitalPedigreeView } from './components/DigitalPedigreeView';
import { KpiRoiView } from './components/KpiRoiView';
import { OperatorReportModal } from './components/OperatorReportModal';
import { SupervisorSignOffModal } from './components/SupervisorSignOffModal';
import { ProposalViewerModal } from './components/ProposalViewerModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dispatch');
  const [equipments, setEquipments] = useState<Equipment[]>(INITIAL_EQUIPMENTS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportModalPreselectedEq, setReportModalPreselectedEq] = useState<string>('EQ-PU-01');
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signModalTargetOrder, setSignModalTargetOrder] = useState<WorkOrder | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState<boolean>(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Submit new work order from Operator View
  const handleCreateWorkOrder = (newOrder: WorkOrder) => {
    setWorkOrders((prev) => [newOrder, ...prev]);

    // Update equipment status to FAULT_STOPPED
    setEquipments((prev) =>
      prev.map((eq) =>
        eq.id === newOrder.equipmentId ? { ...eq, status: 'FAULT_STOPPED' } : eq
      )
    );

    showToast(`報修工單 ${newOrder.id} 已建立！AI 初判備料建議已推播至主管審核看板。`);
    setCurrentTab('dispatch');
  };

  // Supervisor approves parts and dispatches technician
  const handleApproveAndDispatch = (
    workOrderId: string,
    confirmedParts: any[],
    technician: Technician
  ) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === workOrderId) {
          return {
            ...wo,
            status: 'SUPERVISOR_APPROVED',
            confirmedParts,
            assignedTechnician: {
              technicianId: technician.id,
              name: technician.name,
              phone: technician.phone,
              dispatchedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              etaMinutes: Math.round(technician.distanceKm * 2.2),
            },
          };
        }
        return wo;
      })
    );

    showToast(`已核定 ${confirmedParts.length} 項備料並指派技師【${technician.name}】出勤！ERP 庫存已鎖定。`);
  };

  // Technician progress update (dispatched, arrived, trial inspection)
  const handleUpdateRepairProgress = (
    workOrderId: string,
    newStatus: WorkOrder['status'],
    repairDetails?: any
  ) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === workOrderId) {
          const updated: WorkOrder = {
            ...wo,
            status: newStatus,
          };
          if (repairDetails) {
            updated.repairLog = {
              completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              actualRepairHours: repairDetails.actualRepairHours || 2.0,
              actionSummary: repairDetails.actionSummary || '完成部件更換',
              replacedPartNos: repairDetails.replacedPartNos || [],
              foamDensityGPerCm3: repairDetails.foamDensityGPerCm3 || 0.048,
              foamHardnessAskerC: repairDetails.foamHardnessAskerC || 54,
              moldPoreUniformity: repairDetails.moldPoreUniformity || 'EXCELLENT',
            };
          }
          return updated;
        }
        return wo;
      })
    );

    if (newStatus === 'DISPATCHED') {
      showToast('技師已確認備料齊全，正式出發前往工廠！');
    } else if (newStatus === 'ON_SITE_REPAIR') {
      showToast('技師已抵達車間現場，開始拆檢與組件更換。');
    } else if (newStatus === 'TRIAL_INSPECTED') {
      showToast('發泡試模檢驗數據已上傳，請廠務主管進行現場驗收簽章！');
    }
  };

  // Supervisor signs off trial inspection
  const handleConfirmSignOff = (
    workOrderId: string,
    signerName: string,
    signatureDataUrl: string,
    comments: string
  ) => {
    let completedOrder: WorkOrder | undefined;

    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === workOrderId) {
          const updated: WorkOrder = {
            ...wo,
            status: 'RESOLVED',
            repairLog: {
              ...(wo.repairLog || {
                completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                actualRepairHours: 2.0,
                actionSummary: '更換針閥油壓密封組與推桿',
                replacedPartNos: ['ERP-PU-9042'],
                foamDensityGPerCm3: 0.048,
                foamHardnessAskerC: 54,
                moldPoreUniformity: 'EXCELLENT',
              }),
              supervisorSignerName: signerName,
              supervisorSignature: signatureDataUrl,
              supervisorComments: comments,
            },
          };
          completedOrder = updated;
          return updated;
        }
        return wo;
      })
    );

    // Update equipment status back to RUNNING and append to recentHistory
    if (completedOrder) {
      const order = completedOrder as WorkOrder;
      setEquipments((prev) =>
        prev.map((eq) => {
          if (eq.id === order.equipmentId) {
            return {
              ...eq,
              status: 'RUNNING',
              recentHistory: [
                {
                  date: new Date().toISOString().substring(0, 10),
                  description: `${order.faultLocation}維修更換，試模質檢通過 (${signerName} 簽核)`,
                  replacedParts: order.confirmedParts?.map((p) => p.erpPartNo) || [],
                  technician: order.assignedTechnician?.name || '陳建宏',
                  resolvedHours: order.repairLog?.actualRepairHours || 2.0,
                },
                ...eq.recentHistory,
              ],
            };
          }
          return eq;
        })
      );
    }

    showToast(`工單 ${workOrderId} 主管簽核完成！設備已恢復運轉，資料已歸檔至數位履歷。`);
  };

  // Open modal helpers
  const handleOpenReportForMachine = (eqId: string) => {
    setReportModalPreselectedEq(eqId);
    setIsReportModalOpen(true);
  };

  const handleOpenSignModal = (wo: WorkOrder) => {
    setSignModalTargetOrder(wo);
    setIsSignModalOpen(true);
  };

  const activeWorkOrdersCount = workOrders.filter(
    (wo) => wo.status !== 'RESOLVED'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="text-slate-400 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenReportModal={() => handleOpenReportForMachine('EQ-PU-01')}
        onOpenProposalModal={() => setIsProposalModalOpen(true)}
        activeWorkOrdersCount={activeWorkOrdersCount}
      />

      {/* Operational KPI & ROI Metrics Strip */}
      <KpiMetricsBar onOpenRoiDetails={() => setCurrentTab('kpi')} />

      {/* Main View Port */}
      <main className="flex-1">
        {currentTab === 'dispatch' && (
          <SupervisorDispatchView
            workOrders={workOrders}
            equipments={equipments}
            onApproveAndDispatch={handleApproveAndDispatch}
            onOpenSignModal={handleOpenSignModal}
            onOpenReportModal={() => handleOpenReportForMachine('EQ-PU-01')}
          />
        )}

        {currentTab === 'operator' && (
          <OperatorView
            equipments={equipments}
            onOpenReportModalWithMachine={handleOpenReportForMachine}
          />
        )}

        {currentTab === 'technician' && (
          <TechnicianView
            workOrders={workOrders}
            equipments={equipments}
            onUpdateRepairProgress={handleUpdateRepairProgress}
            onOpenSignModal={handleOpenSignModal}
          />
        )}

        {currentTab === 'pedigree' && (
          <DigitalPedigreeView
            equipments={equipments}
            workOrders={workOrders}
            onOpenReportForMachine={handleOpenReportForMachine}
          />
        )}

        {currentTab === 'kpi' && <KpiRoiView />}
      </main>

      {/* Modals */}
      <OperatorReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        equipments={equipments}
        preselectedEquipmentId={reportModalPreselectedEq}
        onSubmitWorkOrder={handleCreateWorkOrder}
      />

      <SupervisorSignOffModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        workOrder={signModalTargetOrder}
        onConfirmSignOff={handleConfirmSignOff}
      />

      <ProposalViewerModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
      />

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            FoamGuard 發泡智修 · 塑膠發泡設備智慧報修與備料派工系統 (MVP 輕量版)
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>一機一碼 QR Code</span>
            <span>·</span>
            <span>ERP BOM 零件連動</span>
            <span>·</span>
            <span>Gemini 多模態初判</span>
            <span>·</span>
            <span>現場試模主管手寫驗收</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
