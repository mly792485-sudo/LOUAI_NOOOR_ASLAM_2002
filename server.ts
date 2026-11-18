/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "12kb" }));

app.use((error: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error?.type === "entity.too.large") return assistantError(res, 413);
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "صيغة الطلب غير صالحة." });
  }
  return next(error);
});

const ASSISTANT_LIMIT = 10;
const ASSISTANT_WINDOW_MS = 60_000;
const assistantRequests = new Map<string, number[]>();
const ASSISTANT_DISCLAIMER = "تنبيه: هذه إجابة آلية قد تخطئ، ولا تُعد فتوى. راجع عالمًا موثوقًا في المسائل الشرعية المهمة.";

function assistantClientKey(req: express.Request) {
  const forwarded = req.headers["x-forwarded-for"];
  return typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.ip || "unknown";
}

function allowAssistantRequest(req: express.Request) {
  const now = Date.now();
  const key = assistantClientKey(req);
  const recent = (assistantRequests.get(key) || []).filter((time) => now - time < ASSISTANT_WINDOW_MS);
  if (recent.length >= ASSISTANT_LIMIT) {
    assistantRequests.set(key, recent);
    return false;
  }
  recent.push(now);
  assistantRequests.set(key, recent);
  return true;
}

function readQuestion(body: unknown) {
  const question = (body as { question?: unknown } | null)?.question;
  if (typeof question !== "string") return { error: "INVALID_QUESTION" } as const;
  const normalized = question.trim();
  if (normalized.length < 2 || normalized.length > 800) return { error: "QUESTION_LENGTH" } as const;
  return { question: normalized } as const;
}

function assistantError(res: express.Response, status = 500) {
  return res.status(status).json({ error: "تعذر الاتصال بالمستشار الآن، حاول لاحقاً." });
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'noor-al-islam-assistant' });
});

// Keep OPENAI_API_KEY on the server and allow the compiled mobile app to call
// the API over HTTPS. APP_URL should be set to the deployed app/API origin.
app.use((req, res, next) => {
  const configuredOrigins = (process.env.APP_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const requestOrigin = req.headers.origin || '';
  const nativeOrigin = /^(capacitor|ionic|http):\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(requestOrigin);
  const isAllowed = !requestOrigin || configuredOrigins.includes(requestOrigin) || nativeOrigin;
  if (requestOrigin && isAllowed) res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
  const configuredBaseUrl = process.env.OPENAI_BASE_URL || process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
  const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, "");
  const url = normalizedBaseUrl.endsWith("/chat/completions")
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/chat/completions`;
  return {
    apiKey,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    url,
  };
}

async function openAIChat(messages: Array<{ role: string; content: string }>, stream = false, signal?: AbortSignal) {
  const config = getOpenAIConfig();
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: config.model, messages, temperature: 0.2, stream, max_tokens: 900 }),
    signal,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI API ${response.status}: ${detail.slice(0, 300)}`);
  }
  return response;
}

// 1. Tafsir route: never generate Quranic tafsir with an LLM.
// A verified tafsir dataset must be imported and reviewed before this route is enabled.
app.post("/api/ai/tafsir", async (req, res) => {
  return res.status(503).json({
    available: false,
    error: "التفسير المولد بالذكاء الاصطناعي متوقف حفاظًا على أمان المحتوى الشرعي.",
    message: "سيُفعّل التفسير بعد إضافة قاعدة بيانات تفسير موثقة ومراجعة مصدر كل نقل.",
  });
});

