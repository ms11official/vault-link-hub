import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, categoryId, newPassword, isDefaultCategory } = await req.json();
    console.log(`Verification request - email: ${email}, categoryId: ${categoryId}, isDefaultCategory: ${isDefaultCategory}`);

    if (!email || !otp || !categoryId || !newPassword || isDefaultCategory === undefined) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') || ''
    );

    if (userError || !user) {
      console.error("User authentication failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('category_otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('category_id', categoryId)
      .eq('user_id', user.id)
      .eq('is_default_category', isDefaultCategory)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (otpError) {
      console.error("OTP query error:", otpError);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!otpRecord) {
      console.error("Invalid or expired OTP");
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as verified
    await supabase
      .from('category_otp_verifications')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Update password based on category type
    if (isDefaultCategory) {
      // Update user_category_settings for default categories
      const { data: existingSetting } = await supabase
        .from('user_category_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('category_type', categoryId)
        .maybeSingle();

      if (existingSetting) {
        await supabase
          .from('user_category_settings')
          .update({ password: newPassword })
          .eq('id', existingSetting.id);
      } else {
        await supabase
          .from('user_category_settings')
          .insert({
            user_id: user.id,
            category_type: categoryId,
            password: newPassword
          });
      }
    } else {
      // Update categories table for custom categories
      await supabase
        .from('categories')
        .update({ password: newPassword })
        .eq('id', categoryId)
        .eq('user_id', user.id);
    }

    console.log("Password reset successfully");
    return new Response(
      JSON.stringify({ message: "Password reset successfully" }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in verify-category-password-otp:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
