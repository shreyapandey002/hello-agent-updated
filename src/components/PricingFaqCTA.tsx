import { useState, MouseEvent } from 'react';
import { FAQ_LIST } from '../data';
import { Check, ChevronDown, ChevronUp, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface PricingFaqCTAProps {
  onBookDemo: () => void;
  onExploreUseCases: () => void;
}

export default function PricingFaqCTA({ onBookDemo, onExploreUseCases }: PricingFaqCTAProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleExploreClick = (e: MouseEvent) => {
    e.preventDefault();
    onExploreUseCases();
  };

  const pricingCards = [
    {
      name: 'Starter',
      tagline: 'For single inbox workflows.',
      price: '₹21,000',
      period: '/ month',
      features: [
        '1 active agent identity',
        'Up to 500 tasks / month',
        'Standard ERP/DB integrations',
        'Automatic manager CC',
        'Standard domain routing'
      ],
      cta: 'Get Started with Starter',
      isPopular: false
    },
    {
      name: 'Professional',
      tagline: 'For multi-agent operations.',
      price: '₹42,000',
      period: '/ month',
      features: [
        '5 active agent identities',
        'Up to 2,500 tasks / month',
        'Advanced ERP/DB/CRM integration support',
        'Thread-aware context memory',
        'Custom business rules playbooks'
      ],
      cta: 'Go Professional',
      isPopular: true
    },
    {
      name: 'Enterprise',
      tagline: 'For full workforce automation.',
      price: 'Custom Pricing',
      period: '',
      features: [
        'Unlimited agent identities',
        'Unlimited operational volumes',
        'Custom endpoint integrations',
        'Dedicated execution boundaries',
        '24/7 priority support'
      ],
      cta: 'Contact Sales',
      isPopular: false
    }
  ];

  return (
    <div id="pricing-faq-cta-wrapper" className={`divide-y transition-colors duration-300 ${
      isDark ? 'divide-slate-900 bg-slate-950 text-white' : 'divide-slate-200 bg-white text-slate-800'
    }`}>
      
      {/* 1. Pricing Section */}
      <section id="pricing-section" className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
        {isDark && (
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        )}
        
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 space-y-16 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
              isDark 
                ? 'bg-blue-950/80 border-blue-500/30 text-blue-400' 
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              PREDICTABLE PLANS
            </div>
            <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Start with one agent.<br />Scale into an agent workforce.
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Predictable plans based on active agent identities and message volumes. Upgrade anytime.
            </p>
          </div>

          <div 
            className="grid gap-8 w-full max-w-[1200px] mx-auto items-stretch"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            {pricingCards.map((card, idx) => (
              <div
                key={idx}
                id={`pricing-card-${idx}`}
                className={`p-8 rounded-3xl border flex flex-col justify-between relative transition-all duration-300 hover:scale-[1.01] ${
                  card.isPopular
                    ? isDark
                      ? 'border-blue-500 bg-slate-900/30 ring-1 ring-blue-500/10 shadow-lg z-10'
                      : 'border-blue-600 bg-white ring-1 ring-blue-500/10 shadow-lg z-10'
                    : isDark
                      ? 'border-slate-900 bg-slate-950/40'
                      : 'border-slate-250 bg-slate-50'
                }`}
              >
                {card.isPopular && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 text-white font-mono font-bold text-[9px] tracking-widest px-3.5 py-1.5 uppercase shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h3 className={`font-display text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {card.name}
                    </h3>
                    <p className={`text-xs leading-relaxed min-h-[32px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {card.tagline}
                    </p>
                  </div>

                  <div className={`border-y py-5 ${isDark ? 'border-slate-900' : 'border-slate-200'}`}>
                    <span className={`text-3xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {card.price}
                    </span>
                    {card.period && (
                      <span className="text-xs text-slate-500 font-mono ml-1">{card.period}</span>
                    )}
                    <span className="text-[10px] text-slate-500 block mt-1 uppercase tracking-wider font-mono">Based on active usage metrics</span>
                  </div>

                  <ul className="space-y-3.5">
                    {card.features.map((feat, fIdx) => (
                      <li key={fIdx} className={`flex gap-2.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  id={`pricing-cta-btn-${idx}`}
                  onClick={onBookDemo}
                  className={`w-full text-center font-bold text-xs sm:text-sm py-3 px-4 rounded-xl mt-8 transition-all cursor-pointer ${
                    card.isPopular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      : isDark
                        ? 'bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white'
                        : 'bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {card.cta}
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 2. FAQ Section */}
      <section id="faq" className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
        {isDark && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        )}
        
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 space-y-16 relative z-10">
          
          <div className="text-center space-y-4">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
              isDark 
                ? 'bg-blue-950/80 border-blue-500/30 text-blue-400' 
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              FAQ MATRIX
            </div>
            <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Frequently Asked Questions
            </h2>
            <p className={`text-sm sm:text-base max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Everything you need to know about setting up and running dedicated AI email-native agents safely.
            </p>
          </div>

          <div className={`rounded-2xl border divide-y max-w-3xl mx-auto shadow-xs transition-colors duration-300 ${
            isDark ? 'border-slate-900 bg-slate-950/40 divide-slate-900' : 'border-slate-200 bg-slate-50 divide-slate-200'
          }`}>
            {FAQ_LIST.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="p-1">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 group focus:outline-none cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-xs sm:text-sm font-bold transition-colors ${
                      isOpen 
                        ? 'text-blue-600' 
                        : isDark 
                          ? 'text-slate-200 group-hover:text-white' 
                          : 'text-slate-700 group-hover:text-slate-950'
                    }`}>
                      {item.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4.5 w-4.5 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-4.5 w-4.5 text-slate-500 group-hover:text-slate-350" />
                    )}
                  </button>
                  {isOpen && (
                    <div className={`px-4 sm:px-5 pb-5 text-xs sm:text-sm leading-relaxed font-sans animate-fade-in ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. Final CTA Section */}
      <section id="final-cta" className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 relative z-10">
          <div className={`rounded-3xl border p-8 md:p-16 text-center space-y-8 backdrop-blur-xl relative overflow-hidden transition-colors duration-300 ${
            isDark ? 'border-slate-900 bg-slate-950/40 shadow-xl' : 'border-slate-200 bg-[#f9fafb] shadow-xs'
          }`}>
            
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest font-mono border ${
              isDark 
                ? 'bg-blue-950/80 border-blue-500/30 text-blue-400' 
                : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              GET STARTED TODAY
            </div>

            <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Stop opening apps.<br />
              <span className="text-blue-600 font-extrabold">
                Start emailing agents.
              </span>
            </h2>
            
            <p className={`text-sm sm:text-base leading-relaxed max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Give your systems their own email addresses and watch work run autonomously. Get started with Hello Agent today.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto">
              <button
                id="final-cta-book-demo-btn"
                onClick={onBookDemo}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 px-6 shadow-md transition-all cursor-pointer"
              >
                <Calendar className="h-4.5 w-4.5" />
                <span>Book a Demo</span>
              </button>
              <button
                id="final-cta-explore-usecases-btn"
                onClick={handleExploreClick}
                className={`flex w-full items-center justify-center gap-1.5 rounded-xl border font-bold text-sm py-3.5 px-6 transition-all cursor-pointer ${
                  isDark 
                    ? 'border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-900' 
                    : 'border-slate-200 bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-3xs'
                }`}
              >
                <span>Explore Use Cases</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
