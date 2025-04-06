let express = require('express');
let bodyParser = require("body-parser");
let { Client } = require('pg');
require('dotenv').config();

let server = express();
server.use(bodyParser.json());
server.use(express.static(__dirname)); // Sert les fichiers HTML statiques

server.listen(80);

// Connexion DB
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
client.connect((err) => {
  if (err) {
    console.error('Erreur DB :', err.stack);
  } else {
    console.log('✅ Connecté à la base de données');
  }
});

// Route POST
server.post('/post', function (req, res) {
  const { first_name, last_name, mail, password } = req.body;

  const query = `
    INSERT INTO "user_" (first_name, last_name, mail, password, registration_date)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *;
  `;

  client.query(query, [first_name, last_name, mail, password], (err, result) => {
    if (err) {
      console.error('Erreur insertion DB :', err.stack);
      res.status(500).json({ message: '❌ Erreur serveur.' });
    } else {
      res.status(200).json({ message: '✅ Utilisateur ajouté !', user: result.rows[0] });
    }
  });
});
