const bcrypt = require('bcrypt');
const { db } = require('./database_functions'); // Importă conexiunea la baza de date din database_functions.js

/**
 * Verifică autentificarea utilizatorului.
 * @param {string} username - Numele utilizatorului.
 * @param {string} password - Parola utilizatorului.
 * @returns {Promise<Object>} - Returnează detalii despre utilizator sau eroare.
 */
async function authenticateUser(username, password) {
    try {
        const query = `
            SELECT u.id, u.username, u.password, u.role_id, r.role_name
            FROM users u
            INNER JOIN user_roles r ON u.role_id = r.id
            WHERE u.username = ?;
        `;
        const [rows] = await db.promise().execute(query, [username]);

        if (rows.length === 0) {
            return {
                success: false,
                message: 'Invalid username or password.',
            };
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return {
                success: false,
                message: 'Invalid username or password.',
            };
        }

        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role_id: user.role_id,
                role_name: user.role_name,
            },
        };
    } catch (error) {
        console.error('Error during authentication:', error);
        return {
            success: false,
            message: 'An error occurred while processing your request.',
        };
    }
}

module.exports = {
    authenticateUser,
};
