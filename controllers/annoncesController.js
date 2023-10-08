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


//liste des annonces publiée
exports.getAnnoncesPubliees = async (req, res, next) => {
    try {
        const annonces = await Annonce.find({ statutPublication: 'publiée' });

        res.render('annonces', {
            user: req.user,
            annonces,
            title: 'Annonces',
            agent: false,
            currentPage: 'annonces'
        });
    } catch (error) {
        console.error(error);
        // Passez l'erreur au middleware next pour qu'il soit géré par le middleware d'erreur global
        next(error);
    }
};

//pour afficher les annonces d'un utilisateur
exports.getUserAnnonces = async (req, res, next) => {
    const isAuthenticated = req.isAuthenticated();
    if (!isAuthenticated) {
        const errorMessage = req.flash('error')[0];
        return res.render('login', {
            user: req.user,
            errorMessage,
            title: 'Login'
        });
    }else {
        const userId = req.params.userId;
        const annonces = await Annonce.find({ idUser: userId });
        res.render('annonces', {
            userId,
            annonces,
            title: 'Mes Annonces',
            user: req.user,
            agent: true,
            mesAnnonces: true,
            currentPage: 'mesAnnonces'
        });
    }
};

//affiché le détail d'une annonce
exports.getDetailsAnnonce = async (req, res, next) => {
    const annonceId = req.params.annonceId;
    try {
        const annonce = await Annonce.findById(annonceId);

        if (!annonce) {
            return res.status(404).render('error', { errorMessage: 'Annonce non trouvée' });
        }

        res.render('detail-annonce', { user: req.user, annonce, title: 'Détail annonce' });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

//update d'une annonce
exports.getUpdateAnnonceForm = async (req, res, next) => {
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

            if (!annonce) {
                return res.status(404).send('Annonce non trouvée.');
            }

            res.render('edit-annonce', { annonce, title: 'Update Annonce', user: req.user });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'annonce pour la modification', error);
            next(error);
        }
    }
};

exports.updateAnnonce = async (req, res, next) => {
    const annonceId = req.params.annonceId;

    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).send('Le formulaire est vide.');
        }
        const { titre, typeBien, statutPublication, statutBien, description, prix, dateDisponibilite } = req.body;

        const photos = req.files.map((file) => {
            const photoUrl = `/images/${file.filename}`;
            return {
                url: photoUrl,
                filename: file.filename,
            };
        });

        const filter = { _id: annonceId };
        const update = {
            titre,
            typeBien,
            statutPublication,
            statutBien,
            description,
            prix,
            dateDisponibilite,
            $push: { photos: { $each: photos } },
        };

        const updatedAnnonce = await Annonce.findByIdAndUpdate(
            filter,
            update,
            { new: true, runValidators: true }
        );

        if (updatedAnnonce) {
            res.redirect(`/annonce/${annonceId}`);
        } else {
            res.status(404).send('Annonce non trouvée.');
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'annonce', error);
        next(error);
    }
};

const supprimerQuestionsReponses = async (annonceId) => {
    try {
        // Recherchez toutes les questions liées à l'annonce
        const questions = await Question.find({ annonce: annonceId });

        // Supprimez les réponses associées à ces questions
        for (const question of questions) {
            await Reponse.deleteMany({ question: question._id });
        }

        // Supprimez les questions associées à l'annonce
        await Question.deleteMany({ annonce: annonceId });
    } catch (error) {
        console.error('Erreur lors de la suppression des questions/réponses associées à l\'annonce', error);
    }
};

//Supprimer une annonce
exports.deleteAnnonce = async (req, res, next) => {
    const annonceId = req.params.annonceId;

    try {
        await Annonce.findByIdAndDelete(annonceId);
        await supprimerQuestionsReponses(annonceId); // Assurez-vous d'importer la fonction supprimerQuestionsReponses
        res.status(200).send("L'annonce a été supprimée avec succès.");
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'annonce', error);
        res.status(500).send("Une erreur s'est produite lors de la suppression de l'annonce.");
    }
};

