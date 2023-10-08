const mongoose = require('mongoose');

const reponseSchema = new mongoose.Schema({
    contenu: String,
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, // Référence à la question associée
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }, // ID de l'utilisateur qui a répondu
    username: String, // Nom d'utilisateur de l'utilisateur qui a répondu
    dateReponse: { type: Date, default: Date.now }, // Date de création de la réponse
});

const Reponse = mongoose.model('Reponse', reponseSchema);

module.exports = Reponse;
