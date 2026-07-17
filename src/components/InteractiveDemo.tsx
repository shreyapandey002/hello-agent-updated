import { useState, useEffect } from 'react';
import { Mail, Play, CheckCircle2, RotateCcw, Sparkles, Terminal, Layers, Database, Globe, Users } from 'lucide-react';
import { SANDBOX_STAGES } from '../data';
import { useTheme } from '../ThemeContext';

export default function InteractiveDemo() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [emailBody, setEmailBody] = useState<string>(
    `Hi Agent,\n\nPlease check shipment MS-4821, update the invoice status in our ERP, and send back the latest payment summary.\n\nThanks,\nAnita`
  );
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [showFinalCard, setShowFinalCard] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    if (currentStageIndex < SANDBOX_STAGES.length - 1) {
      const nextIndex = currentStageIndex + 1;
      const timer = setTimeout(() => {
        setCurrentStageIndex(nextIndex);
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✓ ${SANDBOX_STAGES[nextIndex].label}: ${SANDBOX_STAGES[nextIndex].detail}`
        ]);
      }, 750); // step speed
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsRunning(false);
        setShowFinalCard(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isRunning, currentStageIndex]);

  const handleRunAgent = () => {
    setIsRunning(true);
    setCurrentStageIndex(0);
    setLogs([`[${new Date().toLocaleTimeString()}] 🚀 Initiating autonomous agent pipeline...`]);
    setShowFinalCard(false);
    // Add first step
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ✓ ${SANDBOX_STAGES[0].label}: ${SANDBOX_STAGES[0].detail}`
    ]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStageIndex(-1);
    setLogs([]);
    setShowFinalCard(false);
    setEmailBody(
      `Hi Agent,\n\nPlease check shipment MS-4821, update the invoice status in our ERP, and send back the latest payment summary.\n\nThanks,\nAnita`
    );
  };

  return (
    <section 
      id="agent-sandbox" 
      className={`relative py-12 md:py-16 lg:py-24 border-t transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-white border-slate-900' : 'bg-white text-slate-800 border-slate-200/60'
      }`}
    >
      {isDark ? (
        <>
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[300px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
        </>
      ) : (
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[300px] bg-blue-50/50 rounded-full blur-[140px] pointer-events-none" />
      )}

      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
            isDark 
              ? 'bg-slate-900/80 border-slate-800 text-slate-300' 
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            EXPERIMENT WITH RUNTIME
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Agent Sandbox
          </h2>
          <p className={`text-sm sm:text-base transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Send a simulated email and watch Hello Agent run the background task across mock channels.
          </p>
        </div>

        {/* Sandbox Content Container (3 Columns on Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.1fr_1fr] gap-6 items-stretch w-full max-w-[1200px] mx-auto">
          
          {/* COLUMN 1: Email Composer */}
          <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-colors duration-300 ${
            isDark ? 'border-slate-800/80 bg-slate-900/10' : 'border-slate-250 bg-slate-50/55'
          }`}>
            <div className="space-y-4">
              <div className={`flex items-center justify-between border-b pb-3 transition-colors duration-300 ${
                isDark ? 'border-slate-800/60' : 'border-slate-200/80'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Email Composer</span>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors font-mono cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Form Input fields */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className={`flex items-center gap-2 border-b py-1.5 transition-colors duration-300 ${isDark ? 'border-slate-800/40' : 'border-slate-200/60'}`}>
                  <span className="text-slate-400 w-12">From:</span>
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>anita@clientcompany.com</span>
                </div>
                <div className={`flex items-center gap-2 border-b py-1.5 transition-colors duration-300 ${isDark ? 'border-slate-800/40' : 'border-slate-200/60'}`}>
                  <span className="text-slate-400 w-12">To:</span>
                  <span className="text-blue-600 font-bold">ops-agent@helloagent.ai</span>
                </div>
                <div className={`flex items-center gap-2 border-b py-1.5 transition-colors duration-300 ${isDark ? 'border-slate-800/40' : 'border-slate-200/60'}`}>
                  <span className="text-slate-400 w-12">CC:</span>
                  <span className="text-slate-500">manager@clientcompany.com</span>
                </div>
                <div className={`flex items-center gap-2 border-b py-1.5 transition-colors duration-300 ${isDark ? 'border-slate-800/40' : 'border-slate-200/60'}`}>
                  <span className="text-slate-400 w-12">Subject:</span>
                  <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Update shipment and invoice status</span>
                </div>
              </div>

              {/* Editable Body text area */}
              <div className="pt-1">
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className={`w-full rounded-xl border p-3.5 text-xs leading-relaxed font-sans focus:border-blue-500 focus:outline-none resize-none transition-colors duration-300 ${
                    isDark ? 'border-slate-800 bg-slate-950/75 text-slate-200' : 'bg-white border-slate-200 text-slate-650 shadow-2xs'
                  }`}
                  placeholder="Draft email body here..."
                />
              </div>
            </div>

            <div className={`pt-4 border-t flex items-center justify-between gap-2 mt-4 transition-colors duration-300 ${
              isDark ? 'border-slate-800/60' : 'border-slate-200/80'
            }`}>
              <span className="text-[10px] text-slate-400 italic">
                Edit composer prompt text to test.
              </span>
            </div>
          </div>

          {/* COLUMN 2: Agent Runtime Timeline */}
          <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-colors duration-300 relative overflow-hidden ${
            isDark ? 'border-slate-800/80 bg-slate-900/10' : 'border-slate-250 bg-white shadow-3xs'
          }`}>
            
            <div className="space-y-5 flex-1">
              {/* Console Header */}
              <div className={`flex items-center justify-between border-b pb-3 transition-colors duration-300 ${
                isDark ? 'border-slate-800/60' : 'border-slate-200/80'
              }`}>
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Agent Runtime Logs</span>
                </div>
                
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SYSTEM_READY</span>
                </span>
              </div>

              {/* State 1: Idle Placeholder */}
              {currentStageIndex === -1 && !showFinalCard && (
                <div className="h-60 flex flex-col items-center justify-center text-center p-4 space-y-3">
                  <div className={`h-11 w-11 rounded-xl border flex items-center justify-center text-blue-600 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className={`font-display text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Awaiting Inbound Email</h4>
                    <p className="text-[11px] text-slate-450 max-w-[220px] mx-auto mt-1 leading-normal">
                      Click the &ldquo;Run Agent&rdquo; button to send the simulated query and trigger background tasks.
                    </p>
                  </div>
                </div>
              )}

              {/* State 2: Progress Stages list */}
              {currentStageIndex >= 0 && (
                <div className="space-y-2.5 font-mono text-[10px] sm:text-[11px] leading-relaxed max-h-[300px] overflow-y-auto pr-1">
                  {SANDBOX_STAGES.map((stage, idx) => {
                    const isActive = idx === currentStageIndex;
                    const isCompleted = idx < currentStageIndex;
                    
                    return (
                      <div
                        key={stage.id}
                        className={`flex items-start gap-2.5 transition-opacity duration-200 ${
                          idx <= currentStageIndex ? 'opacity-100' : 'opacity-20'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : isActive ? (
                          <div className="h-4 w-4 rounded-full border border-blue-600 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className={`font-bold block ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {stage.label}
                          </span>
                          <p className={`text-[9px] sm:text-[10px] mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>{stage.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Run button directly in column 2 bottom */}
            <div className={`pt-4 border-t mt-4 flex items-center justify-between gap-2 ${
              isDark ? 'border-slate-800/60' : 'border-slate-200/80'
            }`}>
              <button
                onClick={handleRunAgent}
                disabled={isRunning}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-3 px-4 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Run Agent Pipeline</span>
              </button>
            </div>
          </div>

          {/* COLUMN 3: Connected Systems & Final Response */}
          <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-colors duration-300 md:col-span-2 lg:col-span-1 ${
            isDark ? 'border-slate-800/80 bg-slate-900/10' : 'border-slate-250 bg-white shadow-3xs'
          }`}>
            
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Connected System statuses header */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Connected Systems Status:</span>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                  <div className={`flex items-center gap-1 px-2 py-1.5 rounded border ${isDark ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
                    <Layers className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="truncate">ERP: <strong className="text-emerald-600">Active</strong></span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1.5 rounded border ${isDark ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
                    <Database className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="truncate">DB: <strong className="text-emerald-600">Synced</strong></span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1.5 rounded border ${isDark ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
                    <Globe className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="truncate">CRM: <strong className="text-slate-550">Online</strong></span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1.5 rounded border ${isDark ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
                    <Users className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="truncate">CC: <strong className="text-emerald-600">Enabled</strong></span>
                  </div>
                </div>
              </div>

              <div className={`h-[1px] ${isDark ? 'bg-slate-800/60' : 'bg-slate-200/80'}`} />

              {/* Bottom Outcome Dispatch display */}
              <div className="flex-1 flex flex-col justify-center">
                {!showFinalCard ? (
                  <div className={`rounded-xl border border-dashed p-4 text-center space-y-2 transition-colors ${
                    isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-200 bg-slate-50/50'
                  }`}>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Response Dispatch Queue</span>
                    <p className="text-[10px] leading-relaxed text-slate-450 max-w-[200px] mx-auto">
                      Wait for pipeline execution to complete. The dispatched email response will be shown here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in text-left">
                    <div className={`rounded-xl border p-4 space-y-3 ${
                      isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50/50'
                    }`}>
                      <div className={`flex items-center justify-between border-b pb-2 ${isDark ? 'border-slate-900' : 'border-slate-200/80'}`}>
                        <span className="text-[9px] font-mono text-emerald-600 uppercase tracking-widest font-bold">Email dispatched</span>
                        <span className="text-[9px] font-mono text-slate-400">Latency: 1.1s</span>
                      </div>

                      <div className="space-y-2 text-[11px] text-slate-650 leading-relaxed font-sans">
                        <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Hi Anita,</p>
                        <p>Shipment MS-4821 is currently <strong className="text-blue-600 font-semibold">In Transit</strong>.</p>
                        <p>I have updated the invoice status in the ERP as <strong className="text-emerald-600 font-semibold">Partially Paid</strong>.</p>
                        
                        <div className={`grid grid-cols-1 gap-1 p-2 rounded border font-mono text-[9px] ${
                          isDark ? 'bg-slate-900/60 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                        }`}>
                          <div>Pending amount: <strong className="text-blue-600">₹24,000</strong></div>
                          <div>Due date: <strong>18 July 2026</strong></div>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-snug">I have copied your internal manager on this thread.</p>
                        <p className="font-mono text-[10px] text-slate-500">Regards,<br />Hello Agent</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`pt-4 border-t mt-4 text-center transition-colors duration-300 ${
              isDark ? 'border-slate-800/60' : 'border-slate-200/80'
            }`}>
              <span className="text-[10px] font-mono text-slate-450 uppercase tracking-wider block">
                🔒 MUTUAL ENCRYPTION SECURED
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
