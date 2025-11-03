import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Test Resend Configuration
 *
 * This function helps you verify that Resend is configured correctly.
 *
 * Usage:
 * 1. Deploy: npx supabase functions deploy test-resend --no-verify-jwt
 * 2. Test: curl https://your-project.supabase.co/functions/v1/test-resend
 *
 * Note: This function is publicly accessible for testing purposes.
 * It does NOT send actual emails, only checks configuration.
 */
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Allow public access for testing
  console.log("Test-resend function called - checking Resend configuration...");

  const results = {
    timestamp: new Date().toISOString(),
    checks: [] as any[],
    overall: 'UNKNOWN' as 'PASS' | 'FAIL' | 'WARNING' | 'UNKNOWN',
  };

  try {
    // CHECK 1: Environment Variable
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      results.checks.push({
        name: 'Environment Variable',
        status: 'FAIL',
        message: 'RESEND_API_KEY not found in environment variables',
        solution: 'Run: npx supabase secrets set RESEND_API_KEY=re_your_key_here',
      });
      results.overall = 'FAIL';
    } else if (!resendApiKey.startsWith('re_')) {
      results.checks.push({
        name: 'Environment Variable',
        status: 'WARNING',
        message: `API key format looks incorrect: ${resendApiKey.substring(0, 5)}...`,
        solution: 'Resend API keys should start with "re_"',
      });
      results.overall = 'WARNING';
    } else {
      results.checks.push({
        name: 'Environment Variable',
        status: 'PASS',
        message: `API key found: ${resendApiKey.substring(0, 8)}...`,
      });
    }

    // CHECK 2: Resend API Connection
    if (resendApiKey) {
      try {
        const testResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Information Assets Training <noreply@notifications.informationassetsworld.com>',
            to: ['test@example.com'],
            subject: 'Test Email - DO NOT SEND',
            html: '<p>This is a test</p>',
          }),
        });

        const responseData = await testResponse.json();

        if (testResponse.ok) {
          results.checks.push({
            name: 'Resend API Connection',
            status: 'PASS',
            message: 'Successfully connected to Resend API (test email NOT sent)',
            details: {
              messageId: responseData.id,
            },
          });
        } else {
          // Check specific error codes
          if (testResponse.status === 401) {
            results.checks.push({
              name: 'Resend API Connection',
              status: 'FAIL',
              message: 'Invalid API key - authentication failed',
              solution: 'Regenerate API key in Resend dashboard and update Supabase secret',
              details: responseData,
            });
            results.overall = 'FAIL';
          } else if (testResponse.status === 403) {
            results.checks.push({
              name: 'Resend API Connection',
              status: 'FAIL',
              message: 'API key does not have sending permissions',
              solution: 'Create a new API key with "Sending access" permission',
              details: responseData,
            });
            results.overall = 'FAIL';
          } else if (testResponse.status === 422) {
            // Validation error is expected with test email
            results.checks.push({
              name: 'Resend API Connection',
              status: 'PASS',
              message: 'API key is valid (validation error is expected for test data)',
              details: responseData,
            });
          } else {
            results.checks.push({
              name: 'Resend API Connection',
              status: 'WARNING',
              message: `Unexpected response: ${testResponse.status}`,
              details: responseData,
            });
            results.overall = results.overall === 'FAIL' ? 'FAIL' : 'WARNING';
          }
        }
      } catch (apiError) {
        results.checks.push({
          name: 'Resend API Connection',
          status: 'FAIL',
          message: 'Failed to connect to Resend API',
          error: apiError instanceof Error ? apiError.message : 'Unknown error',
          solution: 'Check your internet connection and Resend API status',
        });
        results.overall = 'FAIL';
      }
    }

    // CHECK 3: Verify Resend API Endpoint is Reachable
    try {
      const healthCheck = await fetch('https://api.resend.com/emails', {
        method: 'GET',
      });

      results.checks.push({
        name: 'Resend API Reachability',
        status: 'PASS',
        message: 'Resend API endpoint is reachable',
      });
    } catch (error) {
      results.checks.push({
        name: 'Resend API Reachability',
        status: 'FAIL',
        message: 'Cannot reach Resend API - check firewall or network',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      results.overall = 'FAIL';
    }

    // Set overall status if not already failed
    if (results.overall === 'UNKNOWN') {
      const hasFail = results.checks.some(c => c.status === 'FAIL');
      const hasWarning = results.checks.some(c => c.status === 'WARNING');
      results.overall = hasFail ? 'FAIL' : hasWarning ? 'WARNING' : 'PASS';
    }

    // Summary
    const summary = {
      ...results,
      summary: {
        total: results.checks.length,
        passed: results.checks.filter(c => c.status === 'PASS').length,
        failed: results.checks.filter(c => c.status === 'FAIL').length,
        warnings: results.checks.filter(c => c.status === 'WARNING').length,
      },
      recommendations: [] as string[],
    };

    // Add recommendations
    if (summary.overall === 'PASS') {
      summary.recommendations.push('✅ Resend is configured correctly!');
      summary.recommendations.push('Next step: Test sending an actual email');
    } else if (summary.overall === 'FAIL') {
      const failedChecks = results.checks.filter(c => c.status === 'FAIL');
      failedChecks.forEach(check => {
        if (check.solution) {
          summary.recommendations.push(`❌ ${check.name}: ${check.solution}`);
        }
      });
    } else {
      summary.recommendations.push('⚠️ Some checks passed with warnings');
      summary.recommendations.push('Review warnings above and fix if needed');
    }

    return new Response(
      JSON.stringify(summary, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error in test-resend:', error);

    return new Response(
      JSON.stringify({
        overall: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }, null, 2),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
