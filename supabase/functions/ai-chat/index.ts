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

    const { messages } = await req.json();

    // Get user's active API key
    const { data: keys } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const selectedKey = keys?.[0];
    if (!selectedKey) {
      return new Response(
        JSON.stringify({ error: "No API key configured. Add one in Profile > AI Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user's items for context
    const { data: items } = await supabase
      .from("items")
      .select("id, title, type, content, created_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50);

    const itemContext = items?.map(i => `[${i.type}] ${i.title}: ${i.content?.substring(0, 100)}`).join("\n") || "No items";

    const provider = selectedKey.provider;
    const apiKey = selectedKey.api_key;
    const model = DEFAULT_MODELS[provider];

    const systemPrompt = `You are Databseplus AI Assistant. You help users manage their stored items (links, emails, messages, passwords, contacts, web URLs). You have access to the user's items for context.

User's recent items:
${itemContext}

Be helpful, concise, and security-conscious. Never reveal passwords in full. Help with organizing, searching, and managing their vault.`;

    const allMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    if (provider === "anthropic") {
      const otherMsgs = allMessages.filter((m: any) => m.role !== "system");
      const response = await fetch(PROVIDER_URLS.anthropic, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-latest",
          max_tokens: 1024,
          system: systemPrompt,
          messages: otherMsgs,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return new Response(
          JSON.stringify({ error: `AI error (${response.status}): ${errText}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } else {
      const response = await fetch(PROVIDER_URLS[provider], {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: allMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return new Response(
          JSON.stringify({ error: `AI error (${response.status}): ${errText}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }
  } catch (error) {
    console.error("ai-chat error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
