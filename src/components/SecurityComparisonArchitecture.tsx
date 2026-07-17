import { Mail, Server, Cpu, KeyRound, Workflow, Send, Users, ShieldCheck, Check, X } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function SecurityComparisonArchitecture() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const comparisonData = [
    {
      feature: 'User Interface',
      chatbot: 'User must open a chat window',
      helloAgent: 'User sends a standard email'
    },
    {
      feature: 'Execution Trigger',
      chatbot: 'User must prompt and wait manually',
      helloAgent: 'Agent runs completely in the background'
    },
    {
      feature: 'Session State',
      chatbot: 'Work happens only while user is present',
      helloAgent: 'Work continues without the user waiting on-screen'
    },
    {
      feature: 'Outcome Delivery',
      chatbot: 'Context often stays trapped in chat windows',
      helloAgent: 'Response arrives in the inbox when complete'
    },
    {
      feature: 'System Integrations',
      chatbot: 'Business systems stay disconnected',
      helloAgent: 'ERP, DB, CRM, and tools can be connected'
    },
    {
      feature: 'Multi-Agent Capabilities',
      chatbot: 'Not ideal for complex operational workflows',
      helloAgent: 'Multi-agent workflows coordinate complex tasks'
    }
  ];

  const trustPoints = [
    {
      title: 'Scoped agent instructions',
      desc: 'Define precise department playbooks that restrict what the agent understands and handles.'
    },
    {
      title: 'Allowed system actions',
      desc: 'Control read, write, or lookup access levels on connected databases and tools.'
    },
    {
      title: 'Internal manager visibility',
      desc: 'Managers are automatically marked in CC on all agent responses, providing complete transparency.'
    },
    {
      title: 'Activity logs',
      desc: 'Track every single email received, record fetched, database state updated, and reply sent.'
    },
    {
      title: 'Workflow boundaries',
      desc: 'Establish strict boundaries to ensure the agent never operates outside designated parameters.'
    },
    {
      title: 'Connected-system permissions',
      desc: 'Isolate sensitive ERP or CRM partitions via secured custom endpoint architectures.'
    },
    {
      title: 'Department-specific agents',
      desc: 'Isolate workflows with individual, purpose-built agent email addresses (e.g., ops-agent@).'
    },
    {
      title: 'Custom domains',
      desc: 'Authenticate agents under your corporate sending domain for trusted communication.'
    },
    {
      title: 'Audit-ready logs',
      desc: 'Complete background trace histories available for operational and structural auditing.'
    }
  ];

  const archNodes = [
    { title: 'Email Request', desc: 'Anita emails agent', icon: Mail },
    { title: 'Agent Inbox', desc: 'Dedicated identity', icon: Server },
    { title: 'Agent Runtime', desc: 'Autonomous execution', icon: Cpu },
    { title: 'Instructions', desc: 'Business guardrails', icon: KeyRound },
    { title: 'Connectors', desc: 'ERP / DB lookup', icon: Workflow },
    { title: 'Response Email', desc: 'Final outcome sent', icon: Send },
    { title: 'Manager CC', desc: 'Automatic visibility', icon: Users }
  ];

  return (
    <div id="security-control" className={`divide-y transition-colors duration-300 ${
      isDark ? 'divide-slate-900 bg-slate-950 text-white' : 'divide-slate-200 bg-white text-slate-800'
    }`}>
      
      {/* 1. Product Architecture Section */}
      <section id="architecture-section" className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
        {isDark && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        )}
        
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 space-y-16 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
              isDark 
                ? 'bg-blue-950/80 border-blue-500/30 text-blue-400' 
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              ARCHITECTURE SCHEMATIC
            </div>
            <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Pluggable today. Built for agent-led work.
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Start with one workflow. Add more agents, more tools, and more connected systems as the operating model grows.
            </p>
          </div>

          {/* Connected Pipeline visual */}
          <div className={`w-full max-w-[1200px] mx-auto rounded-3xl border p-6 md:p-8 transition-colors duration-300 ${
            isDark ? 'border-slate-900 bg-slate-950/40 shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 'border-slate-200 bg-[#f9fafb] shadow-xs'
          }`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 relative">
              {archNodes.map((node, idx) => {
                const Icon = node.icon;
                return (
                  <div
                    key={idx}
                    className={`relative flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-300 group ${
                      isDark 
                        ? 'border-slate-850 bg-slate-900/10 hover:border-slate-700 text-slate-300' 
                        : 'border-slate-200 bg-white hover:border-slate-350 text-slate-600 shadow-3xs'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-lg border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className={`text-xs font-bold font-mono mb-1 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{node.title}</h4>
                    <p className="text-[10px] text-slate-400 font-mono leading-tight">{node.desc}</p>

                    {/* Connecting pipes */}
                    {idx < archNodes.length - 1 && (
                      <div className="hidden lg:block absolute top-[30px] -right-3 w-6 h-[2px] bg-blue-600/20 pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className={`mt-8 pt-6 border-t text-center ${isDark ? 'border-slate-900' : 'border-slate-200/80'}`}>
              <span className="font-mono text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest">
                AUTOMATED INBOUND TO OUTBOUND PIPELINE IS SECURELY SEGREGATED
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Comparison Section */}
      <section id="comparison-section" className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
        {isDark && (
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        )}
        
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 space-y-16 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
              isDark 
                ? 'bg-blue-950/80 border-blue-500/30 text-blue-400' 
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              THE STRUCTURAL DIFFERENCE
            </div>
            <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Chatbots wait. Hello Agent works.
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Why bind your operations inside rigid chat portals when you can let work execute asynchronously where requests naturally arrive?
            </p>
          </div>

          {/* Comparison Table */}
          <div className={`w-full max-w-[1200px] mx-auto overflow-hidden rounded-2xl border transition-colors duration-300 ${
            isDark ? 'border-slate-900 bg-slate-950/80 shadow-xl' : 'border-slate-200 bg-white shadow-xs'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans">
                <thead>
                  <tr className={`border-b uppercase tracking-wider font-mono text-[10px] ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <th className="p-4 sm:p-5 font-bold w-1/4">Process Feature</th>
                    <th className={`p-4 sm:p-5 font-bold w-3/8 ${isDark ? 'border-r border-slate-850' : 'border-r border-slate-150'}`}>Chatbot-style AI</th>
                    <th className="p-4 sm:p-5 font-bold text-blue-600">Hello Agent</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-slate-600 transition-colors ${isDark ? 'divide-slate-900 text-slate-300' : 'divide-slate-150'}`}>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/50'}`}>
                      <td className={`p-4 sm:p-5 font-bold font-display ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{row.feature}</td>
                      <td className={`p-4 sm:p-5 text-slate-400 font-medium ${isDark ? 'border-r border-slate-900' : 'border-r border-slate-150'}`}>
                        <div className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{row.chatbot}</span>
                        </div>
                      </td>
                      <td className={`p-4 sm:p-5 font-semibold ${isDark ? 'text-white bg-blue-950/10' : 'text-slate-900 bg-blue-50/10'}`}>
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{row.helloAgent}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Security & Control Section */}
      <section id="security-control-matrix" className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
        {isDark && (
          <div className="absolute top-0 left-1/4 w-[450px] h-[350px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        )}
        
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 space-y-16 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
              isDark 
                ? 'bg-blue-950/80 border-blue-500/30 text-blue-400' 
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              OPERATIONAL GUARANTEES
            </div>
            <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Autonomous does not mean uncontrolled.
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Hello Agent can be configured with scoped instructions, allowed actions, connected systems, manager visibility, and workflow boundaries. Agents operate within the rules defined for their business function.
            </p>
          </div>

          {/* Scoped security points matrix */}
          <div 
            className="grid gap-6 w-full max-w-[1200px] mx-auto"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            {trustPoints.map((point, idx) => (
              <div
                key={idx}
                id={`trust-point-${idx}`}
                className={`p-6 rounded-2xl border transition-all duration-300 space-y-3 ${
                  isDark 
                    ? 'border-slate-900 bg-slate-900/20 hover:border-blue-500/20 hover:bg-slate-900/30' 
                    : 'border-slate-200 bg-slate-50/60 hover:border-blue-400/30 hover:bg-slate-100/30 hover:shadow-2xs'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg border flex items-center justify-center text-blue-600 transition-colors ${
                  isDark ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200 shadow-2xs'
                }`}>
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <h3 className={`font-display text-base font-bold transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{point.title}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{point.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="font-mono text-xs text-slate-400 tracking-wider">
              🛡️ AUDIT-READY OPERATION LOGS ARE PERSISTED FOR CONTINUOUS VERIFICATION
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
