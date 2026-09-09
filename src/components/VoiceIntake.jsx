import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PENDING_KEY = 'pending_voice_intake';

const EQUIPMENT_TYPES = [
  'Lawn Mower',
  'Motorcycle/ATV',
  'Generator',
  'Compressor',
  'Chainsaw',
  'Weed Eater',
  'Other',
];

const EXTRACTION_SPECS = {
  job: {
    intro:
      'A small engine repair shop technician described a new job intake verbally. Extract the details from the transcript and return them as form fields.',
    rules: `- equipment_type must be one of: ${EQUIPMENT_TYPES.join(', ')} (best guess, use "Other" if unclear).
- problem_description: a concise summary of the reported issue in the technician's terms.
- unit_label: the unit label number if one is spoken (digits only, e.g. "1001"). Empty string if not mentioned.
- customer_name: the customer's name if spoken. Empty string if not mentioned.`,
    schema: {
      customer_name: { type: 'string' },
      unit_label: { type: 'string' },
      equipment_type: { type: 'string', enum: EQUIPMENT_TYPES },
      make: { type: 'string' },
      model: { type: 'string' },
      serial_number: { type: 'string' },
      problem_description: { type: 'string' },
    },
  },
  customer: {
    intro:
      'A small engine repair shop employee described a new customer verbally. Extract the details from the transcript and return them as form fields.',
    rules: `- name: the customer's full name.
- phone and email: formatted as spoken.
- Leave any field as an empty string if it is not mentioned.`,
    schema: {
      name: { type: 'string' },
      phone: { type: 'string' },
      email: { type: 'string' },
      address: { type: 'string' },
      notes: { type: 'string' },
    },
  },
  sale: {
    intro:
      'A small engine repair shop employee described a storefront sale verbally. Extract the details from the transcript and return them as form fields.',
    rules: `- total_price: the total sale price as a number.
- amount_paid: the amount the customer paid as a number (0 if not mentioned).
- sale_date: in YYYY-MM-DD format. Empty string if not mentioned.
- part_number: empty string if not mentioned.
- notes: empty string if not mentioned.`,
    schema: {
      customer_name: { type: 'string' },
      item_description: { type: 'string' },
      part_number: { type: 'string' },
      total_price: { type: 'number' },
      amount_paid: { type: 'number' },
      sale_date: { type: 'string' },
      notes: { type: 'string' },
    },
  },
  reminder: {
    intro:
      'A small engine repair shop employee described a reminder or appointment verbally. Extract the details from the transcript and return them as form fields.',
    rules: `- title: a short title for the reminder.
- due_date: in YYYY-MM-DD format (resolve relative phrases like "tomorrow" to a date). Empty string if not mentioned.
- appointment_type must be one of: General, On-site, Off-site.
- priority must be one of: high, medium, low.
- customer_name: the customer's name if spoken. Empty string if not mentioned.`,
    schema: {
      title: { type: 'string' },
      description: { type: 'string' },
      due_date: { type: 'string' },
      appointment_type: {
        type: 'string',
        enum: ['General', 'On-site', 'Off-site'],
      },
      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
      customer_name: { type: 'string' },
    },
  },
  task: {
    intro:
      'A small engine repair shop employee described a shop task or to-do item verbally. Extract the details from the transcript and return them as form fields.',
    rules: `- title: a short title for the task.
- category must be one of: Cleaning, Maintenance, Organization, Inventory, Other.
- priority must be one of: low, medium, high.
- due_date: in YYYY-MM-DD format (resolve relative phrases like "Friday" to a date). Empty string if not mentioned.
- assigned_to: empty string if not mentioned.`,
    schema: {
      title: { type: 'string' },
      description: { type: 'string' },
      category: {
        type: 'string',
        enum: ['Cleaning', 'Maintenance', 'Organization', 'Inventory', 'Other'],
      },
      priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      assigned_to: { type: 'string' },
      due_date: { type: 'string' },
    },
  },
};

const blobToBase64 = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

const base64ToBlob = async (dataUrl) => (await fetch(dataUrl)).blob();

export async function processVoiceIntake(blob, formType = 'job') {
  const spec = EXTRACTION_SPECS[formType] || EXTRACTION_SPECS.job;
  const file = new File([blob], 'intake.webm', {
    type: blob.type || 'audio/webm',
  });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  const transcript = await base44.integrations.Core.TranscribeAudio({
    audio_url: file_url,
  });
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `${spec.intro}

Transcript: "${transcript}"

Rules:
${spec.rules}`,
    response_json_schema: {
      type: 'object',
      properties: spec.schema,
    },
  });
  return res;
}

export default function VoiceIntake({ formType = 'job', onExtracted }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const saveForLater = async (blob) => {
    try {
      const dataUrl = await blobToBase64(blob);
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ dataUrl, formType, ts: Date.now() })
      );
      setStatus(
        'No connection — recording saved on this phone. It will fill the form automatically once you are back online.'
      );
    } catch {
      setStatus(
        'No connection and the recording could not be saved. Re-record once you have service.'
      );
    }
  };

  const run = async (blob) => {
    setProcessing(true);
    setStatus('Transcribing and filling in the form…');
    try {
      const data = await processVoiceIntake(blob, formType);
      onExtracted(data);
      setStatus(null);
    } catch {
      await saveForLater(blob);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const retry = async () => {
      const raw = localStorage.getItem(PENDING_KEY);
      if (!raw || !navigator.onLine) return;
      try {
        const { dataUrl, formType: savedType } = JSON.parse(raw);
        if (savedType !== formType) return;
        localStorage.removeItem(PENDING_KEY);
        await run(await base64ToBlob(dataUrl));
      } catch {}
    };
    retry();
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, []);

  const start = async () => {
    setStatus(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        run(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setStatus('Microphone not available on this device.');
    }
  };

  const stop = () => {
    if (recorderRef.current) recorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={recording ? stop : start}
        disabled={processing}
        className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-semibold text-sm border transition-colors ${
          recording
            ? 'bg-red-500 text-white border-red-600 animate-pulse'
            : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
        }`}
      >
        {processing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : recording ? (
          <Square className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
        {processing
          ? 'Processing…'
          : recording
            ? 'Tap to Stop & Fill In'
            : 'Tap to Speak — Fills the Form'}
      </button>
      {status && (
        <p className="text-xs text-amber-600 mt-1.5 text-center">{status}</p>
      )}
    </div>
  );
}