import { INTEGRATION_CARDS } from '../data';
import { Layers, Database, Users, Ticket, CreditCard, BookOpen, FolderOpen, Cpu, CheckCircle } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function Integrations() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getIcon = (name: string) => {
    const size = 'h-5 w-5 text-blue-600';
    switch (name) {
      case 'ERP':
        return <Layers className={size} />;
      case 'Database':
        return <Database className={size} />;
      case 'CRM':
        return <Users className={size} />;
      case 'Ticketing System':
        return <Ticket className={size} />;
      case 'Accounting Software':
        return <CreditCard className={size} />;
      case 'Knowledge Base':
        return <BookOpen className={size} />;
      case 'File Storage':
        return <FolderOpen className={size} />;
      case 'Internal APIs':
        return <Cpu className={size} />;
      default:
        return <Layers className={size} />;
    }
  };

  return (
    <section 
      id="integrations" 
      className={`relative py-12 md:py-16 lg:py-24 border-t transition-colors duration-300 ${
        isDark ? 'bg-slate-950 border-slate-900 text-white' : 'bg-white border-slate-200/60 text-slate-800'
      }`}
    >
      {isDark && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
      )}

      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 relative z-10 space-y-16">
        
        {/* Header copy */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
            isDark 
              ? 'bg-indigo-950/80 border-indigo-500/30 text-indigo-400' 
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            SECURE SYSTEMS ACCESS
          </div>
          <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Plug agents into the systems<br />where work actually happens.
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Hello Agent doesn&apos;t operate in a vacuum. It securely integrates with your enterprise resource planners (ERP), client relationship managers (CRM), transactional databases, and internal APIs to read, write, and synchronize data automatically.
          </p>
        </div>

        {/* Integrations Grid */}
        <div 
          className="grid gap-6 w-full max-w-[1200px] mx-auto"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {INTEGRATION_CARDS.map((card, idx) => (
            <div
              key={idx}
              id={`integration-card-${idx}`}
              className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isDark 
                  ? 'bg-slate-900/10 border-slate-900 hover:border-indigo-500/30 hover:bg-slate-900/25' 
                  : 'bg-slate-50 border-slate-200 hover:border-blue-500/30 hover:bg-slate-100/30 hover:shadow-xs'
              }`}
            >
              <div className="space-y-4">
                {/* Card Header with connection indicators */}
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-850' : 'bg-white border-slate-200 shadow-2xs'
                  }`}>
                    {getIcon(card.name)}
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isDark 
                      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-900/40' 
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}>
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    <span>READY</span>
                  </span>
                </div>

                {/* Body details */}
                <div className="space-y-1.5">
                  <h3 className={`font-display text-base font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {card.name}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-normal transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {card.actions}
                  </p>
                </div>
              </div>

              {/* Verified sync mark */}
              <div className={`mt-5 pt-3 border-t flex items-center gap-1.5 font-mono text-[9px] text-slate-400 transition-colors duration-300 ${
                isDark ? 'border-slate-800' : 'border-slate-200/60'
              }`}>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span>SECURE WRITE_SYNC ENABLED</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary warning/safeguard */}
        <div className={`rounded-2xl border p-6 max-w-3xl mx-auto text-center font-mono text-[11px] text-slate-400 transition-colors duration-300 ${
          isDark ? 'border-slate-900 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}>
          <span>🔒 ALL DATA CHANNELS ARE MUTUALLY ENCRYPTED OVER SECURE SERVICE LAYER PROTOCOLS</span>
        </div>

      </div>
    </section>
  );
}