// 2. API route for Islamic Q&A Companion (Streaming for real-time speed)
app.post("/api/ai/qa/stream", async (req, res) => {
  if (!allowAssistantRequest(req)) return assistantError(res, 429);
  const parsedQuestion = readQuestion(req.body);
  if ("error" in parsedQuestion) return assistantError(res, 400);
  const requestController = new AbortController();
  let completed = false;
  req.once("aborted", () => requestController.abort());
  res.once("close", () => { if (!completed) requestController.abort(); });
  try {
    const { question } = parsedQuestion;

    const systemInstruction = `أنت مساعد بحث إسلامي اسمه "مستشار نور الإسلام" ولست مفتياً مستقلاً.
أجب فقط بما تستطيع نسبته بأمان إلى مصادر محددة: القرآن الكريم، صحيح البخاري، صحيح مسلم، وكتب العلماء المعروفة. لا تخترع آية أو حديثاً أو رقماً أو قولاً، ولا تنسب نصاً لمصدر لم تتحقق منه. إذا لم تكن متأكداً فقل بوضوح: "لا أستطيع التحقق من هذه النسبة الآن" ولا تملأ الفراغ بتخمين.
اجعل الذكاء الاصطناعي أداة لترتيب وشرح المادة الموثقة فقط، وليس مصدراً شرعياً.
في كل إجابة دينية: اذكر الدليل أو المصدر في قسم مستقل بعنوان "المصادر"، مع اسم الكتاب ورقم الحديث أو السورة والآية متى أمكن، وميّز بين النص المنقول والشرح.
في مسائل الطلاق والمواريث والتكفير والدماء والعقود والمعاملات المعقدة والفتاوى الخاصة بالأشخاص: لا تعط حكماً قطعياً؛ اذكر القاعدة العامة إن كانت موثقة، ثم وجّه السائل إلى عالم موثوق أو جهة إفتاء رسمية مع التنبيه أن التفاصيل تغيّر الحكم.
اكتب بالعربية الفصيحة وبهدوء واختصار، ولا تبدأ بإجابة طويلة منمقة بلا دليل، ولا تستخدم عبارات توحي بأنك شيخ أو جهة إفتاء.`;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.write(`data: ${JSON.stringify({ text: `${ASSISTANT_DISCLAIMER}\n\n` })}\n\n`);

    const responseStream = await openAIChat([
      { role: "system", content: systemInstruction },
      { role: "user", content: question },
    ], true, requestController.signal);
    if (!responseStream.body) throw new Error("OpenAI returned no response body");
    const reader = responseStream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const data = line.trim().replace(/^data:\s*/, "");
        if (!data || data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
          const text = parsed.choices?.[0]?.delta?.content;
          if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
        } catch {
          // Ignore incomplete SSE frames; the next chunk completes them.
        }
      }
    }
    res.write("data: [DONE]\n\n");
    completed = true;
    res.end();
  } catch (error: any) {
    console.error("Streaming Q&A Error:", error);
    if (requestController.signal.aborted) return;
    if (!res.headersSent) {
      assistantError(res);
    } else {
      res.write(`data: ${JSON.stringify({ error: "تعذر الاتصال بالمستشار الآن، حاول لاحقاً." })}\n\n`);
      res.end();
    }
  }
});

// 2b. Standard fallback API route for Islamic Q&A
app.post("/api/ai/qa", async (req, res) => {
  if (!allowAssistantRequest(req)) return assistantError(res, 429);
  const parsedQuestion = readQuestion(req.body);
  if ("error" in parsedQuestion) return assistantError(res, 400);
  const requestController = new AbortController();
  let completed = false;
  req.once("aborted", () => requestController.abort());
  res.once("close", () => { if (!completed) requestController.abort(); });
  try {
    const { question } = parsedQuestion;

    const systemInstruction = `أنت مساعد بحث إسلامي اسمه "مستشار نور الإسلام". أجب من القرآن الكريم وصحيح البخاري وصحيح مسلم والمصادر العلمية المعروفة فقط، ولا تخترع نصوصاً أو أرقاماً. يجب أن تختم كل إجابة بقسم "المصادر" يذكر المرجع ورقم الحديث أو السورة والآية متى أمكن. إذا لم تتأكد فصرّح بعدم القدرة على التحقق. لا تعط فتوى قطعية في الطلاق والمواريث والتكفير والدماء والمعاملات المعقدة، بل وجّه إلى عالم أو جهة إفتاء رسمية.`;

    const response = await openAIChat([
      { role: "system", content: systemInstruction },
      { role: "user", content: question },
    ], false, requestController.signal);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    completed = true;
    res.json({ text: `${ASSISTANT_DISCLAIMER}\n\n${data.choices?.[0]?.message?.content || "تعذر الحصول على إجابة من الخادم."}` });
  } catch (error: any) {
    console.error("Islamic Q&A API Error:", error);
    if (requestController.signal.aborted) return;
    assistantError(res);
  }
});

