import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSection from './components/ProblemSection';
import ProductExplanation from './components/ProductExplanation';
import InteractiveDemo from './components/InteractiveDemo';
import UseCases from './components/UseCases';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Integrations from './components/Integrations';
import HumanInTheLoop from './components/HumanInTheLoop';
import SecurityComparisonArchitecture from './components/SecurityComparisonArchitecture';
import PricingFaqCTA from './components/PricingFaqCTA';
import Footer from './components/Footer';
import DemoModal from './components/DemoModal';
import { ThemeProvider, useTheme } from './ThemeContext';

function MainAppContent() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of fixed navbar
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

  return (
    <div
      id="hello-agent-marketing-root"
      className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
        isDark
          ? 'bg-slate-950 text-slate-100 selection:bg-blue-500/10 selection:text-blue-400'
          : 'bg-[#fafafa] text-slate-800 selection:bg-blue-500/10 selection:text-blue-600'
      }`}
    >
      {/* 1. Global Navigation Bar */}
      <Navbar onBookDemo={() => setDemoModalOpen(true)} />

      {/* 2. Page Content Blocks */}
      <main id="marketing-page-sections" className="relative">
        {/* Section 1: Hero Segment */}
        <Hero
          onBookDemo={() => setDemoModalOpen(true)}
          onSeeHowItWorks={() => scrollToSection('agent-sandbox')}
        />

        {/* Section 2: Problem Segment */}
        <ProblemSection />

        {/* Section 3: Concept / What is Hello Agent Segment */}
        <ProductExplanation />

        {/* Section 4: Live Interactive Sandbox Demo */}
        <InteractiveDemo />

        {/* Section 5: Standard Use Cases Bento Grid */}
        <UseCases />

        {/* Section 6: Steps / How It Works Segment */}
        <HowItWorks />

        {/* Section 7: Granular Feature Matrix */}
        <Features />

        {/* Section 7.5: ERP / DB / CRM Integration Section */}
        <Integrations />

        {/* Section 8: Dedicated Identity and Manager CC thread safeguards */}
        <HumanInTheLoop />

        {/* Section 9: Security, Comparisons, and Architecture pipelines */}
        <SecurityComparisonArchitecture />

        {/* Section 10: Pricing Tiers, Accordion FAQs, and Final Call-To-Action */}
        <PricingFaqCTA
          onBookDemo={() => setDemoModalOpen(true)}
          onExploreUseCases={() => scrollToSection('use-cases')}
        />
      </main>

      {/* 3. Global Footer */}
      <Footer onLinkClick={scrollToSection} />

      {/* 4. Interactive Demo Request Modal */}
      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainAppContent />
    </ThemeProvider>
  );
}
