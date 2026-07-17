import { Mail, Play, Cpu, Server, Database, Globe, ShieldCheck, Sparkles } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface HeroProps {
  onBookDemo: () => void;
  onSeeHowItWorks: () => void;
}

export default function Hero({ onBookDemo, onSeeHowItWorks }: HeroProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section 
      id="hero-section" 
      className={`relative min-h-screen pt-32 pb-24 overflow-hidden flex flex-col justify-center transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-white' : 'bg-[#fafafa] text-slate-800'
      }`}
    >
      {/* Decorative subtle background accents */}
      {isDark ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.5),rgba(2,6,23,1))]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[300px] bg-indigo-600/5 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </>
      ) : (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-100/40 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </>
      )}

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 md:px-6 text-center">
        {/* Hero Badge */}
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-8 shadow-xs border transition-colors duration-300 ${
          isDark 
            ? 'bg-slate-900/80 border-slate-800 text-slate-300' 
            : 'bg-white border-slate-200 text-slate-600'
        }`}>
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span>Email-native agents for autonomous business workflows</span>
        </div>

        {/* Headline */}
        <h1 className={`font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6 transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Give every agent an inbox. <br />
          <span className="text-blue-600 font-extrabold">
            Let work run itself.
          </span>
        </h1>

        {/* Subheading */}
        <p className={`text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10 transition-colors duration-300 ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Hello Agent gives AI agents their own email identity so teams can send a request, step away, and receive the completed result. Connect agents to ERP, databases, CRM, and internal systems so work can move through email without another dashboard.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onBookDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white shadow-md transition-all cursor-pointer"
          >
            Book a Demo
          </button>
          <button
            onClick={onSeeHowItWorks}
            className={`w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 hover:bg-slate-800/85' 
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
            }`}
          >
            <Play className="h-4 w-4 text-blue-500 fill-blue-500" />
            Explore the Sandbox
          </button>
        </div>

        {/* Muted status indicators row */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mb-16">
          {[
            { label: 'Email received', color: isDark ? 'border-slate-800 text-slate-300 bg-slate-900/20' : 'border-slate-200 text-slate-600 bg-white' },
            { label: 'Agent running', color: isDark ? 'border-slate-800 text-slate-300 bg-slate-900/20' : 'border-slate-200 text-slate-600 bg-white' },
            { label: 'ERP updated', color: isDark ? 'border-slate-800 text-slate-300 bg-slate-900/20' : 'border-slate-200 text-slate-600 bg-white' },
            { label: 'Database synced', color: isDark ? 'border-slate-800 text-slate-300 bg-slate-900/20' : 'border-slate-200 text-slate-600 bg-white' },
            { label: 'Manager CC’d', color: isDark ? 'border-slate-800 text-slate-300 bg-slate-900/20' : 'border-slate-200 text-slate-600 bg-white' },
            { label: 'Response sent', color: isDark ? 'border-slate-800 text-slate-300 bg-slate-900/20' : 'border-slate-200 text-slate-600 bg-white' },
          ].map((chip, idx) => (
            <span
              key={idx}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-medium ${chip.color} shadow-xs transition-colors duration-300`}
            >
              • {chip.label}
            </span>
          ))}
        </div>

        {/* Large Professional Product Mockup */}
        <div className={`relative mx-auto w-full max-w-[1200px] rounded-2xl border transition-all duration-300 p-4 md:p-6 ${
          isDark 
            ? 'border-slate-800/80 bg-slate-950/60 shadow-[0_0_50px_rgba(30,41,59,0.3)]' 
            : 'border-slate-200 bg-white shadow-md shadow-slate-200/50'
        }`}>
          {/* Top window dots */}
          <div className={`flex items-center gap-2 pb-4 mb-4 border-b transition-colors duration-300 ${
            isDark ? 'border-slate-900' : 'border-slate-100'
          }`}>
            <div className="h-3 w-3 rounded-full bg-slate-300" />
            <div className="h-3 w-3 rounded-full bg-slate-300" />
            <div className="h-3 w-3 rounded-full bg-slate-300" />
            <span className="text-xs text-slate-400 font-mono ml-4 select-none">hello-agent-runtime-v4.1.0</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            {/* Left Column: Incoming Email */}
            <div className={`rounded-xl border p-5 space-y-4 lg:col-span-4 transition-colors duration-300 ${
              isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 transition-colors duration-300 ${isDark ? 'border-slate-800/80' : 'border-slate-200/60'}`}>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Incoming Email</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
              
              <div className="space-y-1 text-xs font-mono">
                <div>
                  <span className="text-slate-400">From:</span>{' '}
                  <span className={`font-semibold ${isDark ? 'text-blue-300' : 'text-slate-700'}`}>anita@clientcompany.com</span>
                </div>
                <div>
                  <span className="text-slate-400">To:</span>{' '}
                  <span className={`font-semibold ${isDark ? 'text-cyan-300' : 'text-slate-700'}`}>ops-agent@helloagent.ai</span>
                </div>
                <div>
                  <span className="text-slate-400">CC:</span>{' '}
                  <span className={`font-semibold ${isDark ? 'text-violet-300' : 'text-slate-700'}`}>manager@clientcompany.com</span>
                </div>
                <div className={`pt-1 border-t mt-1.5 transition-colors duration-300 ${isDark ? 'border-slate-800/60' : 'border-slate-200/60'}`}>
                  <span className="text-slate-400">Subject:</span>{' '}
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Update shipment status</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-lg border text-xs leading-relaxed font-sans transition-colors duration-300 ${
                isDark ? 'bg-slate-950/80 border-slate-900/50 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <p className="font-semibold text-slate-400 mb-1">Hi Agent,</p>
                <p>Please check shipment MS-4821, update the invoice status in our ERP, and send me the pending payment summary.</p>
                <p className="mt-3 text-slate-400">Thanks,<br />Anita</p>
              </div>
            </div>

            {/* Middle Column: Agent Runtime */}
            <div className={`rounded-xl border p-5 space-y-4 lg:col-span-4 transition-colors duration-300 ${
              isDark ? 'bg-slate-900/70 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 transition-colors duration-300 ${isDark ? 'border-slate-800/80' : 'border-slate-200/60'}`}>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Agent Runtime</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <Cpu className="h-2.5 w-2.5 animate-spin text-blue-500" />
                  <span>AUTONOMOUS_RUN</span>
                </span>
              </div>

              <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                <div className="flex items-start gap-2 text-slate-400">
                  <span className="text-blue-500">⚡</span>
                  <div>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Task detected:</span>{' '}
                    <span className="text-blue-600 font-bold">Shipment + invoice update</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-400">
                  <span className="text-blue-500">⚡</span>
                  <div>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Connected system:</span>{' '}
                    <span className="text-slate-500 font-medium">ERP Production Node</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-400">
                  <span className="text-emerald-500">✓</span>
                  <div>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Record found:</span>{' '}
                    <span className="text-emerald-600">MS-4821</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-400">
                  <span className="text-emerald-500">✓</span>
                  <div>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Shipment status:</span>{' '}
                    <span className="text-slate-700">In Transit</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-400">
                  <span className="text-emerald-500">✓</span>
                  <div>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Invoice status updated:</span>{' '}
                    <span className="text-blue-600 font-semibold">Partially Paid</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-400">
                  <span className="text-emerald-500">✓</span>
                  <div>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Pending amount check:</span>{' '}
                    <span className="text-slate-800 font-semibold">₹24,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Result Delivered */}
            <div className={`rounded-xl border p-5 space-y-4 lg:col-span-4 transition-colors duration-300 ${
              isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 transition-colors duration-300 ${isDark ? 'border-slate-800/80' : 'border-slate-200/60'}`}>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Result Delivered</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              <div className="space-y-1 text-xs font-mono">
                <div><span className="text-slate-400">To:</span> <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>anita@clientcompany.com</span></div>
                <div><span className="text-slate-400">CC:</span> <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>manager@clientcompany.com</span></div>
                <div><span className="text-slate-400">Status:</span> <span className="text-emerald-600 font-semibold">SUCCESS_DISPATCHED</span></div>
              </div>

              <div className={`p-3.5 rounded-lg border text-xs space-y-2 leading-relaxed transition-colors duration-300 ${
                isDark ? 'bg-slate-950/80 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-600 shadow-xs'
              }`}>
                <p className="font-semibold text-slate-400">Hi Anita,</p>
                <p>Shipment MS-4821 is currently <strong className="text-blue-600 font-semibold">In Transit</strong>.</p>
                <p>I have updated the invoice status in the ERP as <strong className="text-emerald-600 font-semibold">Partially Paid</strong>.</p>
                <div className={`p-2 rounded border font-mono text-[10px] space-y-0.5 transition-colors duration-300 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>Pending: <span className="text-blue-600 font-bold">₹24,000</span></div>
                  <div>Sync Ref: ERP-MS-4821-X</div>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">I have copied your internal manager on this thread.</p>
                <p className="text-xs text-slate-500 mt-2 font-mono">Regards,<br />Hello Agent</p>
              </div>
            </div>
          </div>

          {/* Connected Systems (Below) */}
          <div className={`mt-8 pt-6 border-t transition-colors duration-300 ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest text-center mb-6">
              SECURED CONNECTIONS TO CLIENT SYSTEMS
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name: 'ERP System', icon: Server },
                { name: 'Database', icon: Database },
                { name: 'CRM Hub', icon: Globe },
                { name: 'Internal APIs', icon: Cpu },
                { name: 'Knowledge Base', icon: ShieldCheck },
              ].map((sys, idx) => {
                const Icon = sys.icon;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                      isDark 
                        ? 'text-slate-200 bg-slate-900/40 border-slate-800 hover:border-slate-700' 
                        : 'text-slate-700 bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg border transition-colors duration-300 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-xs font-bold font-mono">{sys.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