//supprimer une photo d'une annonce
exports.deleteAnnoncePhoto = async (req, res, next) => {
    try {
        const annonceId = req.params.annonceId;
        const photoIndex = req.params.photoIndex;

        // Récupérez l'annonce de la base de données
        const annonce = await Annonce.findById(annonceId);

        if (!annonce) {
            return res.status(404).send('Annonce non trouvée.');
        }

        // Assurez-vous que photoIndex est un index valide dans le tableau photos
        if (photoIndex < 0 || photoIndex >= annonce.photos.length) {
            return res.status(400).send('Index de photo invalide.');
        }

        // Supprimez la photo à l'index spécifié dans le tableau d'annonce.photos
        annonce.photos.splice(photoIndex, 1);

        // Sauvegardez l'annonce mise à jour dans la base de données
        const updatedAnnonce = await annonce.save();

        res.sendStatus(204); // Réponse de succès sans contenu
    } catch (error) {
        console.error('Erreur lors de la suppression de la photo.', error);
        res.status(500).send('Une erreur s\'est produite lors de la suppression de la photo.');
    }
};


//Recherche d'annonces
exports.getRechercheAnnonces = async (req, res, next) => {
    try {
        const { titre, typeBien, statutBien, prixMin, prixMax, dateDisponibilite } = req.query;

        const filter = {};

        // ajoutez des filtres en fonction des valeurs sélectionnées dans le formulaire
        if (typeBien) {
            filter.typeBien = typeBien;
        }
        if (statutBien) {
            filter.statutBien = statutBien;
        }
        if (prixMin) {
            filter.prix = { $gte: prixMin };
        }
        if (prixMax) {
            filter.prix = { ...filter.prix, $lte: prixMax };
        }
        if (dateDisponibilite) {
            filter.dateDisponibilite = { $gte: new Date(dateDisponibilite) };
        }
        if (titre) {
            filter.titre = { $regex: new RegExp(titre, 'i') };
        }

        // Effectuez la recherche en utilisant le filtre
        const annonces = await Annonce.find(filter);

        // Vérifiez si l'utilisateur est connecté et obtenez son rôle
        const isAuthenticated = req.isAuthenticated();
        const userRole = req.user ? req.user.role : null;

        const currentURL = req.originalUrl; // Récupérez l'URL actuelle
        let renderData = {
            annonces,
            user: req.user,
            title: 'Annonces',
            currentPage: 'annonces'
        };

        if (isAuthenticated) {
            if (userRole === 'AGENT' && currentURL.endsWith('/mes-annonces')) {
                renderData.agent = true;
                renderData.mesAnnonces = true;
                renderData.currentPage = 'mesAnnonces';
            }
        }

        res.render('annonces', renderData);
    } catch (error) {
        console.error('Erreur lors de la recherche d\'annonces', error);
        next(error);
    }
};

//route pour permettre à un utilisateur de faire une recherche sur ces propres annonces
exports.getUserRechercheAnnonces = async (req, res, next) => {
    try {
        const isAuthenticated = req.isAuthenticated();

        if (!isAuthenticated) {
            const errorMessage = req.flash('error')[0];
            return res.render('login', {
                user: req.user,
                errorMessage,
                title: 'Login'
            });
        } else {
            const { typeAnnonce } = req.query;

            const userId = req.user._id;

            const filter = { idUser: userId };

            if (typeAnnonce) {
                if (typeAnnonce === 'publiée' || typeAnnonce === 'non publiée') {
                    filter.statutPublication = typeAnnonce;
                } else {
                    filter.statutBien = typeAnnonce;
                }
            }

            const annonces = await Annonce.find(filter);

            res.render('annonces', {
                annonces,
                user: req.user,
                title: 'Annonces',
                agent: true,
                mesAnnonces: true
            });
        }
    } catch (error) {
        console.error('Erreur lors de la recherche des annonces de l\'utilisateur', error);
        next(error);
    }
};