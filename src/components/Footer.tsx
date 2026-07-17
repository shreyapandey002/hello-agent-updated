import { MouseEvent } from 'react';
import { Mail } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface FooterProps {
  onLinkClick: (id: string) => void;
}

export default function Footer({ onLinkClick }: FooterProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    onLinkClick(id);
  };

  return (
    <footer 
      id="footer-section" 
      className={`border-t relative overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-white border-slate-900' : 'bg-slate-50 text-slate-800 border-slate-200'
      }`}
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-16 relative z-10">
        <div className={`grid grid-cols-1 md:grid-cols-12 gap-10 items-start border-b pb-12 transition-colors ${
          isDark ? 'border-slate-900' : 'border-slate-200'
        }`}>
          
          {/* Logo & Pitch (6 cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <Mail className="h-5 w-5 text-white stroke-[2.5]" />
              </div>
              <span className={`font-display text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Hello<span className="text-blue-600 font-extrabold">Agent</span>
              </span>
            </div>
            <p className={`text-xs md:text-sm max-w-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Autonomous email agents for business workflows. Hello Agent lets you create dedicated email identities that receive emails, parse attachments, update databases and ERPs, and reply automatically.
            </p>
          </div>

          {/* Nav Links (6 cols) */}
          <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs md:text-sm">
            
            <div className="space-y-3">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] font-mono">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#product-explanation"
                    onClick={(e) => handleNavClick(e, 'product-explanation')}
                    className={`transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    What is Hello Agent?
                  </a>
                </li>
                <li>
                  <a
                    href="#agent-sandbox"
                    onClick={(e) => handleNavClick(e, 'agent-sandbox')}
                    className={`transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    Sandbox Sandbox
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    onClick={(e) => handleNavClick(e, 'features')}
                    className={`transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    Product Features
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] font-mono">Use Cases</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#use-cases"
                    onClick={(e) => handleNavClick(e, 'use-cases')}
                    className={`transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    Operations Agent
                  </a>
                </li>
                <li>
                  <a
                    href="#use-cases"
                    onClick={(e) => handleNavClick(e, 'use-cases')}
                    className={`transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    Finance Agent
                  </a>
                </li>
                <li>
                  <a
                    href="#use-cases"
                    onClick={(e) => handleNavClick(e, 'use-cases')}
                    className={`transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    HR Vetting
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] font-mono">Enterprise</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#security-control-matrix"
                    onClick={(e) => handleNavClick(e, 'security-control-matrix')}
                    className={`transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    Security & Control
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing-section"
                    onClick={(e) => handleNavClick(e, 'pricing-section')}
                    className={`transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    Pricing Models
                  </a>
                </li>
                <li>
                  <a
                    href="#final-cta"
                    onClick={(e) => handleNavClick(e, 'final-cta')}
                    className={`font-bold transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                  >
                    Get Started
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Small footer line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <span>&copy; {new Date().getFullYear()} Hello Agent Inc. All rights reserved.</span>
          <span className="font-semibold text-slate-400 tracking-wider uppercase font-mono text-[10px]">
            AUTONOMOUS OPERATIONS FOR ENTERPRISE INBOXES.
          </span>
        </div>

      </div>
    </footer>
  );
}
