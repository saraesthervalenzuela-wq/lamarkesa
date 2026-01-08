export const handler = async (event) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  // Manejar preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const { textInput } = JSON.parse(event.body)

    if (!textInput) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No data provided' })
      }
    }

    // API Key desde variable de entorno de Netlify
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      }
    }

    const systemPrompt = `Extract jewelry items from this data. Return ONLY a JSON array with objects containing:
- name: string (jewelry name)
- price: number (price as number, 0 if not found)
- category: string (rings, necklaces, earrings, bracelets, watches, or other)
- sku: string (code/SKU if found, or empty)

Process ALL sheets. Skip headers. Return ONLY valid JSON array, no explanation.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: textInput }
        ],
        temperature: 0.1,
        max_tokens: 16000
      })
    })

    const data = await response.json()

    if (data.error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: data.error.message })
      }
    }

    let resultText = data.choices[0].message.content
    resultText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const items = JSON.parse(resultText)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ items })
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    }
  }
}
