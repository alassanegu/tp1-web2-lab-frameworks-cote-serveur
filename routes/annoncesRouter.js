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


module.exports = router;
