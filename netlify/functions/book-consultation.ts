import { randomUUID } from 'node:crypto';

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

// Booking window: 09:00 through 22:00 inclusive, any minute allowed,
// except the final hour (22:xx) which only permits the exact top of
// the hour, since a consultation can't start after the closing bound.
// This mirrors the frontend's `isWithinBookingWindow` check in
// DemoModal.tsx -- keep the two in sync if either changes.
const isValidConsultationTime = (value: string) => {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return false;
  if (minute < 0 || minute > 59) return false;
  if (hour < 9 || hour > 22) return false;
  if (hour === 22 && minute !== 0) return false;

  return true;
};

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

  if (!isValidConsultationTime(consultationTime)) {
    return 'consultation_time must be between 09:00 and 22:00';
  }

  return '';
};

const buildAgentPayload = (payload: BookingPayload) => ({
  output_type: 'text',
  input_type: 'chat',
  input_value: JSON.stringify({
    full_name: getStringField(payload, 'full_name'),
    work_email: getStringField(payload, 'work_email'),
    company_name: getStringField(payload, 'company_name'),
    primary_email_workflow: getStringField(payload, 'primary_email_workflow'),
    monthly_email_volume: getStringField(payload, 'monthly_email_volume'),
    use_case: getStringField(payload, 'use_case'),
    consultation_date: getStringField(payload, 'consultation_date'),
    consultation_time: getStringField(payload, 'consultation_time'),
  }),
  session_id: randomUUID(),
});

const extractAgentMessage = (data: unknown): string => {
  if (typeof data === 'string') {
    return data;
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;

    for (const key of ['output', 'message', 'response', 'result', 'text']) {
      const value = record[key];

      if (typeof value === 'string') {
        return value;
      }

      if (value && typeof value === 'object') {
        const nested = value as Record<string, unknown>;

        if (typeof nested.text === 'string') {
          return nested.text;
        }

        if (typeof nested.message === 'string') {
          return nested.message;
        }

        if (typeof nested.output === 'string') {
          return nested.output;
        }
      }
    }

    return JSON.stringify(data);
  }

  return 'Booking request received successfully';
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

  const ottom8ApiKey = process.env.OTTOM8_API_KEY;
  console.error('OTTOM8_API_KEY exists', Boolean(ottom8ApiKey));

  if (!ottom8ApiKey) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: false,
        message: 'Ottom8 agent request failed',
        details: 'Missing OTTOM8_API_KEY environment variable',
      }),
    };
  }

  try {
    const agentResponse = await fetch('https://ottom8.nhtech.link/api/v1/run/56c53e70-9d3d-4632-9034-e0f0acf6e0db?stream=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ottom8ApiKey,
      },
      body: JSON.stringify(buildAgentPayload(payload)),
    });

    const responseText = await agentResponse.text();
    console.error('Ottom8 HTTP status', agentResponse.status);
    console.error('Ottom8 response body', responseText);

    if (!agentResponse.ok) {
      return {
        statusCode: 500,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: false,
          message: 'Ottom8 agent call failed',
          status: agentResponse.status,
          details: responseText,
        }),
      };
    }

    let agentData: unknown;
    try {
      agentData = JSON.parse(responseText);
    } catch {
      agentData = responseText;
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        message: extractAgentMessage(agentData),
        agentResponse: agentData,
      }),
    };
  } catch (error) {
    console.error('Caught error message', error instanceof Error ? error.message : String(error));
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: false,
        message: 'Ottom8 agent request failed',
        details: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};