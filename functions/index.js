const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const openaiApiKey = defineSecret("OPENAI_API_KEY");

exports.openai = onRequest({ cors: true, secrets: [openaiApiKey] }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { textInput } = req.body;

    if (!textInput) {
      res.status(400).json({ error: "No data provided" });
      return;
    }

    const apiKey = openaiApiKey.value();

    if (!apiKey) {
      res.status(500).json({ error: "OpenAI API key not configured" });
      return;
    }

    const systemPrompt = `Extract jewelry items from this data. Return ONLY a JSON array with objects containing:
- name: string (jewelry name)
- price: number (price as number, 0 if not found)
- category: string (rings, necklaces, earrings, bracelets, watches, or other)
- sku: string (code/SKU if found, or empty)

Process ALL sheets. Skip headers. Return ONLY valid JSON array, no explanation.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: textInput },
        ],
        temperature: 0.1,
        max_tokens: 16000,
      }),
    });

    const data = await response.json();

    if (data.error) {
      res.status(400).json({ error: data.error.message });
      return;
    }

    let resultText = data.choices[0].message.content;
    resultText = resultText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const items = JSON.parse(resultText);

    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
