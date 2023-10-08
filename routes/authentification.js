var express = require('express');
var router = express.Router();
const authenticationController = require('../controllers/authenticationController');

//routes pour inscription
router.get('/register',authenticationController.getRegister);
router.post('/register', authenticationController.register);

//routes pour la Connexion
router.get('/login', authenticationController.getLogin);
router.post('/login', authenticationController.login);

//routes pour se déconnecter
router.get('/logout', authenticationController.getLogout);

//Page d'accueil utilisateur apres authentification
router.get('/accueil/:userId', authenticationController.userHomePage);


module.exports = router;

