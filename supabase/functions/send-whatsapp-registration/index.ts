import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function normalizePhone(value: string | null | undefined) {
  const raw = String(value ?? "").trim().replace(/[\s().-]/g, "");
  if (!raw) return null;
  if (raw.startsWith("+")) return raw.slice(1);
  if (raw.startsWith("62")) return raw;
  if (raw.startsWith("0")) return "62" + raw.slice(1);
  return raw;
}

function renderBody(body: string, registration: Record<string, unknown>) {
  return body
    .replaceAll("{{nama}}", String(registration.nama ?? ""))
    .replaceAll("{{jalur}}", String(registration.jalur ?? ""))
    .replaceAll("{{status}}", String(registration.status ?? ""));
}

function getSecrets() {
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  const publishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  return {
    supabaseUrl: Deno.env.get("SUPABASE_URL")!,
    serviceKey: secretKeys
      ? JSON.parse(secretKeys).default
      : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    publishableKey: publishableKeys
      ? JSON.parse(publishableKeys).default
      : Deno.env.get("SUPABASE_ANON_KEY"),
    wahaBaseUrl: Deno.env.get("WAHA_BASE_URL"),
    wahaApiKey: Deno.env.get("WAHA_API_KEY"),
    wahaSession: Deno.env.get("WAHA_SESSION") ?? "default",
  };
}

async function getAdminUserId(req: Request, client: ReturnType<typeof createClient>) {
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  const token = authorization.slice("Bearer ".length);
  const { data: userData } = await client.auth.getUser(token);
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data: role } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  return role ? userId : null;
}

