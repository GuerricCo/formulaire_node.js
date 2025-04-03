let express = require('express');
let bodyParser = require("body-parser");
let { Client } = require('pg'); // Importation de 'pg' pour la connexion à PostgreSQL
require('dotenv').config(); // Pour charger les variables d'environnement

let server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.listen(80);

// Configuration de la connexion à la base de données
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connexion à PostgreSQL
client.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données', err.stack);
  } else {
    console.log('Connecté à la base de données');
  }
});

// Route pour afficher le formulaire
server.get('/form.html', function (request, response) {
  response.sendFile(__dirname + '/form.html');
});

// Route pour traiter le formulaire et insérer les données dans la base de données
server.post('/post.html', function (request, response) {
  let first_name = request.body.first_name;
  let last_name = request.body.last_name;
  let mail = request.body.mail;

  // Requête pour insérer les données dans la table User_
  const query = `
    INSERT INTO "user_" (first_name, last_name, mail, password, registration_date)
    VALUES ($1, $2, $3, 'password_placeholder', NOW())`; // 'password_placeholder' temporaire
    
  client.query(query, [first_name, last_name, mail], (err, res) => {
    if (err) {
      console.error('Erreur d\'insertion dans la base de données', err.stack);
      response.status(500).send('Erreur lors de l\'insertion des données');
    } else {
      console.log('Utilisateur ajouté :', res.rows);
      response.send('Formulaire soumis avec succès');
    }
  });
});
