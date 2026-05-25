const nodemailer = require('nodemailer');
const https = require('https');

/**
 * Helper to send email via Resend's REST API using built-in https module
 */
const sendViaResend = (apiKey, payload) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, messageId: parsed.id });
          } else {
            resolve({ success: false, message: parsed.message || `HTTP ${res.statusCode}` });
          }
        } catch (e) {
          resolve({ success: false, message: `Failed to parse response: ${body}` });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, message: err.message });
    });

    req.write(data);
    req.end();
  });
};

/**
 * Sends a HTML email using SMTP configurations or Resend REST API depending on environment variables.
 */
const sendEmail = async ({ to, subject, html }) => {
  // 1. Check if Resend API is configured (Highly recommended for hosting environments like Render)
  if (process.env.RESEND_API_KEY) {
    // In Resend onboarding mode, from must be onboarding@resend.dev unless a custom domain is verified
    let fromEmail = 'onboarding@resend.dev';
    if (process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('gmail.com')) {
      fromEmail = process.env.EMAIL_FROM;
    }
    
    return await sendViaResend(process.env.RESEND_API_KEY, {
      from: fromEmail,
      to,
      subject,
      html
    });
  }

  // 2. SMTP Fallback
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('\n======================================================');
    console.warn('[WARNING] SMTP credentials / Resend API are not configured in backend/.env.');
    console.warn('To send real emails, add RESEND_API_KEY or SMTP credentials to your env.');
    console.warn('======================================================\n');
    
    console.log(`[EMAIL SIMULATOR FALLBACK]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Body:\n${html}\n`);
    return { success: false, message: 'Email credentials not configured.' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"AutoFlow Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const mailPromise = transporter.sendMail(mailOptions);
  
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('SMTP dispatch timed out')), 4000)
  );

  return await Promise.race([mailPromise, timeoutPromise]);
};

module.exports = sendEmail;
