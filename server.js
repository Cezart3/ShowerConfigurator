const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // Import mysql2 for the DB connection
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const path = require('path');
const { app, BrowserWindow } = require('electron');

// Initialize Express app
const expressApp = express();
const port = 3000;

// Middleware to parse JSON body
expressApp.use(bodyParser.json());

// Database connection setup
const db = mysql.createConnection({
    host: 'localhost',  // Change to your DB host
    user: 'root',       // Change to your DB username
    password: 'Cezar2004!', // Change to your DB password
    database: 'mydb',   // Your database name
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

// Function to create API routes for each table
const createApiRoute = (endpoint, tableName) => {
    expressApp.get(`/api/${endpoint}`, (req, res) => {
        const query = `SELECT CodProdus, Denumire FROM ${tableName} GROUP BY CodProdus, Denumire`;
        db.query(query, (err, results) => {
            if (err) {
                res.status(500).json({ error: `Error fetching data from ${tableName}` });
                return;
            }
            res.json(results);  // Send the fetched data as JSON response
        });
    });
};

// Define table names
const tables = [
    'balamale', 'manerebuton', 'profile', 'manerediverse',
    'garnituri', 'rolasiaccesorii', 'manersicontraplacapentruusidesticla',
    'manerepentruusidesticlaglisante', 'incuietori', 'piesebalustrade'
];

// Create routes dynamically for each table
tables.forEach(table => createApiRoute(table, table));

// Admin API routes (login, add, update, delete product)
expressApp.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM admin_users WHERE username = ?`;

    db.query(query, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error.' });
        const user = results[0];
        if (user && await bcrypt.compare(password, user.password_hash)) {
            res.json({ success: true, message: 'Authentication successful' });
        } else {
            res.status(401).json({ success: false, message: 'Authentication failed' });
        }
    });
});

expressApp.post('/api/admin/addProduct', (req, res) => {
    const { table, CodProdus, Denumire, Pret, Material, Finisaj } = req.body;
    const query = `INSERT INTO ${table} (CodProdus, Denumire, Pret, Material, Finisaj) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [CodProdus, Denumire, Pret, Material, Finisaj], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Product added successfully' });
    });
});

expressApp.put('/api/admin/updateProduct', (req, res) => {
    const { table, CodProdus, Pret, Material, Finisaj } = req.body;
    const query = `UPDATE ${table} SET Pret = ? WHERE CodProdus = ? AND Material = ? AND Finisaj = ?`;
    db.query(query, [Pret, CodProdus, Material, Finisaj], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Product updated successfully' });
    });
});

expressApp.delete('/api/admin/deleteProduct', (req, res) => {
    const { table, CodProdus } = req.body;
    const query = `DELETE FROM ${table} WHERE CodProdus = ?`;
    db.query(query, [CodProdus], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Product deleted successfully' });
    });
});
// Function to handle dynamic table selection based on id_cabina
const getTableByCabinaType = (id_cabina) => {
    const mappings = {
        1: ['balamale', 'manerebuton', 'manerediverse', 'profile', 'garnituri', 'profilerigidizare'],
        2: ['profile', 'setglisanta'],
        3: [], // Usi Toc Aluminiu - no data yet
    };
    return mappings[id_cabina] || [];
};

// Create a new API endpoint for fetching hardware by cabina type
expressApp.get('/api/hardware/:id_cabina', (req, res) => {
    const id_cabina = parseInt(req.params.id_cabina, 10);
    const tables = getTableByCabinaType(id_cabina);

    if (tables.length === 0) {
        res.json({ message: 'No data available for the selected Cabina.' });
        return;
    }

    const queries = tables.map(table => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT CodProdus, Denumire
                FROM ${table}
                WHERE id_cabina = ?
                GROUP BY CodProdus, Denumire`;
            db.query(query, [id_cabina], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ table, data: results });
                }
            });
        });
    });

    Promise.all(queries)
        .then(results => {
            res.json(results); // Return all fetched data grouped by table
        })
        .catch(err => {
            res.status(500).json({ error: 'Error fetching hardware data.' });
        });
});

// Electron setup
let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadFile(path.join(__dirname, 'public', 'configurator.html'));  // Assuming you have a configurator.html file
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Start the Express server
expressApp.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
