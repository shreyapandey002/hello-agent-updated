import { useState } from 'react';
import { Network, Server, Cpu, Layers, MessageSquare, LineChart, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function HowItWorks() {
  const [activeChainStep, setActiveChainStep] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chainSteps = [
    { label: 'Customer Emails Ops Agent', detail: 'Inbound shipment check' },
    { label: 'Ops Agent Checks Shipment', detail: 'Queries logistics status' },
    { label: 'Finance Agent Checks Invoice', detail: 'Retrieves payment ledger' },
    { label: 'Reporting Agent Compiles Details', detail: 'Prepares structured report' },
    { label: 'Ops Agent Replies with Result', detail: 'Sends completion email response' }
  ];

  const statementCards = [
    { title: 'Agents should have addresses', desc: 'No complex logins. Reach your agent directly through a secure business email address.' },
    { title: 'Agents should receive work', desc: 'Emails with context, logs, invoices, and instructions are converted into background workflows.' },
    { title: 'Agents should run in the background', desc: 'Execute processes autonomously without holding up user attention on-screen.' },
    { title: 'Agents should update systems', desc: 'Write directly back to your ERP, CRM, databases, and custom accounting APIs.' },
    { title: 'Agents should respond with outcomes', desc: 'Deliver detailed completed summaries and receipts back into the conversation thread.' },
    { title: 'Agents should work together', desc: 'Specialized agents communicate and delegate sub-tasks dynamically amongst themselves.' }
  ];

  return (
    <div id="multi-agent-operating-layer" className={`divide-y transition-colors duration-300 ${
      isDark ? 'divide-slate-900 bg-slate-950 text-white' : 'divide-slate-200/80 bg-white text-slate-800'
    }`}>
      
      {/* 1. Multi-Agent Section */}
      <section id="multi-agent" className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
        {isDark && (
          <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        )}
        
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 space-y-16 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
              isDark 
                ? 'bg-blue-950/80 border-blue-500/30 text-blue-400' 
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              COLLABORATIVE NETWORKS
            </div>
            <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Build teams of agents, not just one inbox.
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Hello Agent supports multi-agent setups where different agents own different workflows and coordinate across email-driven tasks. Complex work does not need one giant agent. It can be handled by a network of specialised agents.
            </p>
          </div>

          {/* Collaborative Network Graphic & Chain simulator */}
          <div 
            className="grid gap-6 md:gap-8 w-full max-w-[1200px] mx-auto items-stretch"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            
            {/* Left: Central Orchestration Hub Graphic */}
            <div className={`rounded-2xl border p-6 md:p-8 relative flex flex-col justify-between transition-colors duration-300 ${
              isDark 
                ? 'border-slate-900 bg-slate-950/80 shadow-[0_0_50px_rgba(0,0,0,0.6)]' 
                : 'border-slate-200 bg-[#f9fafb] shadow-xs'
            }`}>
              
              <div className={`flex items-center justify-between border-b pb-3 transition-colors duration-300 ${isDark ? 'border-slate-900' : 'border-slate-200/80'}`}>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Orchestration Mesh Diagram</span>
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              </div>

              {/* Hub Visual */}
              <div className="relative py-8 flex items-center justify-center min-h-[260px]">
                
                {/* Orbital lines */}
                <div className={`absolute w-56 h-56 border rounded-full ${isDark ? 'border-slate-900' : 'border-slate-200'}`} />
                <div className={`absolute w-40 h-40 border border-dashed rounded-full ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />

                {/* Central Orchestrator Hub */}
                <div className="relative z-10 h-16 w-16 rounded-2xl bg-blue-600 border border-blue-500 flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-300">
                  <Network className="h-7 w-7 text-white" />
                  <span className="absolute -bottom-6 text-[9px] font-mono font-bold text-blue-600 uppercase tracking-widest">Mesh Hub</span>
                </div>

                {/* Surrounding Node Agents */}
                {[
                  { label: 'Intake', icon: Mail, pos: 'top-2 left-1/2 -translate-x-1/2' },
                  { label: 'Finance', icon: Cpu, pos: 'bottom-2 left-1/2 -translate-x-1/2' },
                  { label: 'Operations', icon: Layers, pos: 'left-2 top-1/2 -translate-y-1/2' },
                  { label: 'Support', icon: MessageSquare, pos: 'right-2 top-1/2 -translate-y-1/2' },
                  { label: 'Reporting', icon: LineChart, pos: 'top-10 left-10' },
                  { label: 'Sales', icon: Server, pos: 'bottom-10 right-10' },
                ].map((node, idx) => {
                  const Icon = node.icon;
                  return (
                    <div
                      key={idx}
                      className={`absolute ${node.pos} flex flex-col items-center group`}
                    >
                      <div className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                        isDark 
                          ? 'bg-slate-900 border-slate-800 group-hover:border-blue-500/40 text-slate-300' 
                          : 'bg-white border-slate-200 group-hover:border-blue-500/60 text-slate-600 shadow-2xs'
                      }`}>
                        <Icon className="h-4.5 w-4.5 text-blue-600" />
                      </div>
                      <span className={`text-[9px] font-mono mt-1 uppercase tracking-wider group-hover:text-blue-600 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{node.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Subtitle */}
              <p className="text-center text-xs text-slate-400 font-mono mt-4">
                SPECIALIZED NODES COOPERATING ON COMPLEX INBOUND DATAFLOWS
              </p>
            </div>

            {/* Right: Example Interactive Chain Workflow */}
            <div className={`rounded-2xl border p-6 flex flex-col justify-between transition-colors duration-300 ${
              isDark ? 'border-slate-900 bg-slate-900/10' : 'border-slate-200 bg-slate-50/50'
            }`}>
              
              <div className="space-y-4">
                <div className={`flex items-center justify-between border-b pb-2 transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-200/80'}`}>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Workflow Chain</span>
                  <button
                    onClick={() => setActiveChainStep((prev) => (prev + 1) % chainSteps.length)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-mono cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-4">
                  {chainSteps.map((step, idx) => {
                    const isActive = idx === activeChainStep;
                    const isPassed = idx < activeChainStep;

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 transition-all duration-300 ${
                          isActive ? 'opacity-100 scale-[1.01]' : isPassed ? 'opacity-50' : 'opacity-25'
                        }`}
                      >
                        <div className={`h-6 w-6 rounded-full font-mono text-[10px] font-bold flex items-center justify-center border shrink-0 mt-0.5 ${
                          isActive
                            ? 'bg-blue-600 text-white border-transparent'
                            : isPassed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isDark
                              ? 'bg-slate-900 text-slate-600 border-slate-800'
                              : 'bg-white text-slate-400 border-slate-200 shadow-2xs'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold leading-tight ${isActive ? 'text-blue-600' : isDark ? 'text-slate-200' : 'text-slate-850'}`}>
                            {step.label}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{step.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`pt-6 border-t mt-6 text-center lg:text-left transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-200/60'}`}>
                <span className="text-[11px] text-slate-400 italic">
                  Press &ldquo;Next Step&rdquo; to simulate collaborative multi-agent routing.
                </span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 2. Future of Work Section */}
      <section id="future-of-work" className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
        {isDark && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />
        )}
        
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 space-y-16 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
              isDark 
                ? 'bg-violet-950/80 border-violet-500/30 text-violet-400' 
                : 'bg-violet-50 border-violet-200 text-violet-600'
            }`}>
              THE FUTURE PLATFORM
            </div>
            <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              The future of work is not another app.<br />
              <span className="text-blue-600 font-extrabold">
                It is agents that can be reached.
              </span>
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Business users should not need to learn a new interface for every workflow. They already know how to send email. Hello Agent makes agents reachable, pluggable, and operational today.
            </p>
          </div>

          {/* Bold Statement Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1200px] mx-auto">
            {statementCards.map((card, idx) => (
              <div
                key={idx}
                id={`statement-card-${idx}`}
                className={`p-6 rounded-2xl border transition-all duration-300 space-y-3 ${
                  isDark 
                    ? 'border-slate-900 bg-slate-900/20 hover:border-blue-500/20 hover:bg-slate-900/30' 
                    : 'border-slate-200 bg-white hover:border-blue-400/30 hover:bg-slate-50 hover:shadow-xs'
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border text-blue-600 transition-colors duration-300 ${
                  isDark ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-200'
                }`}>
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <h3 className={`font-display text-base font-bold transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-slate-850'}`}>{card.title}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Futuristic command network visual caption */}
          <div className={`rounded-3xl border p-6 w-full max-w-[1200px] mx-auto relative overflow-hidden transition-colors duration-300 ${
            isDark ? 'border-slate-900 bg-slate-950' : 'border-slate-200 bg-[#fafafa]'
          }`}>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h4 className={`text-xs font-bold font-mono uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-700'}`}>
                  DELEGATED SYSTEM DISPATCH HUB
                </h4>
                <p className="text-xs text-slate-400 leading-normal max-w-2xl">
                  Emails flow seamlessly into custom routing identities where core computational runtimes orchestrate system writes, ledger registers, and thread responses autonomously.
                </p>
              </div>
              <span className={`text-[10px] sm:text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg shrink-0 border ${
                isDark 
                  ? 'text-cyan-400 border-cyan-800/40 bg-cyan-950/60' 
                  : 'text-blue-600 border-blue-200 bg-blue-50'
              }`}>
                MESH_CONNECTED_NODE_ACTIVE
              </span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
