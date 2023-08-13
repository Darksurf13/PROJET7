const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author : { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [{
  userId: { type: String, required: true },
  grade: { type: Number, required: true }
  }],
  averageRating: { type: Number, default: 0 }
});

//Ce code ajoute une propriété averageRating au modèle Book pour stocker la moyenne des notes d’un livre. 
// Il ajoute également une méthode calculateAverageRating au modèle Book qui calcule la moyenne des notes et met à jour la propriété averageRating. 
// Cette méthode peut être appelée après chaque nouvelle note saisie pour mettre à jour la moyenne.
//bookSchema.methods.calculateAverageRating = function() {
  //const sum = this.ratings.reduce((acc, rating) => acc + rating.grade, 0);
  //const average = sum / this.ratings.length;
  //this.averageRating = average;
 // this.save();
//};

module.exports = mongoose.model('Book', bookSchema);