const Annonce = require('../models/annonce');
const Question = require('../models/question');
const Reponse = require('../models/reponse');


exports.getPoserQuestionForm = async (req, res, next) => {
    const isAuthenticated = req.isAuthenticated();
    if (!isAuthenticated) {
        const errorMessage = req.flash('error')[0];
        return res.render('login', {
            user: req.user,
            errorMessage,
            title: 'Login'
        });
    } else {
        const annonceId = req.params.annonceId;

        try {
            const annonce = await Annonce.findById(annonceId);
            const titre = annonce.titre;
            // Récupérez toutes les questions liées à cette annonce depuis la base de données
            const questions = await Question.find({ annonce: annonceId })
                .populate('user') // Obtenir les détails de l'utilisateur qui a posé la question
                .populate('reponses') // Charger les réponses associées à chaque question
                .sort('-dateQuestion'); // Triez les questions par date de création décroissante

            res.render('poser-question', { annonceId, annonce, titre, questions, user: req.user, title: 'Forum' });
        } catch (error) {
            // Gérez les erreurs ici
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la récupération des questions' });
        }
    }
};

exports.poserQuestion = async (req, res, next) => {
    const annonceId = req.params.annonceId;
    const { question } = req.body; // Récupérez la question depuis le formulaire

    try {
        // Enregistrez la question dans la base de données
        const nouvelleQuestion = new Question({
            contenu: question,
            annonce: annonceId,
            user: req.user._id, // Vous devez gérer l'ID de l'utilisateur actuel
        });

        await nouvelleQuestion.save();

        // Redirigez l'utilisateur vers la page de l'annonce
        res.redirect(`/annonce/${annonceId}/poser-question`);
    } catch (error) {
        // Gérez les erreurs ici
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la pose de la question' });
    }
};