async function wahaRequest(
  baseUrl: string,
  apiKey: string,
  path: string,
  init: RequestInit = {},
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    return await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
        ...(init.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  const secrets = getSecrets();
  if (!secrets.supabaseUrl || !secrets.serviceKey) {
    return json({ ok: false, error: "Supabase server configuration is incomplete." }, 500);
  }

  const adminClient = createClient(secrets.supabaseUrl, secrets.serviceKey);

  let payload: {
    registration_id?: string;
    template_id?: string;
    mode?: "auto" | "manual";
  };

  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON payload." }, 400);
  }

  const registrationId = payload.registration_id;
  const mode = payload.mode ?? "manual";

  if (!registrationId || !["auto", "manual"].includes(mode)) {
    return json({ ok: false, error: "registration_id and mode are required." }, 400);
  }

  let sentBy: string | null = null;

  if (mode === "manual") {
    if (!secrets.publishableKey) {
      return json({ ok: false, error: "Supabase auth configuration is incomplete." }, 500);
    }

    const authClient = createClient(secrets.supabaseUrl, secrets.publishableKey);
    sentBy = await getAdminUserId(req, authClient);

    if (!sentBy) return json({ ok: false, error: "Admin access required." }, 403);
  }

  const { data: registration, error: registrationError } = await adminClient
    .from("registrations")
    .select("id,nama,sekolah,kota,email,nomor_hp,jalur,status,created_at")
    .eq("id", registrationId)
    .single();

  if (registrationError || !registration) {
    return json({ ok: false, error: "Pendaftar tidak ditemukan." }, 404);
  }

  if (mode === "auto") {
    const ageMs = Date.now() - new Date(registration.created_at).getTime();
    if (ageMs > 10 * 60 * 1000) {
      return json(
        { ok: false, error: "Auto-reply hanya dapat dipicu untuk pendaftaran yang baru dibuat." },
        400,
      );
    }
  }

  let templateQuery = adminClient
    .from("whatsapp_templates")
    .select("id,name,body,is_active,is_auto_reply");

  const templateId = payload.template_id;

  if (mode === "auto") {
    templateQuery = templateQuery
      .eq("is_auto_reply", true)
      .eq("is_active", true)
      .limit(1) as typeof templateQuery;
  } else {
    if (!templateId) {
      return json({ ok: false, error: "template_id wajib untuk pengiriman manual." }, 400);
    }
    templateQuery = templateQuery.eq("id", templateId) as typeof templateQuery;
  }

  const { data: templates, error: templateError } = await templateQuery;
  const template = templates?.[0];

  if (templateError || !template || !template.is_active) {
    return json({ ok: false, error: "Template WhatsApp tidak ditemukan atau tidak aktif." }, 404);
  }

  const phone = normalizePhone(registration.nomor_hp);
  const body = renderBody(template.body, registration);

  if (!phone || phone.length < 10 || phone.length > 15) {
    return json({ ok: false, error: "Nomor WhatsApp pendaftar tidak valid." }, 400);
  }

  if (mode === "auto") {
    const { data: existingAuto } = await adminClient
      .from("whatsapp_messages")
      .select("id,status")
      .eq("registration_id", registration.id)
      .eq("template_id", template.id)
      .limit(1);

    if (existingAuto?.length) {
      return json({
        ok: true,
        already_sent: true,
        status: existingAuto[0].status,
      });
    }
  }

  const { data: message, error: messageError } = await adminClient
    .from("whatsapp_messages")
    .insert({
      registration_id: registration.id,
      template_id: template.id,
      phone_number: phone,
      message_body: body,
      status: "pending",
      sent_by: sentBy,
    })
    .select("id")
    .single();

  if (messageError || !message) {
    return json({ ok: false, error: "Gagal mencatat pesan WhatsApp." }, 500);
  }

  if (!secrets.wahaBaseUrl || !secrets.wahaApiKey) {
    const errorMessage =
      "WAHA belum dikonfigurasi. Atur WAHA_BASE_URL dan WAHA_API_KEY pada secrets Edge Function.";
    await adminClient
      .from("whatsapp_messages")
      .update({
        status: "failed",
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", message.id);

    return json(
      { ok: false, status: "failed", message_id: message.id, error: errorMessage },
      503,
    );
  }

  const chatId = `${phone}@c.us`;

  let sessionResponse: Response;
  try {
    sessionResponse = await wahaRequest(
      secrets.wahaBaseUrl,
      secrets.wahaApiKey,
      `/api/sessions/${encodeURIComponent(secrets.wahaSession)}`,
      { method: "GET" },
    );
  } catch (error) {
    const errorMessage =
      error instanceof DOMException && error.name === "AbortError"
        ? "Koneksi ke WAHA timeout setelah 15 detik."
        : "Tidak dapat terhubung ke server WAHA.";

    await adminClient
      .from("whatsapp_messages")
      .update({
        status: "failed",
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", message.id);

    return json(
      { ok: false, status: "failed", message_id: message.id, error: errorMessage },
      502,
    );
  }

  const sessionBody = await sessionResponse.json().catch(() => ({}));

  if (!sessionResponse.ok) {
    const errorMessage =
      sessionBody?.message ??
      sessionBody?.error ??
      `WAHA session tidak dapat diakses (HTTP ${sessionResponse.status}).`;

    await adminClient
      .from("whatsapp_messages")
      .update({
        status: "failed",
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", message.id);

    return json(
      { ok: false, status: "failed", message_id: message.id, error: errorMessage },
      502,
    );
  }

  if (sessionBody?.status !== "WORKING") {
    const errorMessage = `WAHA session "${secrets.wahaSession}" belum siap. Status: ${sessionBody?.status ?? "UNKNOWN"}.`;

    await adminClient
      .from("whatsapp_messages")
      .update({
        status: "failed",
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", message.id);

    return json(
      { ok: false, status: "failed", message_id: message.id, error: errorMessage },
      503,
    );
  }

  let apiResponse: Response;

  try {
    apiResponse = await wahaRequest(
      secrets.wahaBaseUrl,
      secrets.wahaApiKey,
      "/api/sendText",
      {
        method: "POST",
        body: JSON.stringify({
          session: secrets.wahaSession,
          chatId,
          text: body,
        }),
      },
    );
  } catch (error) {
    const errorMessage =
      error instanceof DOMException && error.name === "AbortError"
        ? "Pengiriman ke WAHA timeout setelah 15 detik."
        : "Koneksi ke WAHA gagal saat mengirim pesan.";

    await adminClient
      .from("whatsapp_messages")
      .update({
        status: "failed",
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", message.id);

    return json(
      { ok: false, status: "failed", message_id: message.id, error: errorMessage },
      502,
    );
  }

  const apiBody = await apiResponse.json().catch(() => ({}));

  if (!apiResponse.ok) {
    const errorMessage =
      apiBody?.message ??
      apiBody?.error ??
      `WAHA mengembalikan HTTP ${apiResponse.status}.`;

    await adminClient
      .from("whatsapp_messages")
      .update({
        status: "failed",
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", message.id);

    return json(
      { ok: false, status: "failed", message_id: message.id, error: errorMessage },
      502,
    );
  }

  const providerMessageId =
    apiBody?.id ??
    apiBody?.message?.id ??
    apiBody?.data?.id ??
    null;

  await adminClient
    .from("whatsapp_messages")
    .update({
      status: "sent",
      provider_message_id: providerMessageId ? String(providerMessageId) : null,
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", message.id);

  return json({
    ok: true,
    status: "sent",
    message_id: message.id,
    provider_message_id: providerMessageId,
    chat_id: chatId,
  });
});
