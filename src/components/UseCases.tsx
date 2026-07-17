import { useState } from 'react';
import { USE_CASE_TABS } from '../data';
import { Mail, Server, ArrowRight, Cpu, CheckCircle } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function UseCases() {
  const [activeTabId, setActiveTabId] = useState('operations');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const currentTab = USE_CASE_TABS.find((tab) => tab.id === activeTabId) || USE_CASE_TABS[0];

  return (
    <section 
      id="use-cases" 
      className={`relative py-12 md:py-16 lg:py-24 border-t transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-white border-slate-900' : 'bg-white text-slate-800 border-slate-200/60'
      }`}
    >
      {isDark && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_60%)]" />
      )}

      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
            isDark 
              ? 'bg-slate-900/80 border-slate-800 text-slate-300' 
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            DEPLOY TARGETED INBOXES
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            One email. Many workflows.
          </h2>
          <p className={`text-sm sm:text-base transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Click any departmental agent below to see how standard requests are handled autonomously in the background.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto mb-12">
          {USE_CASE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`rounded-xl px-5 py-3 text-xs font-bold transition-all duration-300 border cursor-pointer ${
                activeTabId === tab.id
                  ? 'bg-blue-600 text-white border-transparent shadow-md'
                  : isDark 
                    ? 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Interactive Workspace Panel */}
        <div className={`rounded-2xl border p-6 md:p-8 transition-colors duration-300 w-full max-w-[1200px] mx-auto ${
          isDark ? 'border-slate-800 bg-slate-900/20' : 'border-slate-200 bg-slate-50/50 shadow-xs'
        }`}>
          
          <div 
            className="grid gap-6 md:gap-8 w-full"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            
            {/* Left: Input Email mockup */}
            <div className={`rounded-xl border p-5 space-y-4 transition-colors duration-300 ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className={`flex items-center justify-between border-b pb-2 transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-200/80'}`}>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Inbound Request</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-blue-600" />
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-400">
                <div>
                  <span className="text-slate-400">To Agent:</span>{' '}
                  <span className="text-blue-600 font-bold">{currentTab.email}</span>
                </div>
                <div>
                  <span className="text-slate-400">Subject:</span>{' '}
                  <span className={isDark ? 'text-slate-200' : 'text-slate-850'}>System workflow check</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border text-xs font-sans italic min-h-[100px] flex flex-col justify-between transition-colors duration-300 ${
                isDark ? 'bg-slate-950/80 border-slate-900 text-slate-300' : 'bg-slate-50 border-slate-150 text-slate-600'
              }`}>
                <div>
                  <p className="text-slate-400 font-mono text-[10px] mb-2">Message Body:</p>
                  <p>&ldquo;{currentTab.incomingRequest}&rdquo;</p>
                </div>
              </div>

              {/* Connected Systems chips */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Connected Client Systems:</span>
                <div className="flex flex-wrap gap-2">
                  {currentTab.connectedSystems.map((sys, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded border text-[10px] font-mono font-bold transition-colors duration-300 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600 shadow-2xs'
                      }`}
                    >
                      ✓ {sys}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Agent Processing outcome */}
            <div className={`rounded-xl border p-5 flex flex-col justify-between relative transition-colors duration-300 ${
              isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white border-slate-200'
            }`}>
              <div className="space-y-4">
                <div className={`flex items-center justify-between border-b pb-2 transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-200/80'}`}>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Background Runtime Logs</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono border ${
                    isDark ? 'bg-blue-950/60 border-blue-800/40 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
                  }`}>
                    <Cpu className="h-2.5 w-2.5 animate-spin text-blue-600" />
                    <span>AUTONOMOUS</span>
                  </span>
                </div>

                {/* Simulated activity log block */}
                <div className={`p-3.5 rounded-lg border font-mono text-[11px] space-y-2 leading-relaxed transition-colors duration-300 ${
                  isDark ? 'bg-slate-950 border-slate-900 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <p className="text-blue-600 font-semibold">&gt;_ Task initiated silently</p>
                  <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{currentTab.backgroundTask}</p>
                  <div className={`h-[1px] my-2 ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`} />
                  <p className="text-emerald-600 font-semibold">&gt;_ Outcome completed</p>
                </div>
              </div>

              {/* Final response summary */}
              <div className={`pt-4 mt-4 border-t space-y-3 transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-150'}`}>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Agent Outcome:</span>
                <div className={`p-4 rounded-xl border text-xs flex items-center gap-3 transition-colors duration-300 ${
                  isDark ? 'bg-slate-950 border-blue-500/20 text-white' : 'bg-slate-50 border-blue-200 text-slate-800'
                }`}>
                  <div className={`p-2 rounded border text-blue-600 shrink-0 transition-colors duration-300 ${isDark ? 'bg-slate-950 border-slate-850' : 'bg-white border-slate-200'}`}>
                    <CheckCircle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h5 className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Execution Successful</h5>
                    <p className={`text-[11px] mt-0.5 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{currentTab.finalResponse}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
