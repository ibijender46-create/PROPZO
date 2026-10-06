const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function askOpenAI(prompt) {
  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: prompt
  });

  return response.output_text;
}

async function askGemini(prompt) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Gemini API error"
    );
  }

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
  );
}

module.exports = {
  askOpenAI,
  askGemini
};
