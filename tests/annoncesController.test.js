const annonce = require('../controllers/annoncesController');
const httpMocks = require('node-mocks-http');

const Account = require('../models/account')
const passport = require("passport");

describe('GET add-annonce', () => {
    it('devrait rendre la page "add-annonce" si l\'utilisateur est authentifié', () => {
        const req = httpMocks.createRequest({ isAuthenticated: true });
        const res = httpMocks.createResponse();
        req.isAuthenticated = jest.fn(() => true);

        // Appelez la méthode getAddAnnonceForm avec les objets de requête et de réponse simulés
        annonce.getAddAnnonceForm(req, res);

        // Vérifiez si la vue "add-annonce" a été rendue
        expect(res._getRenderView()).toBe('add-annonce');

        // Vérifiez si les paramètres de la vue sont corrects
        expect(res._getRenderData()).toEqual({
            user: req.user,
            title: 'user home page'
        });

        // Vérifiez le statut de la réponse (200 OK)
        expect(res.statusCode).toBe(200);
    });

    it('devrait rediriger vers la page de connexion si l\'utilisateur n\'est pas authentifié', () => {
        const req = httpMocks.createRequest({ isAuthenticated: false });
        const res = httpMocks.createResponse();
        req.isAuthenticated = jest.fn(() => false);
        // Simulez un message d'erreur (si nécessaire)
        req.flash = jest.fn(() => ['Erreur de connexion']);

        // Appelez la méthode getAddAnnonceForm avec les objets de requête et de réponse simulés
        annonce.getAddAnnonceForm(req, res);

        // Vérifiez si la vue "login" a été rendue
        expect(res._getRenderView()).toBe('login');

        // Vérifiez si les paramètres de la vue sont corrects
        expect(res._getRenderData()).toEqual({
            user: req.user,
            errorMessage: 'Erreur de connexion',
            title: 'Login'
        });

        // Vérifiez le statut de la réponse (200 OK)
        expect(res.statusCode).toBe(200);
    });

});

describe('POST /add-annonce', () => {
    it('devrait ajouter avec succès une nouvelle annonce si l\'utilisateur est authentifié', async () => {

        const req = httpMocks.createRequest({
            body: {
                titre: 'Nouvelle Annonce',
                typeBien: 'vente',
                statutPublication: 'publiée',
                description: 'Description de l\'annonce',
                prix: 100000,
                dateDisponibilite: '2023-10-10',
                photos: [
                    { url:'/images/photo1.png' ,filename: 'photo1.jpg' },
                    { url:'/images/photo2.png', filename: 'photo2.jpg' },
                ],
            },
        });
        const res = httpMocks.createResponse();
        req.isAuthenticated = jest.fn(() => true);
        await annonce.addAnnonce(req, res);

        expect(res.statusCode).toBe(302);

        expect(res._getRedirectUrl()).toBe('/annonce/123');
    });

    it('should redirect to the login page if user is not authenticated', async () => {
        const req = httpMocks.createRequest({ isAuthenticated: false });
        const res = httpMocks.createResponse();

        req.flash = jest.fn(() => ['Login error']);

        await annonce.addAnnonce(req, res);

        expect(res._getRenderView()).toBe('login');
    });

    it('should handle errors when adding an annonce', async () => {
        const req = httpMocks.createRequest({
            isAuthenticated: true,
            body: {
                titre: 'Nouvelle Annonce',
                typeBien: 'vente',
                statutPublication: 'publiée',
                description: 'Description de l\'annonce',
                prix: 100000,
                dateDisponibilite: '2023-10-10',
                photos: [
                    { url:'/images/photo1.png' ,filename: 'photo1.jpg' },
                    { url:'/images/photo2.png', filename: 'photo2.jpg' },
                ],
            },
        });
        const res = httpMocks.createResponse();

        await annonce.addAnnonce(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getRenderData().errorMessage).toBe(
            'Une erreur s\'est produite lors de la création de l\'annonce.'
        );
    });
});