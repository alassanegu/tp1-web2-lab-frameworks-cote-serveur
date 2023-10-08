var passport = require('passport');
var Account = require('../models/account');

exports.getRegister = (req, res) => {
    res.render('register', {user : req.user, title: 'register' });
};
exports.register = async (req, res, next) => {
    // Récupérez le nom d'utilisateur, le mot de passe et l'adresse e-mail depuis le formulaire
    const { username, password, role } = req.body;

    try {
        // Vérifiez si un utilisateur avec la même adresse e-mail existe déjà
        const existingUser = await Account.findOne({ username });

        if (existingUser) {
            // L'utilisateur existe déjà, renvoyez un message d'erreur ou redirigez vers une page d'erreur
            return res.render('register', { title: 'register', errorMessage: 'Ce compte existe déja' });
        }

        // Créez un nouvel utilisateur avec le nom d'utilisateur, l'adresse e-mail et le rôle
        const newUser = new Account({ username, role });

        // Utilisez passport-local-mongoose pour inscrire l'utilisateur avec le mot de passe
        Account.register(newUser, password, function(err, account) {
            if (err) {
                return res.render('register', { title: 'register', error: 'Erreur lors de l\'inscription' });
            }

            passport.authenticate('local')(req, res, function () {
                if (req.user.role === 'AGENT'){
                    res.redirect('/accueil/' + req.user._id);
                } else {
                    res.redirect('/accueil/' + req.user._id);
                }
            });
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur', error);
        next(error);
    }
};

//login
exports.getLogin = (req, res) =>{
    const errorMessage = req.flash('error')[0];
    res.render('login', { user : req.user,errorMessage, title:'Login' });
};
exports.login = (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true,
    })(req, res, function () {
        res.redirect('/accueil/' + req.user._id);
    });
};

//logout
exports.getLogout = (req, res) =>{
    req.logout(function(err) {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
};

//Page d'accueil utilisateur apres authentification
exports.userHomePage = async (req, res, next) => {
    try {

        if (req.isAuthenticated()) {
            res.render('accueil', { user: req.user, title: 'User Home page'});
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des annonces', error);
        next(error);
    }
};