const express = require('express');
//const bodyParser = require ('body-parser')   // donne aussi acces au corps de la requete en méthode POST
const mongoose = require('mongoose');
const app = express();
// enregistrement du nouveau routeur de stuFf.js de ROUTE
const stuffRoutes = require('./routes/stuff');
const userRoutes = require('./routes/user');
// 4e partie multer : modifier la route POST
const path = require('path');

//pour éviter l'erreur cannot GET / sur localhost:4000
app.get('/', (req, res) => {
  res.send('Bienvenue sur mon application Express!');
});

// Connexion à la base de données
mongoose.connect('mongodb+srv://ELO13:KolDB13@p7-dev-web-livres.d6llbj5.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//pour une route POST : pour accéder au corps de la requete
app.use(express.json());

// pour l'erreur de CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

//app.use(bodyParser.json());

// enregistre toutes les routes en 1 seule route
app.use('/api/stuff', stuffRoutes);
app.use(userRoutes);
//app.use('/api/auth/login', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));



module.exports = app;