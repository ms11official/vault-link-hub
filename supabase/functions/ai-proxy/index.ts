import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROVIDER_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
};

const DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o-mini",
  gemini: "gemini-2.0-flash",
  anthropic: "claude-3-5-haiku-latest",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { action, messages, content, provider: preferredProvider, systemPrompt, tools, tool_choice } = await req.json();

    // Get user's active API key
    const { data: keys, error: keysError } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (keysError) throw new Error("Failed to fetch API keys");

    // Find preferred provider or first available
    let selectedKey = preferredProvider
      ? keys?.find((k: any) => k.provider === preferredProvider)
      : keys?.[0];

    if (!selectedKey) {
      return new Response(
        JSON.stringify({ error: "No API key configured. Please add one in Settings > AI Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const provider = selectedKey.provider;
    const apiKey = selectedKey.api_key;
    const model = DEFAULT_MODELS[provider];

    // Build messages based on action
    let finalMessages = messages || [];
    if (systemPrompt) {
      finalMessages = [{ role: "system", content: systemPrompt }, ...finalMessages];
    }

    if (action === "summarize" && content) {
      finalMessages = [
        { role: "system", content: "You are a helpful assistant. Provide clear, concise summaries." },
        { role: "user", content: `Summarize the following content:\n\n${content}` },
      ];
    } else if (action === "categorize" && content) {
      finalMessages = [
        { role: "system", content: "You are a categorization expert. Analyze the given content and suggest the best category and tags." },
        { role: "user", content: `Analyze and categorize this item:\nTitle: ${content.title}\nContent: ${content.body}\n\nRespond with JSON: {"category": "suggested category", "tags": ["tag1", "tag2"], "reason": "brief reason"}` },
      ];
    } else if (action === "generate-title" && content) {
      finalMessages = [
        { role: "system", content: "Generate a concise, descriptive title for the given content. Return only the title, nothing else." },
        { role: "user", content: content },
      ];
    } else if (action === "generate-password") {
      finalMessages = [
        { role: "system", content: "Generate a strong, secure password. Return only the password, nothing else. Make it 16-20 characters with uppercase, lowercase, numbers, and special characters." },
        { role: "user", content: "Generate a strong password" },
      ];
    } else if (action === "draft-email" && content) {
      finalMessages = [
        { role: "system", content: "You are an email drafting assistant. Write professional, clear emails." },
        { role: "user", content: `Draft an email about: ${content}` },
      ];
    } else if (action === "draft-message" && content) {
      finalMessages = [
        { role: "system", content: "You are a message drafting assistant. Write clear, concise messages." },
        { role: "user", content: `Draft a message about: ${content}` },
      ];
    } else if (action === "analyze-password" && content) {
      finalMessages = [
        { role: "system", content: "You are a password security expert. Analyze the password strength and provide improvement tips. Do NOT reveal the actual password in your response." },
        { role: "user", content: `Analyze password strength (${content.length} characters): contains uppercase: ${/[A-Z]/.test(content)}, lowercase: ${/[a-z]/.test(content)}, numbers: ${/\d/.test(content)}, special chars: ${/[^A-Za-z0-9]/.test(content)}` },
      ];
    } else if (action === "smart-search" && content) {
      finalMessages = [
        { role: "system", content: "You are a search assistant. Given a natural language query and a list of items, return the IDs of matching items as a JSON array. Consider semantic meaning, not just keyword matching. Return: {\"ids\": [\"id1\", \"id2\"]}" },
        { role: "user", content: content },
      ];
    } else if (action === "detect-duplicates" && content) {
      finalMessages = [
        { role: "system", content: "You are a deduplication assistant. Analyze the given items and find potential duplicates or very similar entries. Return JSON: {\"groups\": [[\"id1\", \"id2\"], [\"id3\", \"id4\"]], \"summary\": \"brief description\"}" },
        { role: "user", content: content },
      ];
    }

    // Call AI provider
    if (provider === "anthropic") {
      const sysMsg = finalMessages.find((m: any) => m.role === "system");
      const otherMsgs = finalMessages.filter((m: any) => m.role !== "system");
      
      const body: any = {
        model: "claude-3-5-haiku-latest",
        max_tokens: 1024,
        messages: otherMsgs,
      };
      if (sysMsg) body.system = sysMsg.content;

      const response = await fetch(PROVIDER_URLS.anthropic, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Anthropic API error:", response.status, errText);
        return new Response(
          JSON.stringify({ error: `AI provider error (${response.status}): ${errText}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      return new Response(
        JSON.stringify({ content: data.content?.[0]?.text || "", provider }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // OpenAI-compatible (OpenAI and Gemini)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (provider === "gemini") {
        headers["Authorization"] = `Bearer ${apiKey}`;
      } else {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const body: any = {
        model,
        messages: finalMessages,
        max_tokens: 1024,
      };
      if (tools) body.tools = tools;
      if (tool_choice) body.tool_choice = tool_choice;

      const response = await fetch(PROVIDER_URLS[provider], {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`${provider} API error:`, response.status, errText);
        return new Response(
          JSON.stringify({ error: `AI provider error (${response.status}): ${errText}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const responseContent = data.choices?.[0]?.message?.content || "";
      const toolCalls = data.choices?.[0]?.message?.tool_calls;

      return new Response(
        JSON.stringify({ content: responseContent, provider, tool_calls: toolCalls }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("ai-proxy error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
