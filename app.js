const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const path = require("path");
const stuffRoutes = require("./routes/stuff");
const userRoutes = require("./routes/user");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Connexion à la base de données
mongoose
  .connect(
    process.env.MONGO_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Middleware pour l'erreur de CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Pour la sécurité
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "localhost:4000"],
      scriptSrc: ["'self'", "example.com", "localhost:4000"],
    },
  })
);

// Middleware pour servir les images et définir l'en-tête CORP approprié
app.use(
  "/images",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "images"))
);

app.use(express.json());

app.use("/api/books", stuffRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
