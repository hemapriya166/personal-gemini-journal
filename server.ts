import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const app = express();

// 1. TOP-LEVEL REQUEST DESERIALIZATION (Ordering Guarantee)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Gemini SDK Lazy Initialization with Secret Verification
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// 2. RESILIENT MODEL FALLBACK LADDER
const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',       // Primary high-efficiency model
  'gemini-3.1-flash-lite',  // High-availability fallback
  'gemini-flash-latest',    // Dynamic platform alias
  'gemini-3.7-flash'        // Deep reasoning fallback
];

/**
 * Executes content generation with automated fallback ladder and error recovery
 */
async function generateContentWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  config?: any;
}): Promise<{ text: string; modelUsed: string }> {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          ...(params.config || {})
        }
      });

      const text = response.text || '';
      return { text, modelUsed: model };
    } catch (error: any) {
      console.warn(`[Gemini Fallback] Model ${model} failed with error:`, error?.message || error);
      lastError = error;

      // Extract error code/status if available
      const status = error?.status || error?.code || (error?.message?.includes('503') ? 503 : error?.message?.includes('429') ? 429 : 500);
      const recoverableStatuses = [503, 429, 404, 500, 'UNAVAILABLE', 'RESOURCE_EXHAUSTED', 'NOT_FOUND', 'INTERNAL'];

      const isRecoverable = recoverableStatuses.some(s => 
        status === s || (typeof error?.message === 'string' && error.message.includes(String(s)))
      );

      if (!isRecoverable && model === MODEL_FALLBACK_LADDER[0]) {
        // If it's a non-recoverable error but first model, still attempt next model just in case of model unavailability
        continue;
      }
      // Continue to next model in ladder
    }
  }

  throw new Error(`All Gemini models in the fallback ladder failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// 3. API ENDPOINTS

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Primary reflection generation endpoint
app.post('/api/reflect', async (req, res) => {
  try {
    // Defensive Payload Ingestion (Null-Safe Destructuring)
    const data = (req.body && typeof req.body === 'object') ? req.body : {};
    const prompt = typeof data.prompt === 'string' ? data.prompt.trim() : '';
    const mode = typeof data.mode === 'string' ? data.mode : 'reflect';
    const title = typeof data.title === 'string' ? data.title : '';
    const rawHistory = Array.isArray(data.history) ? data.history : [];

    if (!prompt) {
      return res.status(400).json({ error: 'Journal prompt or reflection content is required.' });
    }

    // System instructions based on selected reflection mode
    let systemInstruction = `You are ReflectAI, an insightful, compassionate, and intellectually grounded reflection partner and journaling assistant.
Your goal is to help the user unpack their thoughts, gain clarity, identify emotional undercurrents, and foster personal growth.
Format your responses using clean Markdown with structured paragraphs, clear bullet points when analyzing, and thoughtful framing. Avoid shallow clichés or generic platitudes.`;

    if (mode === 'summarize') {
      systemInstruction += `\nMode: "Summary & Actionable Takeaways".
Provide:
1. **Core Theme & Executive Summary** (2-3 crisp sentences)
2. **Key Insights & Emotional Patterns**
3. **Suggested Action Steps or Practical Next Moves**`;
    } else if (mode === 'brainstorm') {
      systemInstruction += `\nMode: "Brainstorming & Perspectives".
Provide:
1. **Alternative Angles & Unconsidered Perspectives**
2. **Creative Hypotheses & Possibilities**
3. **Thought Experiments to Expand Horizons**`;
    } else if (mode === 'socratic') {
      systemInstruction += `\nMode: "Socratic Inquiry".
Gently challenge assumptions and pose 2-3 deep, precise questions that prompt self-discovery without being confrontational.`;
    } else {
      systemInstruction += `\nMode: "Empathetic Reflection & Growth".
Provide thoughtful validation, identify strengths demonstrated in the user's reflection, and offer a constructive reframe or forward-looking perspective.`;
    }

    // Prepare multi-turn contents format
    const contents: any[] = [];
    
    // Add existing conversation history if multi-turn
    for (const msg of rawHistory) {
      if (msg && typeof msg.content === 'string') {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Append current prompt
    const userPromptWithContext = title ? `[Entry Title: ${title}]\n\n${prompt}` : prompt;
    contents.push({
      role: 'user',
      parts: [{ text: userPromptWithContext }]
    });

    const result = await generateContentWithFallback({
      contents,
      systemInstruction
    });

    // Optionally generate a quick 1-line key takeaway summary if in reflect/summarize mode
    let summary: string | undefined = undefined;
    let insights: string[] = [];

    try {
      const summaryResult = await generateContentWithFallback({
        contents: [
          {
            role: 'user',
            parts: [{
              text: `Summarize this journal entry in one succinct sentence (max 20 words) capturing the main essence:\n\n"${prompt}"`
            }]
          }
        ],
        config: { maxOutputTokens: 60 }
      });
      summary = summaryResult.text.replace(/^["']|["']$/g, '').trim();
    } catch (e) {
      console.warn('Quick summary generation skipped:', e);
    }

    res.json({
      reply: result.text,
      summary,
      insights,
      modelUsed: result.modelUsed
    });
  } catch (error: any) {
    console.error('Error in /api/reflect:', error);
    res.status(500).json({ 
      error: error?.message || 'Failed to generate reflection with Gemini API.',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Multi-turn conversational continuation endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const data = (req.body && typeof req.body === 'object') ? req.body : {};
    const prompt = typeof data.prompt === 'string' ? data.prompt.trim() : '';
    const rawHistory = Array.isArray(data.history) ? data.history : [];

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const systemInstruction = `You are ReflectAI, continuing an active reflection dialogue with the user.
Maintain context of previous messages, respond thoughtfully, and encourage deeper exploration.`;

    const contents: any[] = [];
    for (const msg of rawHistory) {
      if (msg && typeof msg.content === 'string') {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const result = await generateContentWithFallback({
      contents,
      systemInstruction
    });

    res.json({
      reply: result.text,
      modelUsed: result.modelUsed
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ 
      error: error?.message || 'Failed to continue reflection dialogue with Gemini API.' 
    });
  }
});

// 4. VITE MIDDLEWARE & STATIC HOSTING
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
