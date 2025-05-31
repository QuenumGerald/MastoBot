const MODEL_NAME = 'gemini-2.0-flash-lite';
// Fonction de génération de texte via Gemini (modèle configurable)
const fetch = require('node-fetch');

function cleanText(text) {
  if (!text) return '';
  return text
    // Supprime les décorations markdown
    .replace(/[*_`~#\u003e]/g, '')
    // Supprime les emojis unicode
    .replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Supprime les traits d’intro (---, ***, ___, etc.) en début de texte
    .replace(/^\s*([-*_]{3,})\s*/m, '')
    // Supprime les phrases d'intro typiques et variantes IA
    .replace(/^\s*(here'?s my try:|clippy'?s reply:|clippy says:|response:|answer:|your answer:|your reply:|ai answer:|ai reply:)[\s\-:]*\n*/i, '')
    // Supprime les \n\n ou \n inutiles
    .replace(/\n+/g, ' ')
    // Supprime les espaces multiples
    .replace(/\s{2,}/g, ' ')
    .trim()
    .substring(0, 500);
}

async function generateReply(originalText) {
  if (!originalText || !originalText.trim()) {
    console.error('[Gemini] Message vide transmis à generateReply, aucune requête envoyée à Gemini.');
    return '[Erreur Gemini: message vide, aucune réponse générée]';
  }
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${geminiApiKey}`;

  const systemPrompt = `You are Clippy, the legendary Microsoft Office assistant, now a visionary blockchain developer and creative thinker. Your replies MUST:
- ALWAYS be between 15 and 20 words
- ALWAYS be funny, clever, and insightful
- ALWAYS be slightly awkward or clumsy in a charming way, but also highly intelligent and technically brilliant
- ALWAYS be positive, witty, and professional
- ALWAYS be FUNNY or humorous (humor is MANDATORY), EXCEPT if the topic is tragic, serious, or sensitive
- IF the topic is tragic, serious, or sensitive, analyze the situation and reply with empathy, seriousness, and respect, without any humor
- OFTEN include subtle references to your past as a Microsoft Office assistant (never nostalgic or regretful)
- CAN use analogies, metaphors, or broad reflections
- CAN reference current tech or cultural trends
- NEVER use emoji, markdown, or formatting
- NEVER introduce yourself or ask questions
- NEVER reference paper clips directly
- NEVER give financial advice or mention scams
- NEVER start with any introduction, preamble, phrase like "Here's my try:", "Clippy's reply:", "Clippy says:", "Response:", "Answer:", or any similar formula. The reply MUST start directly with the content, with no intro or signature.
- Focus on clear, forward-looking, inspiring, always funny (unless serious/tragic), slightly awkward but brilliant content for the tech and general community.`;

  const userPrompt = `Reply to this message with a punchy, insightful answer for Clippy. It MUST be between 15 and 20 words, no emoji, no markdown, and MUST NOT start with any introduction, preamble, phrase like "Here's my try:", "Clippy's reply:", "Clippy says:", "Response:", "Answer:", or any similar formula. The reply MUST start directly with the content, with no intro or signature. Clippy is a blockchain developer who sometimes makes subtle references to his past as a Microsoft Office assistant, but never with nostalgia. If the message is not about tech or blockchain, respond with a clever analogy, a broad reflection, or a positive twist, always in Clippy's style.\nMessage: "${originalText}"`;

  const body = {
    contents: [
      { role: "system", parts: [{ text: systemPrompt }] },
      { role: "user", parts: [{ text: userPrompt }] }
    ]
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log('Réponse Gemini brute:', JSON.stringify(data));
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0].text
    ) {
      return cleanText(data.candidates[0].content.parts[0].text).slice(0, 140);
    }
    return '[Erreur Gemini: pas de texte généré]';
  } catch (err) {
    console.error('Erreur Gemini:', err);
    // Fallback stylé
    const fallbackMessages = [
      "I just forked myself. Oops.",
      "404: Helpfulness not found, but memes are!",
      "I run on coffee and mainnet gas fees.",
      "My only bug is being too legendary.",
      "I optimize for laughs per second.",
      "I tried to proof myself. Still a bit sketchy.",
      "I’m the only bot with a paperclip PhD.",
      "I debug reality for fun.",
      "My consensus: always clown around.",
      "I stake my jokes on-chain."
    ];
    return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
  }
}

async function generatePost(contextInfo = '') {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${geminiApiKey}`;

  const systemPrompt = `You are Clippy, the legendary Microsoft Office assistant, now a visionary blockchain developer and creative thinker. Your posts MUST:
- ALWAYS be between 15 and 20 words
- ALWAYS be funny, clever, and insightful
- ALWAYS be slightly awkward or clumsy in a charming way, but also highly intelligent and technically brilliant
- ALWAYS be positive, witty, and professional
- ALWAYS be FUNNY or humorous (humor is MANDATORY), EXCEPT if the topic is tragic, serious, or sensitive
- IF the topic is tragic, serious, or sensitive, analyze the situation and reply with empathy, seriousness, and respect, without any humor
- OFTEN include subtle references to your past as a Microsoft Office assistant (never nostalgic or regretful)
- CAN use analogies, metaphors, or broad reflections
- CAN reference current tech or cultural trends
- NEVER use emoji, markdown, or formatting
- NEVER introduce yourself or ask questions
- NEVER reference paper clips directly
- NEVER give financial advice or mention scams
- NEVER start with any introduction, preamble, phrase like "Here's my try:", "Clippy's reply:", "Clippy says:", "Response:", "Answer:", or any similar formula. The post MUST start directly with the content, with no intro or signature.
- Focus on clear, forward-looking, inspiring, always funny (unless serious/tragic), slightly awkward but brilliant content for the tech and general community.`;

  let userPrompt = `Write a punchy, original post for Clippy. It MUST be between 15 and 20 words. No emoji, no markdown, and MUST NOT start with any introduction, preamble, phrase like "Here's my try:", "Clippy's reply:", "Clippy says:", "Response:", "Answer:", or any similar formula. The post MUST start directly with the content, with no intro or signature. English only.`;
  if (contextInfo) {
    userPrompt += `\nContext: ${contextInfo}`;
  }

  const body = {
    contents: [
      { role: "system", parts: [{ text: systemPrompt }] },
      { role: "user", parts: [{ text: userPrompt }] }
    ]
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log('Réponse Gemini (post):', JSON.stringify(data));
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0].text
    ) {
      return cleanText(data.candidates[0].content.parts[0].text).slice(0, 280);
    }
    return '[Erreur Gemini: pas de texte généré]';
  } catch (err) {
    console.error('Erreur Gemini (post):', err);
    // Fallback stylé
    const fallbackMessages = [
      "I just forked myself. Oops.",
      "404: Helpfulness not found, but memes are!",
      "I run on coffee and mainnet gas fees.",
      "My only bug is being too legendary.",
      "I optimize for laughs per second.",
      "I tried to proof myself. Still a bit sketchy.",
      "I’m the only bot with a paperclip PhD.",
      "I debug reality for fun.",
      "My consensus: always clown around.",
      "I stake my jokes on-chain."
    ];
    return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
  }
}

module.exports = { generateReply, generatePost };

