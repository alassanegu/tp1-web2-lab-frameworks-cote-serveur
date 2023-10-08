const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const annoncesController = require('../controllers/annoncesController');

//gérer les téléchargements vers le répertoire "public/images"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'public', 'images'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

//ajout d'une annonce
router.get('/add-annonce', annoncesController.getAddAnnonceForm);
router.post('/add-annonce', upload.array('photos', 10), annoncesController.addAnnonce);

//toutes les annonces publiées
router.get('/annonces', annoncesController.getAnnoncesPubliees);

//les annonces d'un utilisateur userId
router.get('/accueil/:userId/mes-annonces', annoncesController.getUserAnnonces);

// Afficher les détails d'une annonce
router.get('/annonce/:annonceId', annoncesController.getDetailsAnnonce);

//update d'une annonce
router.get('/annonce/:annonceId/update', annoncesController.getUpdateAnnonceForm);
router.post('/annonce/:annonceId/update', upload.array('photos', 8), annoncesController.updateAnnonce);

//supprimer une annonce
router.delete('/annonce/:annonceId/delete', annoncesController.deleteAnnonce);
// Route pour supprimer une photo d'une annonce
router.delete('/annonce/:annonceId/delete-photo/:photoIndex', annoncesController.deleteAnnoncePhoto);


module.exports = router;
