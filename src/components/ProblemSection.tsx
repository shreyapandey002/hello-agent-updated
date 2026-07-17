import { Mail, ShieldClose, Layers, FileText, Send, SquareSlash } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function ProblemSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const interfaceCards = [
    {
      title: 'No dashboard required',
      desc: 'Users or clients never need to learn another software platform or login portal. They work entirely in their own email client.',
      icon: SquareSlash,
    },
    {
      title: 'No manual trigger required',
      desc: 'No workflows to configure manually, no scheduled jobs, and no buttons to press. The email itself initiates action.',
      icon: Layers,
    },
    {
      title: 'No prompt window required',
      desc: 'Stop fighting with long text boxes or prompt tuning. Agents are governed by robust operational boundaries.',
      icon: FileText,
    },
    {
      title: 'No context switching',
      desc: 'Keep information in context. Agents operate across existing business tools silently while keeping managers in the CC loop.',
      icon: ShieldClose,
    },
    {
      title: 'Just send an email and wait',
      desc: 'Send a request, walk away, and await the response. Autonomous operation ensures records are updated in real time.',
      icon: Send,
    }
  ];

  return (
    <section 
      id="new-work-interface" 
      className={`relative py-12 md:py-16 lg:py-24 transition-colors duration-300 border-t ${
        isDark ? 'bg-slate-950 text-white border-slate-900' : 'bg-white text-slate-800 border-slate-200/60'
      }`}
    >
      {isDark && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
      )}
      
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading and copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
              isDark 
                ? 'bg-slate-900/80 border-slate-800 text-slate-300' 
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              THE ZERO-DASHBOARD PARADIGM
            </div>
            
            <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Work should start with an email,{' '}
              <span className="text-blue-600 font-extrabold">
                not another dashboard.
              </span>
            </h2>
            
            <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Most business work still begins in email. Requests, documents, approvals, escalations, invoices, shipment updates, support tickets, and operational queries all arrive in inboxes.
            </p>

            <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Hello Agent turns those emails into executable work. The agent receives the request, runs the workflow, updates connected systems, and replies with the result.
            </p>

            <div className="pt-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl border max-w-md transition-colors duration-300 ${
                isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold font-mono uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email is the Universal API
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal">Connects your partners, clients, and internal nodes without integration overhead.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual cards stack */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {interfaceCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  id={`interface-card-${idx}`}
                  className={`group p-6 rounded-2xl border transition-all duration-300 ${
                    isDark 
                      ? 'bg-slate-900/20 border-slate-900 hover:border-blue-500/20 hover:bg-slate-900/40' 
                      : 'bg-white border-slate-200 hover:border-blue-400/30 hover:bg-slate-50 hover:shadow-xs'
                  } ${idx === 4 ? 'sm:col-span-2' : ''}`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border mb-4 transition-all duration-300 ${
                    isDark ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  
                  <h3 className={`font-display text-lg font-bold mb-2 transition-colors duration-300 ${
                    isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'
                  }`}>
                    {card.title}
                  </h3>
                  
                  <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${
                    isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600'
                  }`}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
