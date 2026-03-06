// import axios from "axios";

// /**
//  * Format phone number to international format without +
//  * Example: +919876543210 → 919876543210
//  */
// const formatPhoneNumber = (phone) => {
//   return phone.replace(/\D/g, "");
// };

// /**
//  * Send WhatsApp OTP using Nextel Template (Authentication Type)
//  */
// export const sendWhatsAppOTP = async ({ phone, otp }) => {
//   try {
//     if (!phone || !otp) {
//       throw new Error("Phone and OTP are required");
//     }

//     const formattedPhone = formatPhoneNumber(phone);

//     const url = `${process.env.NEXTEL_BASE_URL}/${process.env.NEXTEL_PHONE_NUMBER_ID}/messages`;

//     const payload = {
//       messaging_product: "whatsapp",
//       to: formattedPhone,
//       type: "template",
//       template: {
//         name: process.env.NEXTEL_TEMPLATE_NAME, // Approved template name
//         language: {
//           code: "en"
//         },
//         components: [
//           {
//             type: "body",
//             parameters: [
//               {
//                 type: "text",
//                 text: otp
//               }
//             ]
//           }
//         ]
//       }
//     };

//     const response = await axios.post(url, payload, {
//       headers: {
//         Authorization: `Bearer ${process.env.NEXTEL_ACCESS_TOKEN}`,
//         "Content-Type": "application/json"
//       },
//       timeout: 10000
//     });

//     return {
//       success: true,
//       messageId: response.data?.messages?.[0]?.id,
//       data: response.data
//     };

//   } catch (error) {
//     console.error("❌ WhatsApp OTP Error:", error.response?.data || error.message);

//     return {
//       success: false,
//       error: error.response?.data || error.message
//     };
//   }
// // };

// import axios from "axios";

// export const sendWhatsAppOTP = async (phone, otp, name) => {
//   try {

//     // ✅ Log OTP (Development ke liye)
//     if (process.env.NODE_ENV !== "production") {
//       console.log("=================================");
//       console.log("WhatsApp OTP Debug Log");
//       console.log("Phone:", phone);
//       console.log("Name:", name);
//       console.log("Generated OTP:", otp);
//       console.log("=================================");
//     }

//     const response = await axios.post(
//       "https://app.simplifiedchat.com/api/send",
//       {
//         instance_id: process.env.SIMPLIFIED_INSTANCE_ID,
//         access_token: process.env.SIMPLIFIED_ACCESS_TOKEN,
//         number: `91${phone}`,
//         type: "text",
//         message: `Dear ${name},

// Thank you for registering on the NIT Scholarship Portal.

// Your verification OTP is: ${otp}

// This code will expire in 10 minutes.

// For security reasons, please do not share this OTP with anyone.

// Regards,
// National Institute of Technology
// Scholarship Administration Team`
//       }
//     );

//     console.log("WhatsApp API Response:", response.data);

//     return response.data;

//   } catch (error) {
//     console.error("WhatsApp OTP Error:", error.response?.data || error.message);
//     throw error;
//   }
// };


import axios from "axios";

export const sendWhatsAppOTP = async (phone, otp, name) => {
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("=================================");
      console.log("WhatsApp OTP Debug Log");
      console.log("Phone:", phone);
      console.log("OTP:", otp);
      console.log("=================================");
    }

    const payload = {
      instance_id: process.env.SIMPLIFIED_INSTANCE_ID,
      access_token: process.env.SIMPLIFIED_ACCESS_TOKEN,
      number: `91${phone}`,
      type: "text",
      // message: `Dear ${name},\n\nYour OTP is: *${otp}*\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\nRegards,\nNIT Scholarship Portal`
        message: `Dear ${name},

Thank you for registering on the NIT Scholarship Portal.

Your verification OTP is: ${otp}

This code will expire in 10 minutes.

For security reasons, please do not share this OTP with anyone.

Regards,
Nexcore Institute of Technology
Scholarship Administration Team`,
    };

    console.log("[WhatsApp] Sending to:", `91${phone}`);
    console.log("[WhatsApp] Instance ID:", process.env.SIMPLIFIED_INSTANCE_ID);
    console.log("[WhatsApp] Token present:", !!process.env.SIMPLIFIED_ACCESS_TOKEN);

    const response = await axios.post(
      "https://app.simplifiedchat.com/api/send",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          // Agar SimplifiedChat Bearer token maange toh yeh add karo:
          // "Authorization": `Bearer ${process.env.SIMPLIFIED_ACCESS_TOKEN}`,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    console.log("[WhatsApp] API Response Status:", response.status);
    console.log("[WhatsApp] API Response Data:", response.data);

    // Check karo ki message actually sent hua ya nahi
    if (response.data?.status === false || response.data?.error) {
      throw new Error(response.data?.message || "WhatsApp send failed");
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      // API ne error response diya
      console.error("[WhatsApp] API Error Status:", error.response.status);
      console.error("[WhatsApp] API Error Data:", error.response.data);
    } else if (error.request) {
      // Request gayi par response nahi aaya
      console.error("[WhatsApp] No response received — network issue ya wrong URL");
    } else {
      console.error("[WhatsApp] Error:", error.message);
    }
    throw error;
  }
};