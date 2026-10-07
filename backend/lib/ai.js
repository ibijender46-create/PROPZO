const OpenAI = require("openai");

/* =========================================================
   OPENAI CLIENT
   ========================================================= */

let openai = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not configured"
    );
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openai;
}

/* =========================================================
   OPENAI
   ========================================================= */

async function askOpenAI(prompt) {
  if (!prompt || !String(prompt).trim()) {
    throw new Error(
      "OpenAI prompt is required"
    );
  }

  const client = getOpenAIClient();

  const response =
    await client.responses.create({
      model:
        process.env.OPENAI_MODEL ||
        "gpt-5.5",

      input: String(prompt),

      max_output_tokens:
        Number(
          process.env.OPENAI_MAX_OUTPUT_TOKENS
        ) || 2000,
    });

  return (
    response.output_text ||
    ""
  ).trim();
}

/* =========================================================
   GEMINI
   ========================================================= */

async function askGemini(prompt) {
  if (!prompt || !String(prompt).trim()) {
    throw new Error(
      "Gemini prompt is required"
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured"
    );
  }

  const model =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type":
        "application/json",

      "x-goog-api-key":
        process.env.GEMINI_API_KEY,
    },

    body: JSON.stringify({
      contents: [
        {
          role: "user",

          parts: [
            {
              text: String(prompt),
            },
          ],
        },
      ],

      generationConfig: {
        temperature: 0.7,
        maxOutputTokens:
          Number(
            process.env.GEMINI_MAX_OUTPUT_TOKENS
          ) || 2000,
      },
    }),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Invalid response received from Gemini API"
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Gemini API request failed"
    );
  }

  const text =
    data?.candidates?.[0]
      ?.content?.parts
      ?.map(
        (part) =>
          part?.text || ""
      )
      .join("")
      .trim() || "";

  if (!text) {
    throw new Error(
      "Gemini returned an empty response"
    );
  }

  return text;
}

/* =========================================================
   UNIVERSAL AI HELPER
   ========================================================= */

async function askAI(
  prompt,
  provider = "openai"
) {
  const selectedProvider =
    String(provider)
      .trim()
      .toLowerCase();

  if (
    selectedProvider ===
    "gemini"
  ) {
    return askGemini(prompt);
  }

  return askOpenAI(prompt);
}

/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
  askOpenAI,
  askGemini,
  askAI,
};
