const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    contenu: String,
    annonce: { type: mongoose.Schema.Types.ObjectId, ref: 'Annonce' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }, // Référence à l'utilisateur qui a posé la question
    reponses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reponse' }], // Tableau de références vers les réponses associées à la question
    dateQuestion: { type: Date, default: Date.now }, // Date de création de la question
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
