const Annonce = require('../models/annonce');

//page pour ajouter une annonce
exports.getAddAnnonceForm = (req, res, next) => {
    const isAuthenticated = req.isAuthenticated();
    if (!isAuthenticated) {
        const errorMessage = req.flash('error')[0];
        return res.render('login', {
            user: req.user,
            errorMessage,
            title: 'Login'
        });
    } else {
        res.render('add-annonce', { user: req.user, title: 'user home page' });
    }
};


//traitement du formulaire d'ajout d'une annonce
exports.addAnnonce = async (req, res, next) => {
    const isAuthenticated = req.isAuthenticated();
    if (!isAuthenticated){
        const errorMessage = req.flash('error')[0];
        res.render('login', { user : req.user,errorMessage, title:'Login' });
    }else {
        try {
            // Récupérez les données du formulaire depuis req.body
            const { titre, typeBien, statutPublication, description, prix, dateDisponibilite } = req.body;

            // Récupérez les fichiers téléchargés depuis req.files
            const photos = req.files.map((file) => {
                const photoUrl = '/images/' + file.filename; // Chemin d'accès à l'image
                return {
                    url: photoUrl,
                    filename: file.filename,
                };
            });

            const nouvelleAnnonce = new Annonce({
                titre,
                typeBien,
                statutPublication,
                statutBien: "disponible",
                description,
                prix,
                dateDisponibilite: dateDisponibilite || Date.now(),
                photos,
                idUser: req.user._id,
            });

            // Enregistrez l'annonce dans la base de données
            const annonceEnregistree = await nouvelleAnnonce.save();

            // Redirigez l'utilisateur vers une page de confirmation ou une autre page de votre choix
            res.redirect('/annonce/' + nouvelleAnnonce._id);
        } catch (error) {
            console.error(error);
            // Gérez les erreurs ici, par exemple, en affichant un message d'erreur à l'utilisateur
            res.render('add-annonce', {
                user: req.user,
                errorMessage: 'Une erreur s\'est produite lors de la création de l\'annonce.',
                title: 'user home page'
            });
        }}
};

