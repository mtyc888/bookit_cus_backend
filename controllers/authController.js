// authController.js
const connection = require('../connection'); // Adjust path as needed

const login = (req, res) => {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const query = `
        SELECT user_id, email, password
        FROM users
        WHERE email = ?
    `;

    connection.query(query, [email], (error, rows) => {
        if (error) {
            console.error('Login error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];

        if (password !== user.password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json({
            id: user.user_id,
            email: user.email
        });
    });
};

module.exports = {
    login
};