import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { requireFeature } from "../../shared/planGuard.ts";

// Voice intake runs here, never in the browser. The recording is uploaded,
// transcribed and turned into form fields only after we have confirmed the
// caller is signed in and their shop's plan includes voice intake, so the
// app's AI credits can only be spent by shops entitled to the feature.

const EQUIPMENT_TYPES = [
  'Lawn Mower',
  'Motorcycle/ATV',
  'Generator',
  'Compressor',
  'Chainsaw',
  'Weed Eater',
  'Other',
];

const EXTRACTION_SPECS: Record<string, any> = {
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

// The uploaded file must carry an extension that matches its real format,
// otherwise transcription refuses it. MediaRecorder reports the type with
// codec parameters (e.g. "audio/webm;codecs=opus"), so match on the base type.
const AUDIO_EXTENSIONS: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "mp4",
  "audio/m4a": "m4a",
  "audio/x-m4a": "m4a",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/flac": "flac",
};

function extensionFor(mimeType: string) {
  const base = mimeType.split(";")[0].trim().toLowerCase();
  return AUDIO_EXTENSIONS[base] || "webm";
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let user: any = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      user = null;
    }
    if (!user) {
      return Response.json(
        { error: "Please sign in to use voice intake." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const formType = typeof body?.form_type === "string" ? body.form_type : "job";
    const spec = EXTRACTION_SPECS[formType] || EXTRACTION_SPECS.job;
    const audio = typeof body?.audio_base64 === "string" ? body.audio_base64 : "";
    const mimeType =
      typeof body?.mime_type === "string" && body.mime_type
        ? body.mime_type
        : "audio/webm";
    if (!audio) {
      return Response.json({ error: "No recording was sent." }, { status: 400 });
    }

    // The shop and plan come from the signed-in user, never from the request.
    // Nothing runs — no upload, no transcription, no AI call — unless the
    // shop's plan includes voice intake.
    const guard = await requireFeature(base44, user, "voice_intake");
    if (!guard.ok) return guard.response;
    const sr = base44.asServiceRole;

    const base64 = audio.includes(",") ? audio.slice(audio.indexOf(",") + 1) : audio;
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const file = new File([bytes], `intake.${extensionFor(mimeType)}`, {
      type: mimeType,
    });

    const uploaded = await sr.integrations.Core.UploadPublicFile({ file });
    const transcript = await sr.integrations.Core.TranscribeAudio({
      audio_url: uploaded.file_url,
    });
    const fields = await sr.integrations.Core.InvokeLLM({
      prompt: `${spec.intro}

Transcript: "${transcript}"

Rules:
${spec.rules}`,
      response_json_schema: {
        type: "object",
        properties: spec.schema,
      },
    });

    return Response.json({ fields });
  } catch (error: any) {
    console.error("voiceIntake failed", error?.message);
    return Response.json(
      { error: error?.message || "Voice intake could not be completed." },
      { status: 500 }
    );
  }
}