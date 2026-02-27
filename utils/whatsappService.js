import axios from "axios";

/**
 * Format phone number to international format without +
 * Example: +919876543210 → 919876543210
 */
const formatPhoneNumber = (phone) => {
  return phone.replace(/\D/g, "");
};

/**
 * Send WhatsApp OTP using Nextel Template (Authentication Type)
 */
export const sendWhatsAppOTP = async ({ phone, otp }) => {
  try {
    if (!phone || !otp) {
      throw new Error("Phone and OTP are required");
    }

    const formattedPhone = formatPhoneNumber(phone);

    const url = `${process.env.NEXTEL_BASE_URL}/${process.env.NEXTEL_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: process.env.NEXTEL_TEMPLATE_NAME, // Approved template name
        language: {
          code: "en"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: otp
              }
            ]
          }
        ]
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.NEXTEL_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
      data: response.data
    };

  } catch (error) {
    console.error("❌ WhatsApp OTP Error:", error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};