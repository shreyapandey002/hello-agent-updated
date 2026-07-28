import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const timePickerHours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const timePickerMinutes = ['00', '15', '30', '45'];
const timePickerPeriods = ['AM', 'PM'];
const timePickerItemHeight = 44;

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toTwentyFourHourTime = (hour: string, minute: string, period: string) => {
  const hourNumber = Number(hour);
  const adjustedHour = period === 'PM'
    ? hourNumber === 12 ? 12 : hourNumber + 12
    : hourNumber === 12 ? 0 : hourNumber;

  return `${String(adjustedHour).padStart(2, '0')}:${minute}`;
};

const parseTwentyFourHourTime = (value: string) => {
  const [hour = '09', minute = '00'] = value.split(':');
  const hourNumber = Number(hour);
  const period = hourNumber >= 12 ? 'PM' : 'AM';
  const displayHour = hourNumber % 12 || 12;

  return {
    hour: String(displayHour).padStart(2, '0'),
    minute: timePickerMinutes.includes(minute) ? minute : '00',
    period,
  };
};

const formatDisplayTime = (value: string) => {
  if (!value) return 'Select a start time';

  const { hour, minute, period } = parseTwentyFourHourTime(value);
  return `${hour}:${minute} ${period}`;
};

const formatDisplayDate = (value: string) => {
  if (!value) return 'Select a consultation date';

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatFullDateDisplay = (value: string) => {
  if (!value) return 'Select a consultation date';

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const parseDateValue = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getCalendarDays = (month: Date) => {
  const year = month.getFullYear();
  const currentMonth = month.getMonth();
  const firstDayOfMonth = new Date(year, currentMonth, 1);
  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const startDay = firstDayOfMonth.getDay();
  const cells: Array<{ value: string; isCurrentMonth: boolean; isDisabled: boolean }> = [];

  for (let index = 0; index < 42; index += 1) {
    const dayOffset = index - startDay + 1;
    const date = new Date(year, currentMonth, dayOffset);
    const dateValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const isCurrentMonth = date.getMonth() === currentMonth;
    const isDisabled = date < parseDateValue(getTodayDateString());

    cells.push({ value: dateValue, isCurrentMonth, isDisabled });
  }

  return cells;
};

const isValidPickerTime = (value: string) => {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;

  const [hour, minute] = value.split(':');
  const hourNumber = Number(hour);

  return hourNumber >= 0 && hourNumber <= 23 && timePickerMinutes.includes(minute);
};

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const todayDate = getTodayDateString();

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    workflow: 'Operations',
    volume: '100 - 500 emails/month',
    consultationDate: '',
    consultationTime: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [bookingOutcome, setBookingOutcome] = useState<'idle' | 'success' | 'error'>('idle');
  const [confirmationRecipient, setConfirmationRecipient] = useState('');
  const [draftTime, setDraftTime] = useState({
    hour: '09',
    minute: '00',
    period: 'AM',
  });
  const timePickerRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const hourWheelRef = useRef<HTMLDivElement>(null);
  const minuteWheelRef = useRef<HTMLDivElement>(null);
  const periodWheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTimePickerOpen && !isDatePickerOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!timePickerRef.current?.contains(event.target as Node) && !datePickerRef.current?.contains(event.target as Node)) {
        setIsTimePickerOpen(false);
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isTimePickerOpen, isDatePickerOpen]);

  useEffect(() => {
    if (!isTimePickerOpen) return;

    requestAnimationFrame(() => {
      scrollWheelToValue(hourWheelRef.current, timePickerHours, draftTime.hour);
      scrollWheelToValue(minuteWheelRef.current, timePickerMinutes, draftTime.minute);
      scrollWheelToValue(periodWheelRef.current, timePickerPeriods, draftTime.period);
    });
  }, [draftTime.hour, draftTime.minute, draftTime.period, isTimePickerOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setSubmitError('');
    setSubmitMessage('');
    setBookingOutcome('idle');

    if (formData.consultationDate < todayDate) {
      setSubmitError('Please choose a consultation date today or later.');
      return;
    }

    if (!isValidPickerTime(formData.consultationTime)) {
      setSubmitError('Please choose a consultation time.');
      return;
    }

    const bookingApiUrl = import.meta.env.VITE_BOOKING_API_URL;

    if (!bookingApiUrl) {
      setSubmitError('Booking is not configured yet. Please add VITE_BOOKING_API_URL.');
      return;
    }

    const payload = {
      full_name: formData.name,
      work_email: formData.email,
      company_name: formData.company,
      primary_email_workflow: formData.workflow,
      monthly_email_volume: formData.volume,
      use_case: formData.notes,
      consultation_date: formData.consultationDate,
      consultation_time: formData.consultationTime,
    };

    try {
      setIsSubmitting(true);

      const response = await fetch(bookingApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let result: Record<string, unknown> = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        result = {};
      }

      const agentValue = (result.output as { data?: { value?: { response?: { successful?: boolean }; recipient?: string } } } | undefined)?.data?.value
        ?? (result as { output?: { value?: { response?: { successful?: boolean }; recipient?: string } } }).output?.value
        ?? (result as { value?: { response?: { successful?: boolean }; recipient?: string } }).value;
      const isConfirmed = agentValue?.response?.successful === true;

      if (!response.ok || !isConfirmed) {
        setBookingOutcome('error');
        setConfirmationRecipient(formData.email);
        setStep(2);
        return;
      }

      setSubmitMessage('Consultation booked successfully');
      setBookingOutcome('success');
      setConfirmationRecipient(agentValue?.recipient || formData.email);
      setStep(2);
    } catch {
      setBookingOutcome('error');
      setConfirmationRecipient(formData.email);
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: '',
      email: '',
      company: '',
      workflow: 'Operations',
      volume: '100 - 500 emails/month',
      consultationDate: '',
      consultationTime: '',
      notes: ''
    });
    setSubmitMessage('');
    setSubmitError('');
    setBookingOutcome('idle');
    setConfirmationRecipient('');
    setIsTimePickerOpen(false);
    setIsDatePickerOpen(false);
    setDraftTime({
      hour: '09',
      minute: '00',
      period: 'AM',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const openTimePicker = () => {
    setDraftTime(formData.consultationTime ? parseTwentyFourHourTime(formData.consultationTime) : {
      hour: '09',
      minute: '00',
      period: 'AM',
    });
    setIsTimePickerOpen(true);
    setIsDatePickerOpen(false);
  };

  const openDatePicker = () => {
    const initialDate = formData.consultationDate
      ? parseDateValue(formData.consultationDate)
      : parseDateValue(todayDate);

    setCalendarMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    setIsDatePickerOpen(true);
    setIsTimePickerOpen(false);
  };

  const saveTimePicker = () => {
    setFormData({
      ...formData,
      consultationTime: toTwentyFourHourTime(draftTime.hour, draftTime.minute, draftTime.period),
    });
    setIsTimePickerOpen(false);
  };

  const selectDate = (value: string) => {
    if (value < todayDate) return;

    setFormData({
      ...formData,
      consultationDate: value,
    });
    setIsDatePickerOpen(false);
  };

  const changeCalendarMonth = (direction: -1 | 1) => {
    setCalendarMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const scrollWheelToValue = (element: HTMLDivElement | null, values: string[], value: string) => {
    if (!element) return;

    const index = Math.max(values.indexOf(value), 0);
    element.scrollTo({
      top: index * timePickerItemHeight,
      behavior: 'auto',
    });
  };

  const handleWheelScroll = (
    element: HTMLDivElement | null,
    values: string[],
    field: 'hour' | 'minute' | 'period',
  ) => {
    if (!element) return;

    const selectedIndex = Math.min(
      values.length - 1,
      Math.max(0, Math.round(element.scrollTop / timePickerItemHeight)),
    );

    const selectedValue = values[selectedIndex];

    if (draftTime[field] !== selectedValue) {
      setDraftTime((currentDraft) => ({
        ...currentDraft,
        [field]: selectedValue,
      }));
    }
  };

  const selectWheelValue = (
    element: HTMLDivElement | null,
    values: string[],
    field: 'hour' | 'minute' | 'period',
    value: string,
  ) => {
    setDraftTime((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
    scrollWheelToValue(element, values, value);
  };

  const getWheelOptionClassName = (isSelected: boolean, distance: number) => {
    const fadeClass = distance === 1
      ? isDark ? 'text-slate-400' : 'text-slate-500'
      : isDark ? 'text-slate-600' : 'text-slate-350';

    return `flex h-11 w-full shrink-0 snap-center items-center justify-center rounded-lg text-sm font-bold transition-all ${
      isSelected
        ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/40'
        : `${fadeClass} hover:text-blue-500`
    }`;
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
          className={`relative w-full max-w-lg overflow-visible rounded-2xl border p-6 sm:p-8 shadow-2xl transition-colors duration-300 z-10 ${
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

                <div ref={datePickerRef} className="space-y-1.5">
                  <label htmlFor="consultation-date-trigger" className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Consultation Date</label>
                  <div className="relative">
                    <button
                      id="consultation-date-trigger"
                      type="button"
                      onClick={openDatePicker}
                      aria-expanded={isDatePickerOpen}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm font-medium focus:outline-none transition-colors duration-300 ${
                        isDark
                          ? 'border-slate-800 bg-slate-950 text-white focus:border-blue-500'
                          : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-600'
                      }`}
                    >
                      <span className={formData.consultationDate ? '' : isDark ? 'text-slate-650' : 'text-slate-450'}>
                        {formatDisplayDate(formData.consultationDate)}
                      </span>
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </button>

                    {isDatePickerOpen && (
                      <div className={`absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border p-3 shadow-2xl sm:p-4 ${
                        isDark
                          ? 'border-slate-800 bg-slate-950 text-white shadow-black/80 ring-1 ring-blue-500/10'
                          : 'border-slate-200 bg-white text-slate-800 shadow-slate-300/50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => changeCalendarMonth(-1)}
                            className={`rounded-lg p-2 transition-colors ${isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-100'}`}
                            aria-label="Previous month"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <div className="text-sm font-semibold">
                            {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </div>
                          <button
                            type="button"
                            onClick={() => changeCalendarMonth(1)}
                            className={`rounded-lg p-2 transition-colors ${isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-100'}`}
                            aria-label="Next month"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                            <span key={day}>{day}</span>
                          ))}
                        </div>

                        <div className="mt-2 grid grid-cols-7 gap-1">
                          {getCalendarDays(calendarMonth).map((day) => {
                            const isSelected = day.value === formData.consultationDate;
                            const isDisabled = day.isDisabled || !day.isCurrentMonth;

                            return (
                              <button
                                key={day.value}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => selectDate(day.value)}
                                className={`h-9 rounded-lg text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'bg-blue-600 text-white'
                                    : isDark
                                      ? 'text-slate-200 hover:bg-slate-900'
                                      : 'text-slate-700 hover:bg-slate-100'
                                } ${isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                              >
                                {parseDateValue(day.value).getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="consultation-time-trigger" className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Consultation Time</label>
                  <div ref={timePickerRef} className="relative">
                    <button
                      id="consultation-time-trigger"
                      type="button"
                      onClick={openTimePicker}
                      aria-expanded={isTimePickerOpen}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm focus:outline-none transition-colors duration-300 ${
                        isDark 
                          ? 'border-slate-800 bg-slate-950 text-white focus:border-blue-500' 
                          : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-600'
                      }`}
                    >
                      <span className={formData.consultationTime ? '' : isDark ? 'text-slate-650' : 'text-slate-450'}>
                        {formatDisplayTime(formData.consultationTime)}
                      </span>
                    </button>

                    {isTimePickerOpen && (
                      <div className={`absolute right-0 bottom-full z-30 mb-2 w-[min(360px,calc(100vw-48px))] rounded-2xl border p-3 shadow-2xl sm:p-4 ${
                        isDark
                          ? 'border-slate-800 bg-slate-950 text-white shadow-black/80 ring-1 ring-blue-500/10'
                          : 'border-slate-200 bg-white text-slate-800 shadow-slate-300/50'
                      }`}>
                        <div className="grid grid-cols-3 gap-2 px-1 pb-2 text-center text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                          <span>Hours</span>
                          <span>Minutes</span>
                          <span>AM/PM</span>
                        </div>

                        <div className="relative">
                          <div className={`pointer-events-none absolute left-0 right-0 top-1/2 z-0 h-11 -translate-y-1/2 rounded-xl border ${
                            isDark ? 'border-blue-500/25 bg-blue-500/10' : 'border-blue-200 bg-blue-50'
                          }`} />

                          <div className="relative z-10 grid grid-cols-3 gap-2">
                            <div
                              ref={hourWheelRef}
                              onScroll={() => handleWheelScroll(hourWheelRef.current, timePickerHours, 'hour')}
                              className={`time-wheel-scroll h-[176px] snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-xl px-1 py-[66px] ${
                                isDark ? 'bg-slate-900/80' : 'bg-slate-50'
                              }`}
                            >
                              {timePickerHours.map((hour, index) => {
                                const selectedIndex = timePickerHours.indexOf(draftTime.hour);
                                return (
                                  <button
                                    key={hour}
                                    type="button"
                                    onClick={() => selectWheelValue(hourWheelRef.current, timePickerHours, 'hour', hour)}
                                    className={getWheelOptionClassName(draftTime.hour === hour, Math.abs(index - selectedIndex))}
                                  >
                                    {hour}
                                  </button>
                                );
                              })}
                            </div>

                            <div
                              ref={minuteWheelRef}
                              onScroll={() => handleWheelScroll(minuteWheelRef.current, timePickerMinutes, 'minute')}
                              className={`time-wheel-scroll h-[176px] snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-xl px-1 py-[66px] ${
                                isDark ? 'bg-slate-900/80' : 'bg-slate-50'
                              }`}
                            >
                              {timePickerMinutes.map((minute, index) => {
                                const selectedIndex = timePickerMinutes.indexOf(draftTime.minute);
                                return (
                                  <button
                                    key={minute}
                                    type="button"
                                    onClick={() => selectWheelValue(minuteWheelRef.current, timePickerMinutes, 'minute', minute)}
                                    className={getWheelOptionClassName(draftTime.minute === minute, Math.abs(index - selectedIndex))}
                                  >
                                    {minute}
                                  </button>
                                );
                              })}
                            </div>

                            <div
                              ref={periodWheelRef}
                              onScroll={() => handleWheelScroll(periodWheelRef.current, timePickerPeriods, 'period')}
                              className={`time-wheel-scroll h-[176px] snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-xl px-1 py-[66px] ${
                                isDark ? 'bg-slate-900/80' : 'bg-slate-50'
                              }`}
                            >
                              {timePickerPeriods.map((period, index) => {
                                const selectedIndex = timePickerPeriods.indexOf(draftTime.period);
                                return (
                                  <button
                                    key={period}
                                    type="button"
                                    onClick={() => selectWheelValue(periodWheelRef.current, timePickerPeriods, 'period', period)}
                                    className={getWheelOptionClassName(draftTime.period === period, Math.abs(index - selectedIndex))}
                                  >
                                    {period}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-14 rounded-t-xl bg-gradient-to-b ${
                            isDark ? 'from-slate-950 via-slate-950/90 to-slate-950/0' : 'from-white via-white/90 to-white/0'
                          }`} />
                          <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 h-14 rounded-b-xl bg-gradient-to-t ${
                            isDark ? 'from-slate-950 via-slate-950/90 to-slate-950/0' : 'from-white via-white/90 to-white/0'
                          }`} />
                        </div>

                        <div className={`mt-4 flex items-center justify-between border-t pt-3 ${
                          isDark ? 'border-slate-800' : 'border-slate-200'
                        }`}>
                          <button
                            type="button"
                            onClick={() => setIsTimePickerOpen(false)}
                            className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                              isDark
                                ? 'border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={saveTimePicker}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700 cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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
                {submitError && (
                  <div className={`rounded-lg border px-3 py-2 text-xs leading-normal ${
                    isDark
                      ? 'border-red-500/30 bg-red-950/40 text-red-200'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}>
                    {submitError}
                  </div>
                )}

                <button
                  id="submit-booking-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-3 px-4 shadow-md transition-all disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Booking consultation...</span>
                    </>
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
              {bookingOutcome === 'success' ? (
                <>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-400/30">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>

                  <div className="space-y-3">
                    <h3 className={`font-display text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Consultation Booked!
                    </h3>
                    <p className={`mx-auto max-w-sm text-sm leading-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Thanks, {formData.name}. Your consultation has been requested.
                    </p>
                  </div>

                  <div className={`rounded-2xl border p-5 text-left space-y-4 transition-colors duration-300 ${
                    isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <p className={`text-xs font-bold uppercase tracking-widest font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Booking Details</p>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatFullDateDisplay(formData.consultationDate)}</p>
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{formatDisplayTime(formData.consultationTime)}</p>
                    </div>

                    <div className="space-y-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                      <p className={`text-xs font-bold uppercase tracking-widest font-mono ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Confirmation</p>
                      <p className={`text-sm leading-normal ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        We&apos;ll send the confirmation to:
                      </p>
                      <a
                        href={`mailto:${confirmationRecipient || formData.email}`}
                        className="text-sm font-semibold text-blue-500 hover:text-blue-400"
                      >
                        {confirmationRecipient || formData.email}
                      </a>
                    </div>
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
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-400/30">
                    <X className="h-8 w-8 text-red-400" />
                  </div>

                  <div className="space-y-3">
                    <h3 className={`font-display text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Something went wrong
                    </h3>
                    <p className={`mx-auto max-w-sm text-sm leading-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      We couldn&apos;t send your consultation confirmation. Please try again.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      id="retry-booking-btn"
                      onClick={() => {
                        setBookingOutcome('idle');
                        setStep(1);
                      }}
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 cursor-pointer"
                    >
                      Try Again
                    </button>
                    <button
                      id="error-close-btn"
                      onClick={handleClose}
                      className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                        isDark
                          ? 'border-slate-800 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-850'
                          : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-150'
                      }`}
                    >
                      Return to Product Page
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
