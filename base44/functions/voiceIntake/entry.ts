import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { requireFeature } from "../../shared/planGuard.ts";

// Voice intake runs here, never in the browser. The recording is uploaded,
// transcribed and turned into form fields only after we have confirmed the
// caller is signed in and their shop's plan includes voice intake, so the
// app's AI credits can only be spent by shops entitled to the feature.

// Mirrors src/lib/equipmentTypes.js — the picker's guided list. Anything the
// technician names that is not on it is kept as its own name.
const EQUIPMENT_TYPES = [
  'Lawn Mower',
  'Riding Mower',
  'Zero-Turn Mower',
  'Weed Eater',
  'Edger',
  'Hedge Trimmer',
  'Handheld Blower',
  'Backpack Blower',
  'Chainsaw',
  'Pressure Washer',
  'Generator',
  'Compressor',
  'Tiller',
  'Snow Blower',
  'Motorcycle/ATV',
  'Go-Kart',
  'Side-by-Side (UTV)',
];

const EXTRACTION_SPECS: Record<string, any> = {
  job: {
    intro:
      'A small engine repair shop technician described a new job intake verbally. Extract the details from the transcript and return them as form fields.',
    rules: `- equipment_type: the machine's own name. Use one of these when it fits: ${EQUIPMENT_TYPES.join(', ')}. If the technician names a machine that is not on that list, use the name they said rather than "Other".
- problem_description: a concise summary of the reported issue in the technician's terms.
- unit_label: the unit label number if one is spoken (digits only, e.g. "1001"). Empty string if not mentioned.
- customer_name: the customer's name if spoken. Empty string if not mentioned.`,
    schema: {
      customer_name: { type: 'string' },
      unit_label: { type: 'string' },
      equipment_type: { type: 'string' },
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

// The transcription service refuses anything over 25 MB, so oversized
// recordings are turned away before they are stored.
const MAX_RECORDING_BYTES = 25 * 1024 * 1024;

// Every recording costs the owner AI credits — a transcription plus an AI read
// of the transcript — so each person gets a bounded allowance per hour, counted
// on the server. A stuck loop or a curious technician cannot spend without limit.
const MAX_INTAKES_PER_HOUR = 30;

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
    const shopId = guard.shop.id;

    // This person's own recordings in the last hour, counted before any work is
    // done, so nothing is transcribed or sent to the AI once the allowance is
    // spent.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentIntakes = await sr.entities.AiUsage.count({
      user_id: user.id,
      feature: "voice_intake",
      created_date: { $gte: since },
    });
    if (recentIntakes >= MAX_INTAKES_PER_HOUR) {
      return Response.json(
        {
          error:
            "You've reached the voice intake limit for now. Please try again a little later.",
        },
        { status: 429 }
      );
    }

    const base64 = audio.includes(",") ? audio.slice(audio.indexOf(",") + 1) : audio;
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    if (bytes.length > MAX_RECORDING_BYTES) {
      return Response.json(
        {
          error:
            "That recording is too long to transcribe. Keep it short and try again.",
        },
        { status: 413 }
      );
    }

    // The slot is claimed before the AI runs, so a burst of parallel recordings
    // cannot slip past the allowance.
    await sr.entities.AiUsage.create({
      shop_id: shopId,
      user_id: user.id,
      feature: "voice_intake",
    });

    const file = new File([bytes], `intake.${extensionFor(mimeType)}`, {
      type: mimeType,
    });

    // The recording is a customer conversation, so it goes to the app's private
    // storage: no public copy is ever created. Transcription is handed a
    // short-lived signed link that is used once and then expires.
    const uploaded = await sr.integrations.Core.UploadPrivateFile({ file });
    const signed = await sr.integrations.Core.CreateFileSignedUrl({
      file_uri: uploaded.file_uri,
      expires_in: 300,
    });
    const transcript = await sr.integrations.Core.TranscribeAudio({
      audio_url: signed.signed_url,
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