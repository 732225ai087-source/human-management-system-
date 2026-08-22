import { config } from '../config/env.js';

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${config.clientUrl}/verify-email/${token}`;

  if (config.nodeEnv === 'development' || !config.smtpHost) {
    console.log('═══════════════════════════════════════════');
    console.log('📧 EMAIL VERIFICATION (Dev Mode)');
    console.log(`To: ${email}`);
    console.log(`Verify URL: ${verifyUrl}`);
    console.log(`Token: ${token}`);
    console.log('═══════════════════════════════════════════');
    return;
  }

  // Production: Use nodemailer (stub for now)
  console.log(`Would send verification email to ${email}`);
}

export async function sendNotificationEmail(
  email: string,
  subject: string,
  body: string
): Promise<void> {
  if (config.nodeEnv === 'development' || !config.smtpHost) {
    console.log('═══════════════════════════════════════════');
    console.log('📧 NOTIFICATION EMAIL (Dev Mode)');
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log('═══════════════════════════════════════════');
    return;
  }

  console.log(`Would send notification email to ${email}`);
}
