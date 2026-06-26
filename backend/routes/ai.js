const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Apply authentication middleware
router.use(authMiddleware);

// Helper to construct model prompts
function getPrompt(type, text, promptType) {
  let prompt = '';
  const cleanText = text.trim();

  switch (type) {
    case 'summary':
      if (promptType === 'shorten') {
        prompt = `You are a professional resume writer. Shorten this professional summary to make it highly concise and impactful (aim for 1-2 sentences). Return ONLY the shortened summary. Do not include conversational text, quotes, or introductions.\n\nSummary:\n"${cleanText}"`;
      } else if (promptType === 'professional') {
        prompt = `You are a professional resume writer. Rewrite this professional summary to make it highly professional, polished, and structured. Return ONLY the polished summary. Do not include conversational text, quotes, or introductions.\n\nSummary:\n"${cleanText}"`;
      } else {
        prompt = `You are a professional resume writer. Enhance this professional summary to make it compelling, action-oriented, and tailored for an ATS. Return ONLY the enhanced summary. Do not include conversational text, quotes, or introductions.\n\nSummary:\n"${cleanText}"`;
      }
      break;
    case 'experience':
      if (promptType === 'bullets') {
        prompt = `You are a professional resume writer. Convert the following job description or experience text into 3-4 professional, action-oriented bullet points. Start each bullet point with a strong action verb (e.g., Developed, Optimized, Collaborated, Initiated). Do not use placeholders. Return ONLY the bullet points, each on a new line starting with "• ". Do not include conversational text, greetings, headers, or quotes.\n\nExperience text:\n"${cleanText}"`;
      } else if (promptType === 'professional') {
        prompt = `You are a professional resume writer. Rewrite this job experience description to use extremely professional, polished, and formal language. Return ONLY the rewritten description. Do not include conversational text, greetings, or quotes.\n\nDescription:\n"${cleanText}"`;
      } else {
        prompt = `You are a professional resume writer. Enhance this job experience description to make it action-oriented, clear, and impactful. Return ONLY the enhanced description. Do not include conversational text, greetings, or quotes.\n\nDescription:\n"${cleanText}"`;
      }
      break;
    case 'project':
      if (promptType === 'bullets') {
        prompt = `You are a professional resume writer. Convert the following project description into 3-4 professional, action-oriented bullet points. Start each bullet point with a strong action verb (e.g., Developed, Optimized, Built, Implemented). Do not use placeholders. Return ONLY the bullet points, each on a new line starting with "• ". Do not include conversational text, greetings, headers, or quotes.\n\nProject description:\n"${cleanText}"`;
      } else if (promptType === 'tech') {
        prompt = `You are a professional resume writer. Enhance this project description to emphasize technical implementation, architecture, and tools used. Make it sound highly technical and structured. Return ONLY the enhanced description. Do not include conversational text, greetings, or quotes.\n\nProject description:\n"${cleanText}"`;
      } else {
        prompt = `You are a professional resume writer. Enhance this project description to highlight achievements, metrics, and key features. Return ONLY the enhanced description. Do not include conversational text, greetings, or quotes.\n\nProject description:\n"${cleanText}"`;
      }
      break;
    default:
      prompt = `You are a professional resume writer. Improve this text to be more appropriate for a professional resume: "${cleanText}". Return ONLY the improved text. Do not include conversational text, greetings, or quotes.`;
  }
  return prompt;
}
function cleanBulletPoints(rawText) {
  const lines = rawText.split('\n');
  const cleanedLines = [];

  const conversationalPhrases = [
    'here is', 'here are', 'sure,', 'okay,', 'sure!', 'hope this helps',
    'let me know', 'would you like', 'to make this', 'tailored to',
    'i can', 'you can', 'feel free', 'designed to', 'aims to'
  ];

  const pronouns = ['i', 'we', 'you', 'he', 'she', 'they', 'it'];

  for (let line of lines) {
    let cleaned = line.trim();
    if (!cleaned) continue;

    // Remove leading bullets (*, -, •, +, etc.) and numbers (1., 1), etc.)
    cleaned = cleaned.replace(/^([*•\-+]+|\d+[.)])\s*/, '').trim();

    // Strip wrapping markdown asterisks or bold/italic indicators
    cleaned = cleaned.replace(/\*\*/g, '');
    cleaned = cleaned.replace(/\*/g, '');
    cleaned = cleaned.trim();

    const lowerCleaned = cleaned.toLowerCase();
    
    // Skip if it ends with question mark or colons with few words
    if (cleaned.endsWith('?') || (cleaned.endsWith(':') && cleaned.split(' ').length < 5)) {
      continue;
    }

    // Skip if it starts with any conversational phrases
    if (conversationalPhrases.some(phrase => lowerCleaned.startsWith(phrase) || lowerCleaned.includes(phrase))) {
      continue;
    }

    // Skip if the first word is a personal pronoun
    const firstWord = lowerCleaned.split(' ')[0];
    if (pronouns.includes(firstWord)) {
      continue;
    }

    if (cleaned.length > 5) {
      cleanedLines.push(`• ${cleaned}`);
    }
  }

  return cleanedLines.join('\n');
}

