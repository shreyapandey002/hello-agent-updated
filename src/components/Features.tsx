import { FEATURES_LIST } from '../data';
import {
  Mail,
  Zap,
  Paperclip,
  Layers,
  FileJson,
  UserCheck,
  ExternalLink,
  Sliders,
  History,
  ShieldCheck,
  Globe,
  GitMerge,
  Compass,
  Cpu,
  Workflow,
  Send
} from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function Features() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getIcon = (idx: number) => {
    const size = 'h-4 w-4 text-blue-600';
    switch (idx) {
      case 0: return <Mail className={size} />;
      case 1: return <Zap className={size} />;
      case 2: return <Compass className={size} />;
      case 3: return <Paperclip className={size} />;
      case 4: return <Layers className={size} />;
      case 5: return <FileJson className={size} />;
      case 6: return <UserCheck className={size} />;
      case 7: return <Workflow className={size} />;
      case 8: return <GitMerge className={size} />;
      case 9: return <Sliders className={size} />;
      case 10: return <History className={size} />;
      case 11: return <ShieldCheck className={size} />;
      case 12: return <Globe className={size} />;
      case 13: return <Cpu className={size} />;
      case 14: return <ExternalLink className={size} />;
      case 15: return <Send className={size} />;
      case 16: return <FileJson className={size} />;
      case 17: return <UserCheck className={size} />;
      default: return <Zap className={size} />;
    }
  };

  return (
    <section id="features" className={`py-12 md:py-16 lg:py-24 border-t overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-slate-900 text-white' : 'bg-white border-slate-200/60 text-slate-800'
    }`}>
      {isDark && (
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[300px] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none" />
      )}
      
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 space-y-16 relative z-10">
        
        {/* Header copy */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
            isDark 
              ? 'bg-cyan-950/80 border-cyan-500/30 text-cyan-400' 
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            ENGINEERED CAPABILITIES
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Built for email-native agent operations.
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Every technical capability needed to securely capture inbound, parse parameters, query state, update systems, and dispatch complete threads.
          </p>
        </div>

        {/* Feature Bento Grid */}
        <div 
          className="grid gap-6 w-full max-w-[1200px] mx-auto"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {FEATURES_LIST.map((feat, idx) => (
            <div
              key={idx}
              id={`feature-item-${idx}`}
              className={`p-6 rounded-2xl border transition-all duration-300 group flex gap-4 items-start ${
                isDark 
                  ? 'bg-slate-900/10 border-slate-900 hover:border-slate-800 hover:bg-slate-900/30' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}>
                {getIcon(idx)}
              </div>
              
              <div className="space-y-1.5">
                <h3 className={`text-sm font-bold transition-colors ${
                  isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'
                }`}>
                  {feat.title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
