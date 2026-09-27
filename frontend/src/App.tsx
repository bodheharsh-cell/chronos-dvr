import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { GuidedFlowStepper, FlowStep } from './components/GuidedFlowStepper';
import { DashboardView } from './components/DashboardView';
import { CasesView } from './components/CasesView';
import { EvidenceView } from './components/EvidenceView';
import { AnalysisResultsView } from './components/AnalysisResultsView';
import { TimelineView } from './components/TimelineView';
import { EvidenceGraphView } from './components/EvidenceGraphView';
import { RiskAnalysisView } from './components/RiskAnalysisView';
import { AuditTrailView } from './components/AuditTrailView';
import { ReportsView } from './components/ReportsView';
import { AnalysisProgressModal } from './components/AnalysisProgressModal';

import {
  fetchHealth,
  fetchCases,
  createCase,
  loadDemoInvestigation,
  fetchEvidence,
  uploadEvidence,
  analyzeEvidence,
  fetchTimeline,
  fetchRisk,
  fetchAuditTrail,
  fetchEvidenceGraph,
} from './api/client';

import {
  Case,
  Evidence,
  TimelineEvent,
  RiskAssessment,
  AuditLedgerResponse,
  EvidenceGraphResponse,
} from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [healthOk, setHealthOk] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCase, setActiveCase] = useState<Case | null>(null);

  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [riskData, setRiskData] = useState<RiskAssessment | null>(null);
  const [auditData, setAuditData] = useState<AuditLedgerResponse | null>(null);
  const [graphData, setGraphData] = useState<EvidenceGraphResponse | null>(null);

  const [loadingDemo, setLoadingDemo] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analyzingFilename, setAnalyzingFilename] = useState('');

  // Check health on mount
  useEffect(() => {
    fetchHealth()
      .then(() => setHealthOk(true))
      .catch(() => setHealthOk(false));
  }, []);

  // Fetch Cases list
  const loadCases = useCallback(async () => {
    try {
      const data = await fetchCases();
      setCases(data);
      if (data.length > 0 && !activeCase) {
        setActiveCase(data[0]);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
    }
  }, [activeCase]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // Load all case-dependent data whenever activeCase changes
  const loadCaseData = useCallback(async (caseId: number) => {
    try {
      const [ev, tl, rk, ad, gr] = await Promise.allSettled([
        fetchEvidence(caseId),
        fetchTimeline(caseId),
        fetchRisk(caseId),
        fetchAuditTrail(caseId),
        fetchEvidenceGraph(caseId),
      ]);

      if (ev.status === 'fulfilled') setEvidenceList(ev.value);
      if (tl.status === 'fulfilled') setTimelineEvents(tl.value);
      if (rk.status === 'fulfilled') setRiskData(rk.value);
      if (ad.status === 'fulfilled') setAuditData(ad.value);
      if (gr.status === 'fulfilled') setGraphData(gr.value);
    } catch (err) {
      console.error('Error loading case data:', err);
    }
  }, []);

  useEffect(() => {
    if (activeCase) {
      loadCaseData(activeCase.id);
    } else {
      setEvidenceList([]);
      setTimelineEvents([]);
      setRiskData(null);
      setAuditData(null);
      setGraphData(null);
    }
  }, [activeCase, loadCaseData]);

  // Handle Create Case
  const handleCreateCase = async (data: {
    case_number: string;
    title: string;
    description: string;
    investigator: string;
  }) => {
    const newCase = await createCase(data);
    await loadCases();
    setActiveCase(newCase);
    setCurrentTab('evidence');
  };

  // Handle Load Demo Investigation
  const handleLoadDemo = async () => {
    try {
      setLoadingDemo(true);
      const demoCase = await loadDemoInvestigation();
      await loadCases();
      setActiveCase(demoCase);
      await loadCaseData(demoCase.id);
      setCurrentTab('evidence');
    } catch (err: any) {
      alert('Failed to load demo investigation: ' + err.message);
    } finally {
      setLoadingDemo(false);
    }
  };

  // Handle Upload Evidence
  const handleUploadEvidence = async (file: File, cameraId: string) => {
    if (!activeCase) return;
    const newEv = await uploadEvidence(activeCase.id, file, cameraId, activeCase.investigator);
    await loadCaseData(activeCase.id);
  };

  // Handle Analyze Evidence
  const handleAnalyzeEvidence = async (evidenceId: number) => {
    if (!activeCase) return;
    const ev = evidenceList.find((e) => e.id === evidenceId) || evidenceList[0];
    setAnalyzingFilename(ev?.filename || 'camera_01.mp4');
    setShowAnalysisModal(true);
    setAnalyzingId(evidenceId);

    try {
      await analyzeEvidence(evidenceId);
      await loadCaseData(activeCase.id);
    } catch (err: any) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzingId(null);
    }
  };

  const highRiskCount =
    riskData?.factors.filter((f) => f.severity === 'HIGH' || f.severity === 'CRITICAL').length || 0;

  return (
    <div className="min-h-screen bg-forensic-900 text-slate-100 flex flex-col font-sans">
      <Header
        activeCase={activeCase}
        cases={cases}
        onSelectCase={(c) => setActiveCase(c)}
        onLoadDemo={handleLoadDemo}
        loadingDemo={loadingDemo}
        healthOk={healthOk}
      />

      {/* Guided Walkthrough Bar */}
      <GuidedFlowStepper
        currentTab={currentTab as FlowStep}
        onSelectTab={(t) => setCurrentTab(t as NavTab)}
        hasAnalyzedEvidence={evidenceList.some((e) => e.analysis_status === 'COMPLETED')}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(t) => setCurrentTab(t)}
          evidenceCount={evidenceList.length}
          highRiskCount={highRiskCount}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-forensic-900/90 forensic-grid">
          <div className="max-w-7xl mx-auto pb-12">
            {currentTab === 'dashboard' && (
              <DashboardView
                cases={cases}
                activeCase={activeCase}
                evidenceList={evidenceList}
                riskData={riskData}
                onNavigate={(t) => setCurrentTab(t)}
                onSelectCase={(c) => {
                  setActiveCase(c);
                  setCurrentTab('cases');
                }}
                onLoadDemo={handleLoadDemo}
                loadingDemo={loadingDemo}
              />
            )}

            {currentTab === 'cases' && (
              <CasesView
                cases={cases}
                activeCase={activeCase}
                onSelectCase={(c) => {
                  setActiveCase(c);
                  setCurrentTab('evidence');
                }}
                onCreateCase={handleCreateCase}
              />
            )}

            {currentTab === 'evidence' && (
              <EvidenceView
                activeCase={activeCase}
                evidenceList={evidenceList}
                onUploadEvidence={handleUploadEvidence}
                onAnalyzeEvidence={handleAnalyzeEvidence}
                analyzingId={analyzingId}
              />
            )}

            {currentTab === 'results' && (
              <AnalysisResultsView
                activeCase={activeCase}
                evidenceList={evidenceList}
                timelineEvents={timelineEvents}
                onNavigate={(t) => setCurrentTab(t)}
                onAnalyzeEvidence={handleAnalyzeEvidence}
                analyzingId={analyzingId}
              />
            )}

            {currentTab === 'timeline' && (
              <TimelineView
                activeCase={activeCase}
                timelineEvents={timelineEvents}
              />
            )}

            {currentTab === 'graph' && (
              <EvidenceGraphView
                activeCase={activeCase}
                graphData={graphData}
                onRefreshGraph={() => activeCase && loadCaseData(activeCase.id)}
              />
            )}

            {currentTab === 'risk' && (
              <RiskAnalysisView
                activeCase={activeCase}
                riskData={riskData}
              />
            )}

            {currentTab === 'audit' && (
              <AuditTrailView
                activeCase={activeCase}
                auditData={auditData}
                onRefreshAudit={() => activeCase && loadCaseData(activeCase.id)}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                activeCase={activeCase}
                evidenceList={evidenceList}
                riskData={riskData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Interactive Live Analysis Stage Execution Modal */}
      <AnalysisProgressModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        onComplete={() => {
          setShowAnalysisModal(false);
          setCurrentTab('results');
        }}
        evidenceFilename={analyzingFilename}
      />
    </div>
  );
};
