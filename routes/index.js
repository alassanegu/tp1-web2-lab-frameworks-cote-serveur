var express = require('express');
var router = express.Router();
router.get('/', async (req, res, next) => {
  res.render('index', { user : req.user,title:'Home Page',currentPage:'annonces' });
});

router.get('/error-page', async (req, res, next) => {
  res.render('error', { user : req.user,title:'Home Page',errorMessage: 'Annonce non trouvée' });
});


module.exports = router;

