import { Mail, ArrowRight, Server, Search, Terminal, Database, Send, Users } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function ProductExplanation() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const steps = [
    {
      label: 'User sends email',
      desc: 'Inbound message triggers workspace',
      icon: Mail,
    },
    {
      label: 'Hello Agent inbox',
      desc: 'Secure email routing gateway',
      icon: Server,
    },
    {
      label: 'Agent identifies task',
      desc: 'Neural intent analysis',
      icon: Search,
    },
    {
      label: 'Checks connected tools',
      desc: 'Reads target ERP & CRM details',
      icon: Terminal,
    },
    {
      label: 'Updates ERP / DB / CRM',
      desc: 'Writes state back in background',
      icon: Database,
    },
    {
      label: 'Replies with result',
      desc: 'Dispatches detailed outcome',
      icon: Send,
    },
    {
      label: 'Manager stays CC\'d',
      desc: 'Complete transparency automatically',
      icon: Users,
    }
  ];

  return (
    <section 
      id="product-explanation" 
      className={`relative py-12 md:py-16 lg:py-24 border-t transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-white border-slate-900' : 'bg-[#fafafa] text-slate-800 border-slate-200/60'
      }`}
    >
      {isDark ? (
        <>
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />
        </>
      ) : (
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[140px] pointer-events-none" />
      )}

      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
            isDark 
              ? 'bg-slate-900/80 border-slate-800 text-slate-300' 
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            OPERATING SYSTEM FOR AGENTS
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            What is Hello Agent?
          </h2>
          <p className={`text-sm sm:text-base md:text-lg leading-relaxed transition-colors duration-300 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Hello Agent is an email-native agent layer for business workflows. Each agent gets a dedicated email address, business instructions, connected tools, and a runtime that can process incoming requests in the background.
          </p>
        </div>

        {/* Horizontal/Vertical Visual Flow Diagram */}
        <div className={`rounded-3xl border p-6 md:p-10 transition-colors duration-300 ${
          isDark 
            ? 'border-slate-900 bg-slate-950/60 shadow-[0_0_50px_rgba(0,0,0,0.5)]' 
            : 'border-slate-200 bg-white shadow-xs'
        } max-w-6xl mx-auto space-y-8`}>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  id={`explanation-step-${idx}`}
                  className={`relative flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-300 group ${
                    isDark 
                      ? 'bg-slate-900/30 border-slate-850/80 hover:border-slate-750' 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Step counter */}
                  <span className={`absolute top-3 left-3 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold border transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-slate-500 group-hover:text-blue-400 group-hover:border-blue-500/30' 
                      : 'bg-white border-slate-200 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-600'
                  }`}>
                    0{idx + 1}
                  </span>

                  {/* Icon wrapper */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border mb-4 group-hover:scale-110 transition-transform duration-300 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-3xs'
                  }`}>
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>

                  {/* Text Details */}
                  <h4 className={`font-display text-xs sm:text-sm font-bold mb-2 leading-tight transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {step.label}
                  </h4>
                  <p className={`text-[10px] sm:text-xs font-medium leading-relaxed transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {step.desc}
                  </p>

                  {/* Connector arrow line for desktop screens */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-20 text-slate-300 dark:text-slate-800">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Flow status footer bar */}
          <div className={`flex flex-col sm:flex-row items-center justify-between border-t pt-6 gap-4 ${
            isDark ? 'border-slate-900' : 'border-slate-150'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span className="font-mono text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest">
                INTEGRATION PROTOCOL: ACTIVE
              </span>
            </div>
            <div className="text-center sm:text-right">
              <p className={`text-xs sm:text-sm font-display font-medium italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                &ldquo;The inbox becomes the trigger. The agent becomes the operator.&rdquo;
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
