const express = require('express');
const router = express.Router();
const stuffCtrl = require('../controllers/stuff');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const multerImage = require('multer');
const { optimizeImage } = require('../utils/imageUtils');
// Configuration de Multer pour gérer les téléchargements de fichiers
const upload = multerImage({ dest: 'images/' });


// Renvoie un tableau de tous les livres de la base de données.
router.get('/', stuffCtrl.getAllBooks);

// route renvoyant un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
router.get('/bestrating', stuffCtrl.getBestRatingBooks); 

// Renvoie le livre avec l’_id fourni.  je vais enlever auth.
router.get('/:id', stuffCtrl.getOneBook);



// Capture et enregistre l'image, analyse le livre transformé en chaîne de caractères, et l'enregistre dans la base de données en définissant correctement son ImageUrl.
// Initialise la note moyenne du livre à 0 et le rating avec un tableau vide. 
// Le corps de la demande initiale est vide ; lorsque Multer est ajouté,il renvoie une chaîne pour le corps de la demande en fonction des données soumises avec le fichier.
router.post('/', auth, multer, stuffCtrl.createBook);

// Met à jour le livre avec l'_id fourni.
// Si une image est téléchargée, elle est capturée, et l’ImageUrl du livre est mise à jour. 
// Si aucun fichier n'est fourni, les informations sur le livre se trouvent directement dans le corps de la requête (req.body.title, req.body.author, etc.). 
// Si un fichier est fourni, le livre transformé en chaîne de caractères se trouve dans req.body.book. 
// Notez que le corps de la demande initiale est vide ; lorsque Multer est ajouté, il renvoie une chaîne du corps de la demande basée sur les données soumises avec le fichier
router.put('/:id', auth, multer, stuffCtrl.modifyBook);

// Supprime le livre avec l'_id fourni ainsi que l’image associée
router.delete('/:id', auth, stuffCtrl.deleteBook);

// Définit la note pour le user ID fourni. 
// La note doit être comprise entre 0 et 5.L'ID de l'utilisateur et la note doivent être ajoutés au tableau "rating" afin de ne pas laisser un utilisateur noter deux fois le même livre.
// Il n’est pas possible de modifier une note.
// La note moyenne "averageRating" doit être tenue à jour, et le livre renvoyé en réponse de la requête. je vais enlever auth aussi
router.post('/:id/rating', stuffCtrl.rateBook);




// Route pour gérer les téléchargements de fichiers
router.post('/upload', upload.single('image'), (req, res, next) => {
  const inputPath = req.file.path;
  const outputPath = `images/${req.file.originalname}`;
  
  // Optimisation de l'image téléchargée
  optimizeImage(inputPath, outputPath)
    .then(() => res.status(200).json({ message: 'File uploaded successfully!' }))
    .catch(error => res.status(500).json({ error }));
});


module.exports = router;