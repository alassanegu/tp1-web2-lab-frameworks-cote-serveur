const mongoose = require("mongoose");
const authentification = require('../controllers/authenticationController');
const httpMocks = require('node-mocks-http');

const Account = require('../models/account')
const passport = require("passport");

describe("Authentification controller", () => {
    beforeAll(async () => {
        // Établissez la connexion à la base de données MongoDB avant les autres tests
        await mongoose.connect("mongodb://localhost:27017/AgenceImmobilierBD", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        // Fermez la connexion à la base de données après les tests
        await mongoose.connection.close();
    });

    /*it("devrait se connecter à la base de données avec succès", async () => {
        // Vérifiez si la connexion est réussie
        expect(mongoose.connection.readyState).toBe(1); // 1 signifie "connecté"
    });*/



    describe('GET /register', () => {
        it('devrait rendre la vue "register" avec les paramètres appropriés', () => {
            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            // Appelez la méthode getRegister avec les objets de requête et de réponse simulés
            authentification.getRegister(req, res);

            // Vérifiez si la vue "register" a été rendue
            expect(res._getRenderView()).toBe('register');

            // Vérifiez si les paramètres de la vue sont corrects
            expect(res._getRenderData()).toEqual({
                user: req.user,
                title: 'register'
            });
            // Vérifiez le statut de la réponse (200 OK)
            expect(res.statusCode).toBe(200);
        });
    });

    describe('POST /register', () => {
        it('devrait réussir l\'inscription d\'un nouvel utilisateur', async () => {
            const req = httpMocks.createRequest({
                body: {
                    username: 'mami@gmail.com',
                    password: 'mmmm',
                    role: 'AGENT',
                },
            });
            const res = httpMocks.createResponse();
            const nextFunction = jest.fn();

            await authentification.register(req, res, nextFunction);

            expect(res.statusCode).toBe(200);

            const userId = res.locals.userId ;
            // Vérifiez que la redirection est effectuée vers la page d'accueil avec l'ID de l'utilisateur
            //expect(res._getRedirectUrl()).toBe(`/accueil/${userId}`); //
        });

        it('devrait échouer l\'inscription si l\'utilisateur existe déjà', async () => {
            const req = httpMocks.createRequest({
                body: {
                    username: 'mami@gmail.com',
                    password: 'mmmmm',
                    role: 'USER',
                },
            });
            const res = httpMocks.createResponse();

            // Simulez la présence d'un utilisateur existant dans la base de données
            jest.spyOn(Account, 'findOne').mockResolvedValue({ username: 'mami@gmail.com' });
            const nextFunction = jest.fn();

            await authentification.register(req, res, nextFunction);

            expect(res.statusCode).toBe(200); // Code de succès (pas de redirection)
            expect(res._getRenderView()).toBe('register'); // Rendu de la vue 'register'
            expect(res._getRenderData().errorMessage).toBe('Ce compte existe déja');
        });

        it('devrait échouer l\'inscription en cas d\'erreur', async () => {
            const req = httpMocks.createRequest({
                body: {
                    username: 'mamita',
                    password: 'mamitamdp',
                    role: 'USER',
                },
            });
            const res = httpMocks.createResponse();
            const nextFunction = jest.fn();
            // Simulez une erreur lors de l'inscription en utilisant jest.spyOn
            jest.spyOn(Account, 'register').mockImplementation((username, password, callback) => {
                callback(new Error('Erreur lors de l\'inscription'));
            });

            await authentification.register(req, res, nextFunction);

            expect(res.statusCode).toBe(200);
            expect(res._getRenderData().error).toBe('Erreur lors de l\'inscription');
        });

    });
    describe('GET login', () => {
        it('devrait rendre la page de connexion', async () => {
            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            // simuler un message d'erreur (si nécessaire)
            req.flash = jest.fn(() => ['Erreur de connexion']);
            authentification.getLogin(req, res);
            // Vérifiez que la vue de la page de connexion est rendue
            expect(res._getRenderView()).toBe('login');
        });
    });

    describe('POST login', () => {

            it('devrait rediriger vers la page d\'accueil après une authentification réussie', async () => {
                const req = httpMocks.createRequest();
                const res = httpMocks.createResponse();

                // Créez un espion (spy) pour intercepter l'appel à passport.authenticate
                const authenticateSpy = jest.spyOn(passport, 'authenticate');

                req.user = { _id: '123' };
                // Appelez votre fonction de login
                await authentification.login(req, res);

                // Vérifiez que passport.authenticate a été appelé avec les bons arguments
                expect(authenticateSpy).toHaveBeenCalledWith('local', {
                    failureRedirect: '/login',
                    failureFlash: true,
                });

                // Vérifiez que la redirection est effectuée vers la page d'accueil avec l'ID de l'utilisateur
                expect(res.statusCode).toBe(302);
                expect(res._getRedirectUrl()).toBe('/accueil/123');
            });

            it('devrait rediriger vers la page de connexion en cas d\'authentification échouée', async () => {
                const req = httpMocks.createRequest();
                const res = httpMocks.createResponse();

                // Créez un espion (spy) pour intercepter l'appel à passport.authenticate
                const authenticateSpy = jest.spyOn(passport, 'authenticate');

                req.user = { _id: '123' };
                // Appelez votre fonction de login
                await authentification.login(req, res);


                // Vérifiez que passport.authenticate a été appelé avec les bons arguments
                expect(authenticateSpy).toHaveBeenCalledWith('local', {
                    failureRedirect: '/login',
                    failureFlash: true,
                });

                // Vérifiez que la redirection est effectuée vers la page de connexion
                expect(res.statusCode).toBe(302); // Code de statut de redirection
                expect(res._getRedirectUrl()).toBe('/login'); // Assurez-vous que la redirection est correcte
            });
    });

    describe('GET logout', () => {
        it('devrait déconnecter l\'utilisateur et le rediriger vers la page d\'accueil', async () => {
            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();
            // Créez un espion (spy) pour intercepter l'appel à req.logout
            const logoutSpy = jest.spyOn(req, 'logout');
            await authentification.getLogout(req, res);

            // Vérifiez que req.logout a été appelé
            expect(logoutSpy).toHaveBeenCalled();

            // Vérifiez que la redirection est effectuée vers la page d'accueil
            expect(res.statusCode).toBe(200);
            expect(res._getRedirectUrl()).toBe('/');
        });
    });
});