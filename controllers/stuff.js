const Book = require('../models/book');
// pour activer la fonction delete d'une image
const fs = require('fs');


// La fonction de cette route est de renvoyer un tableau de tous les livres de la base de données. 
// Le contrôleur utilise le modèle Book pour trouver tous les livres dans la base de données en utilisant la méthode find() de Mongoose. 
// Si la recherche réussit, un tableau de livres est renvoyé avec un code de statut 200. Si une erreur se produit, un objet d’erreur est renvoyé avec un code de statut 400.
exports.getAllBooks = (req, res, next) => {
  Book.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// Cette route utilise la méthode GET pour accéder au point d’accès /api/books/:id, où :id est un paramètre dynamique représentant l’identifiant du livre à récupérer. 
// Elle ne nécessite pas d’authentification. 
// La fonction de cette route est de renvoyer le livre avec l’identifiant fourni.
// Le contrôleur utilise le modèle Book pour trouver un livre dans la base de données en utilisant la méthode findOne() de Mongoose et en passant un objet de critères avec l’identifiant du livre à trouver. 
// Si la recherche réussit, un livre est renvoyé avec un code de statut 200. Si une erreur se produit ou si aucun livre n’est trouvé, un objet d’erreur est renvoyé avec un code de statut 404.
exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id
  }).then(
    (book) => {
      res.status(200).json(book);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

// Cette route utilise la méthode GET pour accéder au point d’accès /api/books/bestrating. 
// Elle ne nécessite pas d’authentification. 
// La fonction de cette route est de renvoyer un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
// Le contrôleur utilise le modèle Book pour effectuer une agrégation sur la collection de livres dans la base de données en utilisant la méthode aggregate() de Mongoose. 
// L’agrégation décompose les tableaux de notes de chaque livre en documents distincts avec l’opérateur $unwind, calcule la note moyenne pour chaque livre avec l’opérateur $group, trie les livres par note moyenne décroissante avec l’opérateur $sort et limite le nombre de résultats à 3 avec l’opérateur $limit. 
// Si l’agrégation réussit, un tableau des 3 livres ayant la meilleure note moyenne est renvoyé avec un code de statut 200. Si une erreur se produit, un objet d’erreur est renvoyé avec un code de statut 400
exports.getBestRatingBooks = (req, res, next) => {
  Book.aggregate([
    { $unwind: "$ratings" },
    { $group: { _id: "$_id", avgRating: { $avg: "$ratings.grade" } } },
    { $sort: { avgRating: -1 } },
    { $limit: 3 }
  ])
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Cette route utilise la méthode POST et le point de terminaison /api/books. 
// Il nécessite une authentification et utilise le middleware multer pour gérer le téléchargement de fichiers.
// La fonction de contrôleur createBook capture et enregistre l'image, analyse les données du livre à partir du corps de la requête et les enregistre dans la base de données avec l'imageUrl correcte. 
// Il initialise également la note moyenne du livre à 0 et son tableau de notes à un tableau vide.
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book= new Book({
        ...bookObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        averageRating: 0,
        ratings: []
      });
      book.save()
        .then(() => res.status(201).json({ message: 'Book saved successfully!' }))
        .catch(error => res.status(400).json({ error }));
    };

// La route utilise la méthode PUT et le point de terminaison /api/books/:id.
// Il nécessite une authentification et utilise le middleware multer pour gérer le téléchargement du fichier, le cas échéant. 
// La fonction de contrôleur modifyBook vérifie si un fichier a été téléchargé et met à jour l'imageUrl du livre en conséquence. 
// Si aucun fichier n'a été téléchargé, il met à jour les données du livre directement à partir du corps de la requête.
exports.modifyBook = (req, res, next) => {
  let bookObject = {};
  if (req.file) {
    bookObject = JSON.parse(req.body.book);
    bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  } else {
    bookObject = { ...req.body };
  }
  Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Book updated successfully!' }))
    .catch(error => res.status(400).json({ error }));
};

// La route utilise la méthode DELETE et le point de terminaison /api/books/:id. 
// Il nécessite une authentification. 
// La fonction de contrôleur deleteBook trouve le livre avec le _id fourni, supprime le fichier image associé, puis supprime le livre de la base de données.
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Book deleted successfully!' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

// La route utilise la méthode POST et le point de terminaison /api/books/:id/rating. 
//Il nécessite une authentification. La fonction de contrôleur rateBook vérifie si la note fournie est comprise entre 0 et 5, puis vérifie si l'utilisateur a déjà noté le livre. 
//Si ce n'est pas le cas, il ajoute la note de l'utilisateur au tableau des notes du livre, met à jour la note moyenne du livre et enregistre les modifications dans la base de données.
exports.rateBook = (req, res, next) => {
  const userId = req.body.userId;
  const rating = req.body.rating;
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 0 and 5' });
  }
  Book.findOne({ _id: req.params.id })
    .then(book => {
      const existingRating = book.ratings.find(r => r.userId === userId);
      if (existingRating) {
        return res.status(400).json({ error: 'User has already rated this book' });
      }
      book.ratings.push({ userId, rating });
      const totalRatings = book.ratings.length;
      const sumRatings = book.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      book.averageRating = sumRatings / totalRatings;
      book.save()
        .then(() => res.status(200).json(book))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};



