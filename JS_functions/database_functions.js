const mysql = require('mysql2');

// Database connection setup
const db = mysql.createConnection({
    host: 'localhost',  // Change to your DB host
    user: 'root',       // Change to your DB username
    password: 'Cezar2004!', // Change to your DB password
    database: 'mydb',   // Your database name
});

// Connect to the database and check if the connection is successful
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

// Function to fetch data from a specific table
const fetchDataFromTable = (tableName, callback) => {
    const query = `SELECT CodProdus, Denumire FROM ${tableName} GROUP BY CodProdus, Denumire`;

    db.query(query, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
};

// Export the function for use in other parts of the app
module.exports = { fetchDataFromTable };
