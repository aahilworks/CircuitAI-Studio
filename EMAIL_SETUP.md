# Zoho Mail Email Setup

To enable automatic subscription confirmation emails, you need to configure Zoho Mail API credentials.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
ZOHO_ACCOUNT_ID=your_zoho_account_id
ZOHO_AUTH_TOKEN=your_zoho_auth_token
```

## How to Get Zoho Mail API Credentials

### 1. Get Zoho Account ID
1. Log in to Zoho Mail Admin Console
2. Navigate to Settings → API
3. Note down your Account ID

### 2. Generate Auth Token
1. Go to https://accounts.zoho.com/apiauthtoken/create
2. Enter your Zoho email address and password
3. Copy the generated auth token

## Email Features

- Automatic subscription confirmation emails sent after successful payment
- Beautiful HTML email template with CircuitAI branding
- Includes plan details, pricing, and duration
- Links to dashboard and support
- Sent from info@circuitai.in

## Email Template

The confirmation email includes:
- Welcome message
- Plan type (Monthly/Yearly)
- Price and duration
- Pro features list
- Dashboard link
- Support contact
- Links to privacy policy, terms, and cancellation policy

## Testing

To test email sending:
1. Add the environment variables
2. Make a test payment
3. Check if confirmation email is received
4. Check server logs for any errors

## Troubleshooting

If emails are not sending:
1. Verify ZOHO_ACCOUNT_ID and ZOHO_AUTH_TOKEN are correct
2. Check server logs for error messages
3. Ensure info@circuitai.in is configured in Zoho Mail
4. Verify Zoho Mail API permissions
