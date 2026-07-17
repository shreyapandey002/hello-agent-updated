import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    workflow: 'Operations',
    volume: '100 - 500 emails/month',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 1200);
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: '',
      email: '',
      company: '',
      workflow: 'Operations',
      volume: '100 - 500 emails/month',
      notes: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="demo-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          id="demo-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          id="demo-modal-window"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-lg overflow-hidden rounded-2xl border p-6 sm:p-8 shadow-2xl transition-colors duration-300 z-10 ${
            isDark 
              ? 'bg-slate-900 border-slate-800 text-white shadow-black/80 ring-1 ring-blue-500/10' 
              : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/40'
          }`}
        >
          {/* Close button */}
          <button
            id="close-modal-btn"
            onClick={handleClose}
            className={`absolute top-4 right-4 transition-colors focus:outline-none cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'
            }`}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {step === 1 ? (
            <form id="demo-booking-form" onSubmit={handleSubmit} className="space-y-5">
              <div id="demo-modal-header" className="space-y-1.5">
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest font-mono border ${
                  isDark 
                    ? 'bg-blue-950/80 border-blue-500/30 text-blue-400' 
                    : 'bg-blue-50 border-blue-200 text-blue-600'
                }`}>
                  <Sparkles className="h-3 w-3" />
                  <span>SaaS Enterprise Demo</span>
                </div>
                <h3 className={`font-display text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Book a Hello Agent demo
                </h3>
                <p className={`text-xs sm:text-sm leading-normal ${isDark ? 'text-slate-450' : 'text-slate-500'}`}>
                  Let us show you how to automate your specific email-heavy workflows with absolute precision.
                </p>
              </div>

              <div id="demo-form-fields" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="name-input" className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Aditi Jha"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors duration-300 ${
                      isDark 
                        ? 'border-slate-800 bg-slate-950 text-white placeholder-slate-650 focus:border-blue-500' 
                        : 'border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-450 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email-input" className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Work Email</label>
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@company.com"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors duration-300 ${
                      isDark 
                        ? 'border-slate-800 bg-slate-950 text-white placeholder-slate-650 focus:border-blue-500' 
                        : 'border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-450 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="company-input" className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Company Name</label>
                  <input
                    id="company-input"
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Logistics or Global Corp"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors duration-300 ${
                      isDark 
                        ? 'border-slate-800 bg-slate-950 text-white placeholder-slate-650 focus:border-blue-500' 
                        : 'border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-450 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="workflow-select" className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Primary Email Workflow</label>
                  <select
                    id="workflow-select"
                    value={formData.workflow}
                    onChange={(e) => setFormData({ ...formData, workflow: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors duration-300 ${
                      isDark 
                        ? 'border-slate-800 bg-slate-950 text-white focus:border-blue-500' 
                        : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-600'
                    }`}
                  >
                    <option value="Operations">Operations / Logistics</option>
                    <option value="Support">Customer Support</option>
                    <option value="Sales">Sales Vetting & Leads</option>
                    <option value="Finance">Finance / Invoices</option>
                    <option value="HR">HR / Candidate Review</option>
                    <option value="Other">Other Custom Workflow</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="volume-select" className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Monthly Email Volume</label>
                  <select
                    id="volume-select"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors duration-300 ${
                      isDark 
                        ? 'border-slate-800 bg-slate-950 text-white focus:border-blue-500' 
                        : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-600'
                    }`}
                  >
                    <option value="Under 100">Under 100 emails/month</option>
                    <option value="100 - 500">100 - 500 emails/month</option>
                    <option value="500 - 2,500">500 - 2,500 emails/month</option>
                    <option value="Over 2,500">Over 2,500 emails/month</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="notes-textarea" className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Describe your use case (optional)</label>
                  <textarea
                    id="notes-textarea"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. We want an agent to read incoming vendor invoices, verify totals, and update the ERP status."
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none resize-none transition-colors duration-300 ${
                      isDark 
                        ? 'border-slate-800 bg-slate-950 text-white placeholder-slate-650 focus:border-blue-500' 
                        : 'border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-450 focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              <div id="demo-modal-footer" className="pt-2 flex flex-col gap-3">
                <button
                  id="submit-booking-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-3 px-4 shadow-md transition-all disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Book Implementation Consultation</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-center text-[10px] sm:text-xs text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>No credit card required. Data designed with enterprise-grade safeguards.</span>
                </div>
              </div>
            </form>
          ) : (
            <div id="booking-success-view" className="py-6 text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-250">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className={`font-display text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Consultation Booked!
                </h3>
                <p className={`mx-auto max-w-sm text-xs sm:text-sm leading-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Thank you, <span className="font-semibold text-blue-600">{formData.name}</span>. We have scheduled a demonstration tailored to <span className="font-semibold text-blue-600">{formData.company}</span>&apos;s email operations.
                </p>
              </div>

              <div className={`rounded-xl border p-4 text-left space-y-2.5 transition-colors duration-300 ${
                isDark ? 'border-slate-850 bg-slate-950' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Next Steps</span>
                </div>
                <ul className={`space-y-2 text-xs font-sans ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">1.</span>
                    <span>Check your inbox (<span className="font-medium text-blue-600">{formData.email}</span>) for a calendar placeholder.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">2.</span>
                    <span>An integration specialist will prepare a mock <strong>{formData.workflow} Agent</strong> based on your specs.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">3.</span>
                    <span>We&apos;ll build and launch your custom inbox in a secure sandbox together.</span>
                  </li>
                </ul>
              </div>

              <button
                id="success-close-btn"
                onClick={handleClose}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                  isDark 
                    ? 'border-slate-800 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-850' 
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-150'
                }`}
              >
                Return to Product Page
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
