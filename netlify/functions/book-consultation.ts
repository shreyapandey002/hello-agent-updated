type BookingPayload = {
  full_name?: unknown;
  work_email?: unknown;
  company_name?: unknown;
  primary_email_workflow?: unknown;
  monthly_email_volume?: unknown;
  use_case?: unknown;
  consultation_date?: unknown;
  consultation_time?: unknown;
};

type NetlifyEvent = {
  httpMethod: string;
  body: string | null;
};

type NetlifyResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const requiredFields = [
  'full_name',
  'work_email',
  'company_name',
  'primary_email_workflow',
  'monthly_email_volume',
  'consultation_date',
  'consultation_time',
] as const;

const allowedConsultationTimes = new Set([
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
]);

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const jsonResponse = (statusCode: number, message: string, success = false): NetlifyResponse => ({
  statusCode,
  headers: jsonHeaders,
  body: JSON.stringify({ success, message }),
});

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidDateString = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);

  return (
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day
  );
};

const getStringField = (payload: BookingPayload, field: keyof BookingPayload) => {
  const value = payload[field];
  return typeof value === 'string' ? value.trim() : '';
};

const validateBookingPayload = (payload: BookingPayload) => {
  for (const field of requiredFields) {
    if (!getStringField(payload, field)) {
      return `${field} is required`;
    }
  }

  const workEmail = getStringField(payload, 'work_email');
  const consultationDate = getStringField(payload, 'consultation_date');
  const consultationTime = getStringField(payload, 'consultation_time');

  if (!isValidEmail(workEmail)) {
    return 'Please provide a valid work_email';
  }

  if (!isValidDateString(consultationDate)) {
    return 'consultation_date must use YYYY-MM-DD';
  }

  if (consultationDate < getTodayDateString()) {
    return 'consultation_date must be today or later';
  }

  if (!allowedConsultationTimes.has(consultationTime)) {
    return 'consultation_time must be between 09:00 and 21:00';
  }

  return '';
};

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: jsonHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, 'Method not allowed');
  }

  let payload: BookingPayload;

  try {
    payload = JSON.parse(event.body || '{}') as BookingPayload;
  } catch {
    return jsonResponse(400, 'Request body must be valid JSON');
  }

  const validationMessage = validateBookingPayload(payload);

  if (validationMessage) {
    return jsonResponse(400, validationMessage);
  }

  return jsonResponse(200, 'Booking request received successfully', true);
};
