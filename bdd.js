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
    console.log('Connecté à la base de données');
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
      // Erreur : tentative d'insertion d'un email déjà existant
      if (err.code === '23505') {
        // 23505 = erreur de clé unique dans PostgreSQL
        return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
      }
  
      // Autres erreurs serveur
      console.error('Erreur insertion DB :', err.stack);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }
  
    // Succès
    res.status(200).json({ message: 'Utilisateur ajouté !', user: result.rows[0] });
  });
})

server.post('/login', async (req, res) => {
  const { mail, password } = req.body;

  try {
    const result = await client.query('SELECT * FROM user_ WHERE mail = $1', [mail]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email non trouvé." });
    }

    const user = result.rows[0];

    // Vérifie si le mot de passe correspond (ici on suppose pas encore de hash)
    if (user.password !== password) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    res.status(200).json({ message: `Bienvenue, ${user.first_name} !`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});
