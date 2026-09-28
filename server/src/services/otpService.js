import axios from 'axios';
import nodemailer from 'nodemailer';

/**
 * Job Finder OTP Authentication Service
 * Supports:
 * 1. Custom SMS / OTP Gateways (Fast2SMS, MSG91, Twilio, or generic REST API)
 * 2. Email delivery via Nodemailer / SMTP
 * 3. Terminal & Dev-Simulation fallback with high-visibility dispatch logs
 */
export const otpService = {
  // Generate random 6-digit numeric OTP
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Calculate expiration date (default 10 minutes from now)
  getExpiryDate(minutes = 10) {
    return new Date(Date.now() + minutes * 60 * 1000);
  },

  /**
   * Dispatch OTP to recipient (email and/or phone)
   * @param {Object} options
   * @param {string} options.email - User email
   * @param {string} options.phone - User phone number (optional)
   * @param {string} options.code - 6 digit OTP code
   * @param {string} options.type - 'signup' | 'login' | 'reset'
   * @param {string} options.fullName - User name
   */
  async sendOtp({ email, phone = '', code, type = 'signup', fullName = 'Candidate' }) {
    const purposeText = 
      type === 'signup' ? 'Account Verification' :
      type === 'reset' ? 'Password Reset' : 'Secure Login';

    console.log('\n' + '='.repeat(54));
    console.log(`🔐 [JOB FINDER LIVE OTP DISPATCH]`);
    console.log(`👤 Recipient:  ${fullName} <${email}> ${phone ? `(${phone})` : ''}`);
    console.log(`🎯 Purpose:    ${purposeText}`);
    console.log(`🔑 6-Digit OTP: >>> ${code} <<<`);
    console.log(`⏳ Valid For:  10 Minutes (Expires at: ${new Date(Date.now() + 600000).toLocaleTimeString()})`);
    console.log('='.repeat(54) + '\n');

    const dispatchResults = {
      smsSent: false,
      emailSent: false,
      channel: 'console',
      message: 'OTP generated and logged successfully'
    };

    // 1. Check for Custom SMS / OTP API details in environment variables
    const otpApiUrl = process.env.OTP_API_URL;
    const otpApiKey = process.env.OTP_API_KEY;

    if (otpApiUrl && (phone || email)) {
      try {
        console.log(`📡 Forwarding OTP to custom API: ${otpApiUrl}...`);
        const response = await axios.post(
          otpApiUrl,
          {
            phone,
            email,
            otp: code,
            type,
            template: `Your Job Finder ${purposeText} OTP is ${code}. Valid for 10 minutes.`
          },
          {
            headers: {
              'Authorization': otpApiKey ? `Bearer ${otpApiKey}` : undefined,
              'x-api-key': otpApiKey,
              'Content-Type': 'application/json'
            },
            timeout: 6000
          }
        );
        dispatchResults.smsSent = true;
        dispatchResults.channel = 'custom_api';
        dispatchResults.message = 'OTP sent via external API gateway';
        console.log(' Custom OTP API responded successfully:', response.status);
      } catch (apiErr) {
        console.warn('⚠️ Custom OTP API dispatch failed, falling back to local dispatch:', apiErr.message);
      }
    }

    // 2. Check for Fast2SMS Indian Gateway (if user provides FAST2SMS_API_KEY)
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey && phone) {
      try {
        const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
        console.log(`📱 Sending Fast2SMS OTP to +91 ${cleanPhone}...`);
        const res = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
          variables_values: code,
          route: 'otp',
          numbers: cleanPhone
        }, {
          headers: {
            'authorization': fast2smsKey
          },
          timeout: 7000
        });
        if (res.data?.return) {
          dispatchResults.smsSent = true;
          dispatchResults.channel = 'fast2sms';
          console.log(' Fast2SMS OTP dispatched successfully!');
        }
      } catch (fastErr) {
        console.warn('Fast2SMS dispatch note:', fastErr.message);
      }
    }

    // 3. Dispatch Live Email via Brevo REST API (Fastest & most reliable)
    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'no-reply@careerpilot.com';
    const brevoSenderName = process.env.BREVO_SENDER_NAME || 'CareerPilot India';

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0E1114; color: #FFFFFF; padding: 36px 24px; border-radius: 16px; max-width: 540px; margin: 0 auto; border: 1px solid #1E293B;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #10B981; color: #FFFFFF; font-weight: 800; font-size: 20px; padding: 8px 18px; border-radius: 10px; letter-spacing: -0.5px;">
            CareerPilot PRO
          </div>
          <div style="font-size: 13px; color: #94A3B8; margin-top: 6px;">India Tech Career & ATS Platform</div>
        </div>

        <div style="background-color: #141920; border: 1px solid #334155; border-radius: 12px; padding: 24px; text-align: center;">
          <h3 style="color: #FFFFFF; margin-top: 0; font-size: 18px;">${purposeText}</h3>
          <p style="color: #94A3B8; font-size: 14px; margin-bottom: 20px;">
            Hi ${fullName}, use the 6-digit one-time password below to authenticate your account.
          </p>

          <div style="background-color: #0E1114; border: 2px dashed #10B981; border-radius: 10px; padding: 18px; display: inline-block; margin: 0 auto 16px auto;">
            <span style="font-family: monospace; font-size: 38px; letter-spacing: 12px; font-weight: 800; color: #10B981; margin-left: 12px;">
              ${code}
            </span>
          </div>

          <div style="font-size: 12px; color: #F59E0B; font-weight: 600;">
            ⏳ This code expires in 10 minutes (single-use only).
          </div>
        </div>

        <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #64748B; line-height: 1.5;">
          If you did not request this verification code, please ignore this email or secure your account.<br/>
          © 2026 CareerPilot India • Bengaluru • Hyderabad • Pune • Gurugram
        </div>
      </div>
    `;

    if (brevoApiKey && email) {
      try {
        console.log(`📧 Dispatching live email via Brevo REST API to ${email}...`);
        const brevoRes = await axios.post('https://api.brevo.com/v3/smtp/email', {
          sender: { name: brevoSenderName, email: brevoSenderEmail },
          to: [{ email, name: fullName }],
          subject: `🔐 Your CareerPilot Authentication Code: ${code}`,
          htmlContent: emailHtml
        }, {
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        dispatchResults.emailSent = true;
        dispatchResults.channel = 'brevo_api';
        dispatchResults.message = 'Email delivered directly to inbox via Brevo API';
        console.log(` Brevo live email dispatched successfully to ${email}! Message ID:`, brevoRes.data?.messageId);
        return dispatchResults;
      } catch (brevoErr) {
        console.warn('⚠️ Brevo REST API dispatch note:', brevoErr.response?.data || brevoErr.message);
      }
    }

    // 4. Fallback to SMTP if Brevo API is not configured or failed
    const smtpHost = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass && email && !dispatchResults.emailSent) {
      try {
        console.log(`📧 Dispatching live email via SMTP relay (${smtpHost}) to ${email}...`);
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: smtpUser, pass: smtpPass }
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || (smtpUser ? `"CareerPilot India" <${smtpUser}>` : '"CareerPilot India" <no-reply@careerpilot.com>'),
          to: email,
          subject: `🔐 Your CareerPilot Authentication Code: ${code}`,
          html: emailHtml
        });
        dispatchResults.emailSent = true;
        dispatchResults.channel = 'brevo_smtp';
        console.log(` Brevo SMTP email dispatched successfully to ${email}!`);
      } catch (mailErr) {
        console.warn('⚠️ Brevo SMTP dispatch note:', mailErr.message);
      }
    }

    return dispatchResults;
  }
};

export default otpService;
