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
    booking: (data) =>({
        subject: 'New Booking Confirmation',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Booking Confirmation</h2>
                <p>Dear ${data.customerName},</p>
                <p>Your booking has been confirmed for:</p>
                <ul>
                    <li>Date: ${data.date}</li>
                    <li>Time: ${data.time}</li>
                    <li>Service: ${data.service}</li>
                    <li>Location: ${data.location}</li>
                </ul>
                <p>Looking forward to seeing you!</p>
            </div>
        `
    }),
    reminder: (data) =>({
        subject: 'Upcoming Appointment Reminder',
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Appointment Reminder</h2>
            <p>Dear ${data.customerName},</p>
            <p>This is a friendly reminder of your upcoming appointment:</p>
            <ul>
                <li>Date: ${data.date}</li>
                <li>Time: ${data.time}</li>
                <li>Service: ${data.service}</li>
                <li>Location: ${data.location}</li>
            </ul>
            <p>We look forward to seeing you!</p>
        </div> 
        `
    })
}
/**
 * Send email notification
 * @param {Object} options -Email options 
 * @param {string} options.to - Recipient email address or array of addresses
 * @param {string} options.template - Template name ('booking', 'cancellation', 'reminder')
 * @param {Object} options.data - Data to populate the template
 * @param {string} [options.from] - Optional sender name
 */
async function sendMail(req, res){
    try{
        const {to, template, data, from} = req.body;
        //validate the incoming data
        if(!to || !template || !data || !from){
            return res.status(400).json({message:"missing data"})
        }
        //validate if template exists
        if(!emailTemplates[template]){
            return res.status(400).json({message:"template does not exists"})
        }
        //generate email content from template
        const templateContent = emailTemplates[template](data);
        const mailOptions = {
            from: {
                name: from || "Bookit Notification",
                address: process.env.EMAIL_USER
            },
            to: Array.isArray(to) ? to : [to],
            subject: templateContent.subject,
            html: templateContent.html
        };

        //verify transporter connection
        await transporter.verify()

        //send email
        await transporter.sendMail(mailOptions);
        console.log("Email send successfully")

        res.status(200).json({message:"Email send successfully"})

    }catch(error) {
        console.error('Error sending WhatsApp message:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
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
