# Send Test Email to waweru08@gmail.com
# This script submits a test lead which triggers the automated email system

$testData = @{
    full_name = "Test User from Email System"
    email = "waweru08@gmail.com"
    phone = "+254712345678"
    organization = "Test Organization"
    country = "Kenya"
    event_id = "REPLACE_WITH_REAL_EVENT_ID"  # You'll need to get this from the form
    inquiry_type = "send_writeup"  # Options: send_writeup, contact_discuss, register_now, group_registration, corporate_training, just_browsing
    source = "Email Test Script"
    message = "This is a test email from the automated email system."
    captchaToken = "TEST_BYPASS"
}

$body = $testData | ConvertTo-Json
$uri = "https://gppohyyuggnfecfabcyz.supabase.co/functions/v1/submit-lead"

Write-Host "Sending test email to: waweru08@gmail.com" -ForegroundColor Cyan
Write-Host "Inquiry Type: send_writeup (Event Details Email)" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "application/json"

    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Reference Number: $($response.referenceNumber)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Check email inbox: waweru08@gmail.com" -ForegroundColor White
    Write-Host "2. Email should arrive within 30 seconds" -ForegroundColor White
    Write-Host "3. Check spam folder if not in inbox" -ForegroundColor White
    Write-Host ""
    Write-Host "Email Template: Send Event Writeup" -ForegroundColor Yellow
    Write-Host "- Event details card" -ForegroundColor White
    Write-Host "- Reference number" -ForegroundColor White
    Write-Host "- Professional HTML design" -ForegroundColor White
} catch {
    Write-Host "❌ ERROR" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "NOTE: You need to replace 'REPLACE_WITH_REAL_EVENT_ID' with an actual event UUID" -ForegroundColor Yellow
    Write-Host "Get the event ID by:" -ForegroundColor Yellow
    Write-Host "1. Open: http://localhost:8080/register-interest" -ForegroundColor White
    Write-Host "2. Open browser console (F12)" -ForegroundColor White
    Write-Host "3. Select an event from dropdown" -ForegroundColor White
    Write-Host "4. Check the console for event details or inspect form data" -ForegroundColor White
}
