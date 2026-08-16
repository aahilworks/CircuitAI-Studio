interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('Zoho OAuth credentials not configured');
    return null;
  }

  // Check if token is still valid (with 5 minute buffer)
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return accessToken;
  }

  try {
    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to refresh Zoho access token:', error);
      return null;
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Zoho access token:', error);
    return null;
  }
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { to, subject, html, text } = options;

    const token = await getAccessToken();
    if (!token) {
      console.error('Failed to get Zoho access token');
      return false;
    }

    const zohoAccountId = process.env.ZOHO_ACCOUNT_ID;
    if (!zohoAccountId) {
      console.error('Zoho Account ID not configured');
      return false;
    }

    const response = await fetch(
      `https://mail.zoho.com/api/accounts/${zohoAccountId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromAddress: 'info@circuitai.in',
          toAddress: to,
          subject: subject,
          content: html,
          format: 'html',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send email via Zoho:', error);
      return false;
    }

    console.log('Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function generateSubscriptionConfirmationEmail(
  userEmail: string,
  billingCycle: 'monthly' | 'yearly',
  price: string
): { subject: string; html: string } {
  const isYearly = billingCycle === 'yearly';
  const period = isYearly ? '1 year' : '12 months';
  const planType = isYearly ? 'Yearly One-Time Payment' : 'Monthly Subscription';

  const subject = `CircuitAI Pro Subscription Confirmed - ${planType}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Subscription Confirmation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #09090b;
          color: #fafafa;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #18181b;
          border-radius: 12px;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          padding: 30px;
        }
        .welcome {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .details {
          background-color: #27272a;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #3f3f46;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .label {
          color: #a1a1aa;
          font-size: 14px;
        }
        .value {
          color: #fafafa;
          font-weight: 600;
          font-size: 14px;
        }
        .cta-button {
          display: inline-block;
          background-color: #14b8a6;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          background-color: #27272a;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #71717a;
        }
        .footer a {
          color: #14b8a6;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to CircuitAI Pro!</h1>
        </div>
        <div class="content">
          <p class="welcome">Hi there,</p>
          <p>Thank you for subscribing to CircuitAI Pro! Your payment has been successfully processed and your Pro access is now active.</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Plan Type</span>
              <span class="value">${planType}</span>
            </div>
            <div class="detail-row">
              <span class="label">Price</span>
              <span class="value">₹${price}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration</span>
              <span class="value">${period}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email</span>
              <span class="value">${userEmail}</span>
            </div>
          </div>

          <p>You can now enjoy:</p>
          <ul>
            <li>✨ Unlimited AI project generation</li>
            <li>📦 Unlimited saved projects</li>
            <li>🔧 Advanced circuit diagrams</li>
            <li>📝 Complete documentation</li>
            <li>🎓 Educational resources</li>
          </ul>

          <a href="https://www.circuitai.in/dashboard" class="cta-button">Go to Dashboard</a>

          <p style="font-size: 14px; color: #a1a1aa;">
            Need help? Contact us at <a href="mailto:techokids123@gmail.com" style="color: #14b8a6;">techokids123@gmail.com</a>
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 CircuitAI. All rights reserved.</p>
          <p>
            <a href="https://www.circuitai.in/privacy">Privacy Policy</a> | 
            <a href="https://www.circuitai.in/terms">Terms of Service</a> | 
            <a href="https://www.circuitai.in/cancellation-refund">Cancellation & Refund</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
