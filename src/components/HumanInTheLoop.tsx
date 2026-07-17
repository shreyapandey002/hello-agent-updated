import { AGENT_IDENTITIES } from '../data';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function HumanInTheLoop() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div id="identities-and-visibility" className={`divide-y transition-colors duration-300 ${
      isDark ? 'divide-slate-900 bg-slate-950 text-white' : 'divide-slate-200 bg-white text-slate-800'
    }`}>
      
      {/* 1. Dedicated Agent Identity Section */}
      <section id="dedicated-agents" className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
        {isDark && (
          <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none" />
        )}
        
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 space-y-16 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
              isDark 
                ? 'bg-cyan-950/80 border-cyan-500/30 text-cyan-400' 
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              OPERATING PROFILES
            </div>
            <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Every agent gets a real operating identity.
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Each Hello Agent can have its own email address, instructions, connected systems, task boundaries, and internal manager. Agents do not wait inside chat windows. They receive work through email, run in the background, and respond when the task is complete.
            </p>
          </div>

          {/* Grid of Agent Identity Cards */}
          <div 
            className="grid gap-6 w-full max-w-[1200px] mx-auto"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            {AGENT_IDENTITIES.map((agent, idx) => (
              <div
                key={idx}
                id={`agent-identity-${idx}`}
                className={`group p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isDark 
                    ? 'bg-slate-900/10 border-slate-900 hover:border-blue-500/30 hover:bg-slate-900/25' 
                    : 'bg-slate-50 border-slate-200 hover:border-blue-500/30 hover:bg-slate-100/30 hover:shadow-2xs'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest font-bold">
                      {agent.role}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono border ${
                      isDark 
                        ? 'bg-emerald-950/85 border-emerald-800/40 text-emerald-400' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      <span>{agent.status}</span>
                    </span>
                  </div>

                  {/* Emails */}
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{agent.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-[9px] text-slate-400 w-16">CC Manager:</span>
                      <span className="truncate">{agent.managerCc}</span>
                    </div>
                  </div>

                  <div className={`h-[1px] ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`} />

                  {/* Tasks */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Authorized Scope:</span>
                    <ul className="space-y-1">
                      {agent.tasks.map((task, sIdx) => (
                        <li key={sIdx} className="text-xs text-slate-400 flex items-center gap-1.5">
                          <span className="text-blue-600 text-xs font-bold">•</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Connected System summary badges */}
                <div className={`mt-5 pt-4 border-t ${isDark ? 'border-slate-900/60' : 'border-slate-200'}`}>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-2">Connected Systems:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.connectedSystems.map((sys, sIdx) => (
                      <span key={sIdx} className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-3xs'
                      }`}>
                        {sys}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 2. Internal Manager CC Section */}
      <section id="manager-cc" className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
        {isDark && (
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
        )}
        
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 space-y-16 relative z-10">
          
          <div 
            className="grid gap-6 md:gap-8 w-full max-w-[1200px] mx-auto items-center"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            
            {/* Left copy column */}
            <div className="space-y-6">
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
                isDark 
                  ? 'bg-violet-950/80 border-violet-500/30 text-violet-400' 
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                TRANSPARENCY AND VISIBILITY
              </div>
              
              <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Manager visibility without workflow bottlenecks.
              </h2>
              
              <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Every agent can have a dedicated internal manager automatically copied on relevant email threads. Managers get visibility into what the agent is doing without needing to manually trigger the workflow.
              </p>

              <div className={`p-4 rounded-xl border transition-colors duration-300 ${
                isDark ? 'bg-slate-900/30 border-slate-850' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="font-display font-bold text-blue-600 text-sm block">Visibility without manual follow-up</span>
                <p className="text-xs text-slate-400 leading-normal mt-1">
                  No approval gates or tedious intervention queues. Managers stay informed via native CC threads while agents execute operations completely in the background.
                </p>
              </div>
            </div>

            {/* Right: Simulated CC thread mockup (7 cols) */}
            <div className={`rounded-2xl border p-6 backdrop-blur-xl space-y-5 transition-colors duration-300 ${
              isDark 
                ? 'border-slate-800 bg-slate-900/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]' 
                : 'border-slate-200 bg-white shadow-xs'
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 transition-colors ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Automated Transparency Thread</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono ${
                  isDark 
                    ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-400' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>SYNCHRONIZED_OK</span>
                </span>
              </div>

              {/* Email Mockup */}
              <div className={`rounded-xl border p-4 space-y-3 font-mono text-xs transition-colors duration-300 ${
                isDark ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`space-y-1.5 text-[11px] text-slate-400 border-b pb-3 transition-colors ${isDark ? 'border-slate-900' : 'border-slate-200/80'}`}>
                  <div>
                    <span className="text-slate-400">From:</span> <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>vendor@company.com</span>
                  </div>
                  <div>
                    <span className="text-slate-400">To:</span> <span className="text-blue-600 font-bold">finance-agent@company.com</span>
                  </div>
                  <div>
                    <span className="text-slate-400">CC:</span> <span className="text-blue-600 font-bold">finance.manager@company.com</span>
                  </div>
                  <div className="pt-1.5">
                    <span className="text-slate-400">Subject:</span> <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Invoice update required</span>
                  </div>
                </div>

                <div className={`text-[11px] font-sans p-2 rounded border transition-colors ${
                  isDark ? 'bg-slate-900 border-slate-900 text-slate-400' : 'bg-white border-slate-150 text-slate-600'
                }`}>
                  <p>&ldquo;Hi Agent, please register our updated shipment ledger code INV-9021 in the accounting ERP.&rdquo;</p>
                </div>
              </div>

              {/* Progress Steps list for cc thread */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Operational Timeline Output:</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Agent handled request', desc: 'Read & parsed INV-9021 code' },
                    { label: 'ERP updated', desc: 'Committed ledger entry record' },
                    { label: 'Manager copied', desc: 'CC\'d finance.manager@' },
                    { label: 'Response sent', desc: 'Emailed reply receipt' }
                  ].map((step, sIdx) => (
                    <div key={sIdx} className={`flex items-start gap-2.5 p-3 rounded-lg border font-mono transition-colors duration-300 ${
                      isDark ? 'bg-slate-950 border-slate-900/60' : 'bg-slate-50 border-slate-200/60'
                    }`}>
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className={`text-[10px] font-bold block ${isDark ? 'text-slate-200' : 'text-slate-850'}`}>{step.label}</span>
                        <span className="text-[9px] text-slate-400">{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
