import { supabase } from "@/integrations/supabase/client";

export type AIAction = 
  | "chat"
  | "summarize" 
  | "categorize" 
  | "generate-title" 
  | "generate-password" 
  | "draft-email" 
  | "draft-message" 
  | "analyze-password"
  | "smart-search"
  | "detect-duplicates";

interface AIRequestParams {
  action: AIAction;
  content?: string;
  messages?: { role: string; content: string }[];
  provider?: string;
  systemPrompt?: string;
}

export const callAI = async (params: AIRequestParams): Promise<{ content: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke("ai-proxy", {
      body: params,
    });

    if (error) {
      console.error("AI function error:", error);
      return { content: "", error: error.message || "AI request failed" };
    }

    if (data?.error) {
      return { content: "", error: data.error };
    }

    return { content: data?.content || "" };
  } catch (err: any) {
    console.error("AI call error:", err);
    return { content: "", error: err.message || "Failed to call AI" };
  }
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

type Msg = { role: "user" | "assistant"; content: string };

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}) {
  const session = (await supabase.auth.getSession()).data.session;
  if (!session) {
    onError?.("Not authenticated");
    return;
  }

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError?.(data.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError?.("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

export const checkAIConfigured = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from("user_api_keys")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1);

    return (data?.length ?? 0) > 0;
  } catch {
    return false;
  }
};
