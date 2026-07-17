import { useState, useEffect, MouseEvent } from 'react';
import { Menu, X, Mail, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface NavbarProps {
  onBookDemo: () => void;
}

export default function Navbar({ onBookDemo }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { label: 'Product', id: 'new-work-interface' },
    { label: 'Agents', id: 'dedicated-agents' },
    { label: 'Sandbox', id: 'agent-sandbox' },
    { label: 'Integrations', id: 'integrations' },
    { label: 'Multi-Agent', id: 'multi-agent' },
    { label: 'Security', id: 'security-control' },
    { label: 'Pricing', id: 'pricing-section' },
  ];

  return (
    <nav
      id="main-navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-900 shadow-lg shadow-black/45'
            : 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-md transition-all group-hover:scale-105">
                <Mail className="h-5 w-5 text-white stroke-[2.5]" />
              </div>
              <span className={`font-display text-xl font-bold tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Hello<span className="text-blue-600 font-extrabold">Agent</span>
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`text-sm font-medium transition-all relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full ${
                  isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Nav Actions (Toggle + CTA) */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              id="theme-toggle-btn"
              aria-label="Toggle light or dark theme"
              className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <button
              onClick={onBookDemo}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.01]"
            >
              Book a Demo
            </button>
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Theme Toggle Button for Mobile */}
            <button
              onClick={toggleTheme}
              id="theme-toggle-btn-mobile"
              aria-label="Toggle theme mobile"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-slate-900 text-slate-300'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`inline-flex items-center justify-center rounded-xl p-2.5 transition-colors ${
                isDark ? 'text-slate-400 hover:bg-slate-900 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-b backdrop-blur-lg px-4 pt-2 pb-6 space-y-2 transition-colors duration-300 ${
          isDark ? 'bg-slate-950/95 border-slate-900' : 'bg-white/95 border-slate-200'
        }`}>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className={`block rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                isDark ? 'text-slate-300 hover:bg-slate-900 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.label}
            </a>
          ))}
          <div className="pt-4 px-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookDemo();
              }}
              className="w-full text-center rounded-xl bg-blue-600 py-3 text-base font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              Book a Demo
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
