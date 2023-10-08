const mongoose = require('mongoose');

// le schéma pour les annonces immobilières
const annonceSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    typeBien: { type: String, enum: ['vente', 'location'], required: true },
    statutPublication: { type: String, enum: ['publiée', 'non publiée'], required: true },
    statutBien: { type: String, enum: ['disponible', 'loué', 'vendu'], required: true },
    description: { type: String, required: true },
    prix: { type: Number, required: true },
    dateDisponibilite: {
        type: Date,
        default: Date.now,
    },
    photos: [
        {
            url: { type: String, required: true },
            filename: { type: String, required: true },
        },
    ],
    idUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }], // Référence aux questions posées
    reponses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reponse' }], // Référence aux réponses données
});

//le modèle à partir du schéma
const Annonce = mongoose.model('Annonce', annonceSchema);

module.exports = Annonce;
