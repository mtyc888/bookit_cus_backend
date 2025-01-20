const axios = require('axios');
const nodemailer = require("nodemailer")
require("dotenv").config();


const transporter = nodemailer.createTransport({
    service:"gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
});
// Email templates
const emailTemplates = {
    booking: (data) => ({
        subject: 'Booking Confirmation',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333333; margin: 0;">Booking Confirmation</h1>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <p style="font-size: 16px; color: #333333;">Dear ${data.customer_name},</p>
                    <p style="font-size: 16px; color: #333333;">Thank you for your booking. We're excited to confirm your appointment details below:</p>
                </div>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h2 style="color: #333333; margin-top: 0; margin-bottom: 20px; font-size: 18px;">Booking Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #666666;">Service:</td>
                            <td style="padding: 8px 0; color: #333333; font-weight: 500;">${data.service_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #666666;">Location:</td>
                            <td style="padding: 8px 0; color: #333333; font-weight: 500;">${data.location_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #666666;">Date & Time:</td>
                            <td style="padding: 8px 0; color: #333333; font-weight: 500;">${data.time}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #666666;">Price:</td>
                            <td style="padding: 8px 0; color: #333333; font-weight: 500;">$${data.service_price}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-bottom: 30px;">
                    <p style="font-size: 16px; color: #333333;">We're looking forward to seeing you!</p>
                    <p style="font-size: 16px; color: #333333;">If you need to make any changes to your booking or have any questions, please don't hesitate to contact us.</p>
                </div>

                <div style="border-top: 1px solid #e9ecef; padding-top: 20px; text-align: center;">
                    <p style="font-size: 14px; color: #6c757d; margin: 0;">This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        `
    }),
    reminder: (data) => ({
        subject: 'Appointment Reminder',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333333; margin: 0;">Appointment Reminder</h1>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <p style="font-size: 16px; color: #333333;">Dear ${data.customer_name},</p>
                    <p style="font-size: 16px; color: #333333;">This is a friendly reminder of your upcoming appointment:</p>
                </div>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h2 style="color: #333333; margin-top: 0; margin-bottom: 20px; font-size: 18px;">Appointment Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #666666;">Service:</td>
                            <td style="padding: 8px 0; color: #333333; font-weight: 500;">${data.service_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #666666;">Location:</td>
                            <td style="padding: 8px 0; color: #333333; font-weight: 500;">${data.location_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #666666;">Time:</td>
                            <td style="padding: 8px 0; color: #333333; font-weight: 500;">${data.time}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-bottom: 30px;">
                    <p style="font-size: 16px; color: #333333;">We look forward to seeing you then!</p>
                    <p style="font-size: 16px; color: #333333;">If you need to reschedule or have any questions, please contact us as soon as possible.</p>
                </div>

                <div style="border-top: 1px solid #e9ecef; padding-top: 20px; text-align: center;">
                    <p style="font-size: 14px; color: #6c757d; margin: 0;">This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        `
    })
};
/**
 * Send email notification
 * @param {Object} options -Email options 
 * @param {string} options.to - Recipient email address or array of addresses
 * @param {string} options.template - Template name ('booking', 'cancellation', 'reminder')
 * @param {Object} options.data - Data to populate the template
 * @param {string} [options.from] - Optional sender name
 */
async function sendMail(req, res) {
    try {
        const { to, template, data, from } = req.body;

        // Validate required fields
        if (!to || !template || !data || !from) {
            return res.status(400).json({ 
                message: "missing data" 
            });
        }

        // Validate if template exists
        if (!emailTemplates[template]) {
            return res.status(400).json({ 
                message: "template does not exist" 
            });
        }

        // Generate email content from template
        const templateContent = emailTemplates[template](data);

        // Configure email options
        const mailOptions = {
            from: {
                name: "Booking System",
                address: from
            },
            to: Array.isArray(to) ? to : [to],
            subject: templateContent.subject,
            html: templateContent.html
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", to);

        res.status(200).json({ 
            message: "Email sent successfully" 
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            error: "Failed to send email",
            details: error.message 
        });
    }
}

transporter.verify((error, success) => {
    if(error){
        console.log("Email configuration error:", error);
    } else{
        console.log("Email server is ready to send message");
    }
})

async function sendTemplateMessage(req, res) {
    try {
        const { to, templateName, languageCode } = req.body;

        const response = await axios({
            url: 'https://graph.facebook.com/v20.0/516296391570428/messages',
            method: 'post',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            data: {
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: templateName, // Template name
                    language: {
                        code: languageCode || 'en_US', // Language code
                    },
                },
            },
        });

        res.status(200).json({
            message: 'Message sent successfully',
            response: response.data,
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
}

module.exports = { sendTemplateMessage, sendMail };
