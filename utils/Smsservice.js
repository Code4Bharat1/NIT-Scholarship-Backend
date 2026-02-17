import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Twilio client
let twilioClient = null;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio SMS service initialized');
  } else {
    console.warn('⚠️ Twilio credentials not found. SMS service disabled.');
  }
} catch (error) {
  console.error('❌ Error initializing Twilio:', error);
}

// Send OTP via SMS
export const sendOTPSMS = async (phone, otp, name) => {
  try {
    if (!twilioClient) {
      throw new Error('SMS service not configured');
    }

    // Format phone number (ensure it has country code)
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    const message = await twilioClient.messages.create({
      body: `Hello ${name}! Your Scholar Portal verification OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`📱 SMS OTP sent to ${formattedPhone} | SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    throw new Error('Failed to send SMS OTP');
  }
};

// Alternative: Mock SMS service for development
export const sendMockOTPSMS = async (phone, otp, name) => {
  console.log(`📱 [MOCK SMS] To: ${phone} | OTP: ${otp} | Name: ${name}`);
  return { success: true, mock: true };
};

export default twilioClient;