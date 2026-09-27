import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import usePlanFeature from '@/hooks/usePlanFeature';

const PENDING_KEY = 'pending_voice_intake';

const blobToBase64 = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

const base64ToBlob = async (dataUrl) => (await fetch(dataUrl)).blob();

// The recording is sent to the app's backend, which checks the caller and
// their shop's plan before any AI work runs, then returns the form fields.
export async function processVoiceIntake(blob, formType = 'job') {
  const dataUrl = await blobToBase64(blob);
  const res = await base44.functions.invoke('voiceIntake', {
    form_type: formType,
    mime_type: blob.type || 'audio/webm',
    audio_base64: dataUrl,
  });
  const fields = res.data?.fields;
  if (!fields) throw new Error('Voice intake failed');
  return fields;
}

export default function VoiceIntake({ formType = 'job', onExtracted }) {
  const { locked } = usePlanFeature('voice_intake');
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
    } catch (err) {
      const code = err?.response?.status;
      const message = err?.response?.data?.error;
      if (code === 401 || code === 403) {
        setStatus(message || 'Voice intake is not available on your plan.');
        return;
      }
      if (code === 413) {
        setStatus(message || 'That recording is too long to transcribe.');
        return;
      }
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

  if (locked) {
    return (
      <Link
        to="/billing"
        className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-semibold text-sm border bg-slate-50 text-slate-500 border-slate-200"
      >
        <Lock className="w-5 h-5" /> Voice intake — upgrade to use
      </Link>
    );
  }

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