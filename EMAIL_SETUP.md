# Zoho Mail Email Setup

To enable automatic subscription confirmation emails, you need to configure Zoho Mail OAuth 2.0 credentials.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
ZOHO_CLIENT_ID=1000.J4SLY3058V4P4U14BMHRDUDG1OBJ7S
ZOHO_CLIENT_SECRET=99d400fd0dab5251066d74e4b0cebfb3a698ae00c6
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
ZOHO_ACCOUNT_ID=your_zoho_account_id
```

## How to Get Zoho Mail OAuth 2.0 Credentials

### 1. Get Client ID and Client Secret
You already have these from creating your server-based client:
- Client ID: 1000.J4SLY3058V4P4U14BMHRDUDG1OBJ7S
- Client Secret: 99d400fd0dab5251066d74e4b0cebfb3a698ae00c6

### 2. Generate Refresh Token
1. Visit this URL in your browser (replace with your actual client ID):
   ```
   https://accounts.zoho.com/oauth/v2/auth?scope=ZohoMail.messages.CREATE,ZohoMail.accounts.READ&client_id=1000.J4SLY3058V4P4U14BMHRDUDG1OBJ7S&response_type=code&redirect_uri=https://www.circuitai.in&access_type=offline
   ```

2. Authorize the application when prompted

3. You'll be redirected to your redirect URL with a code parameter

4. Use the code to generate refresh token:
   ```bash
   curl -X POST https://accounts.zoho.com/oauth/v2/token \
     -d "grant_type=authorization_code" \
     -d "client_id=1000.J4SLY3058V4P4U14BMHRDUDG1OBJ7S" \
     -d "client_secret=99d400fd0dab5251066d74e4b0cebfb3a698ae00c6" \
     -d "redirect_uri=https://www.circuitai.in" \
     -d "code=YOUR_CODE_FROM_REDIRECT"
   ```

5. Copy the `refresh_token` from the response

### 3. Get Zoho Account ID
1. Log in to Zoho Mail Admin Console
2. Navigate to Settings → API
3. Note down your Account ID

## Email Features

- Automatic subscription confirmation emails sent after successful payment
- Beautiful HTML email template with CircuitAI branding
- Includes plan details, pricing, and duration
- Links to dashboard and support
- Sent from info@circuitai.in
- OAuth 2.0 with automatic token refresh

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
1. Add all environment variables to `.env.local`
2. Make a test payment
3. Check if confirmation email is received
4. Check server logs for any errors

## Troubleshooting

If emails are not sending:
1. Verify all environment variables are correct
2. Ensure refresh token is valid (not expired)
3. Check server logs for error messages
4. Ensure info@circuitai.in is configured in Zoho Mail
5. Verify Zoho Mail API permissions include message creation
6. Check that OAuth scopes are correct (ZohoMail.messages.CREATE, ZohoMail.accounts.READ)

## Security Notes

- Never commit `.env.local` to version control
- Client secret and refresh token are sensitive
- Access tokens are automatically refreshed when expired
- Tokens are cached in memory for performance
