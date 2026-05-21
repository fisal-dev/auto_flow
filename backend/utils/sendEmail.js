const nodemailer = require('nodemailer');

/**
 * Sends a HTML email using SMTP configurations specified in the environment variables.
 * Falls back to console log with warnings if email configuration is missing in .env.
 */
const sendEmail = async ({ to, subject, html }) => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('\n======================================================');
    console.warn('[WARNING] SMTP credentials are not configured in backend/.env.');
    console.warn('To send real emails, add EMAIL_USER and EMAIL_PASS to your .env file.');
    console.warn('======================================================\n');
    
    console.log(`[EMAIL SIMULATOR FALLBACK]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Body:\n${html}\n`);
    return { success: false, message: 'Email credentials not configured.' };
  }

  // Create reusable transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465', // 465 is secure TLS, 587 is STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // Avoid blockages from custom networks
    },
    connectionTimeout: 5000, // 5 seconds connection timeout
    greetingTimeout: 5000,   // 5 seconds greeting timeout
    socketTimeout: 5000      // 5 seconds socket timeout
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"AutoFlow Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  // Send mail with defined transport object and a strict 4-second timeout wrapper (to handle DNS or socket hangs)
  const mailPromise = transporter.sendMail(mailOptions);
  
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('SMTP dispatch timed out')), 4000)
  );

  return await Promise.race([mailPromise, timeoutPromise]);
};

module.exports = sendEmail;
