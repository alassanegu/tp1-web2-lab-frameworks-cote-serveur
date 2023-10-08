const express = require('express');
const router = express.Router();
const questionReponseController = require('../controllers/questionReponseController');


// Route pour afficher la page de pose de questions
router.get('/annonce/:annonceId/poser-question', questionReponseController.getPoserQuestionForm);
router.post('/annonce/:annonceId/poser-question', questionReponseController.poserQuestion);

module.exports = router;