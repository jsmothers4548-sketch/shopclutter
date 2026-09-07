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

const blobToBase64 = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

const base64ToBlob = async (dataUrl) => (await fetch(dataUrl)).blob();

export async function processVoiceIntake(blob) {
  const file = new File([blob], 'intake.webm', {
    type: blob.type || 'audio/webm',
  });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  const transcript = await base44.integrations.Core.TranscribeAudio({
    audio_url: file_url,
  });
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `A small engine repair shop technician described a new job intake verbally. Extract the details from the transcript and return them as form fields.

Transcript: "${transcript}"

Rules:
- equipment_type must be one of: ${EQUIPMENT_TYPES.join(', ')} (best guess, use "Other" if unclear).
- problem_description: a concise summary of the reported issue in the technician's terms.
- unit_label: the unit label number if one is spoken (digits only, e.g. "1001"). Empty string if not mentioned.
- customer_name: the customer's name if spoken. Empty string if not mentioned.
- Leave any field as an empty string if it is not mentioned.`,
    response_json_schema: {
      type: 'object',
      properties: {
        customer_name: { type: 'string' },
        unit_label: { type: 'string' },
        equipment_type: { type: 'string', enum: EQUIPMENT_TYPES },
        make: { type: 'string' },
        model: { type: 'string' },
        serial_number: { type: 'string' },
        problem_description: { type: 'string' },
      },
    },
  });
  return res;
}

export default function VoiceIntake({ onExtracted }) {
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
        JSON.stringify({ dataUrl, ts: Date.now() })
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
      const data = await processVoiceIntake(blob);
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
        const { dataUrl } = JSON.parse(raw);
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