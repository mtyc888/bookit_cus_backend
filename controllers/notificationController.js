const axios = require('axios');

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

module.exports = { sendTemplateMessage };
