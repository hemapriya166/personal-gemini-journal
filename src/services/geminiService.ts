import { ChatMessage, GeminiResponse, ReflectionMode } from '../types';

export async function requestReflection(params: {
  prompt: string;
  title?: string;
  mode?: ReflectionMode;
  history?: ChatMessage[];
}): Promise<GeminiResponse> {
  const response = await fetch('/api/reflect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: params.prompt,
      title: params.title,
      mode: params.mode || 'reflect',
      history: params.history || []
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Reflection request failed (${response.status})`);
  }

  return response.json();
}

export async function requestChatReply(params: {
  prompt: string;
  history: ChatMessage[];
  mode?: ReflectionMode;
}): Promise<{ reply: string; modelUsed: string }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: params.prompt,
      history: params.history,
      mode: params.mode
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Chat continuation failed (${response.status})`);
  }

  return response.json();
}
