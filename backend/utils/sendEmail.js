const nodemailer = require('nodemailer');
const https = require('https');

/**
 * Helper to send email via Brevo's REST API using built-in https module
 */
const sendViaBrevo = (apiKey, senderName, senderEmail, to, subject, html) => {
  return new Promise((resolve, reject) => {
    const payload = {
      sender: {
        name: senderName || 'AutoFlow Support',
        email: senderEmail || 'fisalkhan.dev@gmail.com'
      },
      to: [
        {
          email: to
        }
      ],
      subject: subject,
      htmlContent: html
    };

    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, messageId: parsed.messageId });
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
 * Sends a HTML email using SMTP configurations or Resend/Brevo REST APIs depending on environment variables.
 */
const sendEmail = async ({ to, subject, html }) => {
  // 1. Check if Brevo API is configured (Highly recommended for hosting environments like Render, allows sending to all)
  if (process.env.BREVO_API_KEY) {
    let senderName = 'AutoFlow Support';
    let senderEmail = 'fisalkhan.dev@gmail.com';
    if (process.env.EMAIL_FROM) {
      const match = process.env.EMAIL_FROM.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
      if (match) {
        if (match[1]) senderName = match[1].trim();
        senderEmail = match[2].trim();
      }
    }
    
    return await sendViaBrevo(process.env.BREVO_API_KEY, senderName, senderEmail, to, subject, html);
  }

  // 2. Check if Resend API is configured (SMTP fallback, sandbox restriction exists if domain is unverified)
  if (process.env.RESEND_API_KEY) {
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

  // 3. SMTP Fallback
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('\n======================================================');
    console.warn('[WARNING] SMTP credentials / Brevo / Resend APIs are not configured in backend/.env.');
    console.warn('To send real emails, add BREVO_API_KEY, RESEND_API_KEY or SMTP credentials.');
    console.warn('======================================================\n');
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