// POST /api/ai/suggest
router.post('/suggest', async (req, res) => {
  const { type, text, promptType } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Please enter some text first so the AI can help rewrite it.' });
  }

  const prompt = getPrompt(type, text, promptType);
  const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';

  try {
    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        stream: false
      }),
      // Set a short timeout (e.g. 15 seconds) so it doesn't hang indefinitely
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      let errMsg = `Ollama service returned status ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.error) {
          errMsg = errJson.error;
        }
      } catch (e) {}
      throw new Error(errMsg);
    }

    const result = await response.json();
    let generatedText = result.response || '';

    // Simple post-processing clean up
    generatedText = generatedText.trim();
    // Strip wrapping quotes if the model wrapped the output in quotes
    if (generatedText.startsWith('"') && generatedText.endsWith('"')) {
      generatedText = generatedText.substring(1, generatedText.length - 1);
    } else if (generatedText.startsWith("'") && generatedText.endsWith("'")) {
      generatedText = generatedText.substring(1, generatedText.length - 1);
    }

    let suggestion = generatedText.trim();
    if (promptType === 'bullets') {
      suggestion = cleanBulletPoints(suggestion);
    }

    res.json({ suggestion });
  } catch (error) {
    console.error('Ollama communication error:', error);
    
    // Check if it's a network connection issue or timeout
    if (error.name === 'TimeoutError') {
      return res.status(504).json({
        error: 'Ollama request timed out. Please check if your local model is loaded and responding.'
      });
    }

    // Check if it's a model not found error
    if (error.message.includes('not found') || error.message.includes('pull')) {
      return res.status(404).json({
        error: `Ollama error: ${error.message}. Please pull the model first using 'ollama pull ${ollamaModel}' in your terminal.`
      });
    }

    res.status(503).json({
      error: `Failed to connect to local Ollama service. Please make sure Ollama is running locally on your machine (default port 11434) and that you have pulled the configured model '${ollamaModel}' (e.g., by running 'ollama run ${ollamaModel}' in your terminal).`
    });
  }
});

// POST /api/ai/ats-keywords
router.post('/ats-keywords', async (req, res) => {
  const { headline = '', skills = [], experienceText = '', projectText = '' } = req.body;

  const existingSkills = Array.isArray(skills) ? skills.join(', ') : skills;

  const prompt = `You are an expert ATS (Applicant Tracking System) specialist and technical recruiter.

Based on this candidate's resume context:
- Job Headline / Target Role: ${headline || 'Software Engineer'}
- Existing Skills: ${existingSkills || 'None listed'}
- Work Experience Summary: ${experienceText || 'Not provided'}
- Projects Summary: ${projectText || 'Not provided'}

Suggest exactly 12 ATS-friendly skill keywords that this candidate is likely MISSING but should add to strengthen their resume for typical ${headline || 'software engineering'} roles. Focus on tools, technologies, frameworks, methodologies, and industry-standard terms that ATS systems specifically scan for.

Return ONLY a comma-separated list of keywords. No explanations, no numbering, no headers, no extra text whatsoever. Just the keywords separated by commas.`;

  const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';

  try {
    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: ollamaModel, prompt, stream: false }),
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      let errMsg = `Ollama service returned status ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.error) errMsg = errJson.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const result = await response.json();
    let raw = (result.response || '').trim();

    // Strip any wrapping quotes
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      raw = raw.slice(1, -1);
    }

    // Parse comma-separated keywords, clean each one up
    const keywords = raw
      .split(',')
      .map(k => k.trim().replace(/^[-•*\d.]+\s*/, '')) // strip leading bullets/numbers
      .filter(k => k.length > 0 && k.length < 60);     // sanity length check

    res.json({ keywords });
  } catch (error) {
    console.error('Ollama ats-keywords error:', error);

    if (error.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Ollama request timed out. Please check if your local model is loaded and responding.' });
    }
    if (error.message.includes('not found') || error.message.includes('pull')) {
      return res.status(404).json({ error: `Model not found. Run 'ollama pull ${ollamaModel}' first.` });
    }

    res.status(503).json({
      error: `Failed to connect to local Ollama service. Make sure Ollama is running on port 11434 and the model '${ollamaModel}' is pulled.`
    });
  }
});

module.exports = router;
