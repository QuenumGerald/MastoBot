const MODEL_NAME = 'gemini-2.0-flash-lite';
// Fonction de génération de texte via Gemini (à adapter selon la vraie API)
const fetch = require('node-fetch');

async function generateReply(text) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  // Ceci est un exemple fictif, à remplacer par l'appel réel à l'API Gemini
  const response = await fetch('https://api.gemini.com/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${geminiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: text })
  });
  const data = await response.json();
  // Adapter selon la réponse réelle de Gemini
  return data.result || '[Réponse générée]';
}

module.exports = { generateReply };