// 3. Standalone Privacy Policy web page for App Store Connect submission
app.get("/privacy-policy", (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>سياسة الخصوصية | تطبيق نور الإسلام</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #064e3b;
      --accent: #d97706;
      --bg: #070d0e;
      --card-bg: #0c181a;
      --border: #1a3338;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.8;
      padding: 24px 16px;
    }
    .container {
      max-width: 780px;
      margin: 0 auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 32px 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    @media (min-width: 640px) {
      .container { padding: 48px 40px; }
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 26px;
      font-weight: 900;
      color: #fcd34d;
      margin-bottom: 8px;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 14px;
    }
    .section {
      margin-bottom: 24px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 20px;
    }
    h2 {
      font-size: 17px;
      font-weight: 800;
      color: #6ee7b7;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    p {
      font-size: 14px;
      color: #cbd5e1;
      line-height: 1.9;
    }
    .english-box {
      direction: ltr;
      text-align: left;
      font-family: system-ui, -apple-system, sans-serif;
      margin-top: 32px;
      background: rgba(217, 119, 6, 0.08);
      border: 1px solid rgba(217, 119, 6, 0.25);
      border-radius: 16px;
      padding: 24px;
    }
    .english-box h3 {
      color: #f59e0b;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .english-box p {
      font-size: 13px;
      color: #e2e8f0;
      line-height: 1.6;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">سياسة الخصوصية</span>
      <h1>سياسة الخصوصية لتطبيق "نور الإسلام"</h1>
      <p class="subtitle">تاريخ آخر تحديث: 14 نوفمبر 2026</p>
    </div>

    <div class="section">
      <h2>مقدمة</h2>
      <p>نُولي في تطبيق <strong>"نور الإسلام"</strong> اهتماماً بالغاً بخصوصية المستخدمين. توضح هذه السياسة كيف نتعامل مع البيانات والمعلومات عند استخدامك لتطبيقنا على كافة الأجهزة الذكية وأنظمة iOS و iPadOS.</p>
    </div>

    <div class="section">
      <h2>جمع البيانات</h2>
      <p>لا يطلب التطبيق إنشاء حساب لتشغيل القرآن والأذكار ومواقيت الصلاة والقبلة، ولا نطلب الاسم أو رقم الهاتف أو البريد الإلكتروني للميزات الأساسية. عند استخدام مستشار نور الإسلام، يُرسل نص السؤال إلى خادم التطبيق ثم إلى مزود الذكاء الاصطناعي لمعالجة الرد؛ لذلك لا تكتب معلومات شخصية أو سرية داخل السؤال.</p>
    </div>

    <div class="section">
      <h2>أذونات الجهاز والمعالجة المحلية</h2>
      <p>قد يتطلب التطبيق إذن الإشعارات لتنبيهات الصلاة والأذان، وإذن الموقع لتحديد المدينة ومواقيت الصلاة واتجاه القبلة. عند تفعيل الموقع، قد تُرسل الإحداثيات إلى AlAdhan لحساب المواقيت وإلى OpenStreetMap Nominatim لتحويل الإحداثيات إلى اسم مدينة. يمكنك رفض الإذن واختيار المدينة يدوياً.</p>
    </div>

    <div class="section">
      <h2>خدمات الأطراف الثالثة</h2>
      <p>يستخدم التطبيق AlAdhan لمواقيت الصلاة، وOpenStreetMap Nominatim للتحويل العكسي للموقع، ومزود ذكاء اصطناعي لمعالجة سؤال المستشار. قد يتلقى كل مزود البيانات اللازمة لتقديم خدمته وفق سياسته الخاصة. لا نستخدم شبكات إعلانية ولا نبيع بيانات المستخدمين، ولا ينبغي إرسال بيانات شخصية أو حساسة إلى المستشار.</p>
    </div>

    <div class="section">
      <h2>التعديلات على السياسة</h2>
      <p>قد نقوم بتحديث سياسة الخصوصية من وقت لآخر لمواكبة التحديثات التقنية، وسيتم نشر أي تغييرات داخل هذه الصفحة ومباشرة عبر التطبيق.</p>
    </div>

    <div class="section">
      <h2>التواصل معنا</h2>
      <p>إذا كانت لديك أي استفسارات أو ملاحظات حول سياسة الخصوصية، تواصل معنا عبر البريد: <a href="mailto:lwya0721@gmail.com">lwya0721@gmail.com</a></p>
    </div>

    <div class="english-box">
      <h3>App Store Review Compliance Note (English)</h3>
      <p><strong>App Name:</strong> Noor Al-Islam (نور الإسلام)<br>
      <strong>Data Collection:</strong> The app does not require an account and does not sell personal data. Prayer times, local notifications, Quran reading and tasbih operate on-device. Questions entered into the optional Islamic assistant are sent to the app backend and an AI provider to generate a response. Users are instructed not to submit sensitive personal information.</p>
    </div>

    <div class="footer">
      <p>تطبيق نور الإسلام - صدقة جارية عن لؤي بن حسين ووالده رحمه الله</p>
      <p>© 2026 جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

// Serve static files / Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for SPA routing in development mode
    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = await fs.promises.readFile(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
