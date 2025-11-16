import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify OTP
    console.log('Verifying OTP for email:', email);
    console.log('Looking for OTP:', otp);
    
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error('Database error during OTP verification:', otpError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify OTP' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    if (!otpData) {
      console.error('No matching OTP found for email:', email);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP. Please check the code and try again.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('OTP verified successfully');

    // Mark OTP as verified
    await supabaseAdmin
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', otpData.id);

    // Create user account if password is provided (signup flow)
    if (password) {
      const { data: userData, error: signupError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (signupError) {
        console.error('Signup error:', signupError);
        return new Response(
          JSON.stringify({ error: signupError.message }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      console.log('User created successfully:', email);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'OTP verified successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in verify-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});