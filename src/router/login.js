const router = require('express').Router();
const login = require('../controllers/login')
const path = require('path');

router.get('/', login.login)

router.post('/', login.getUsuario)

router.get('/CreateUsuario', function (req, res) {
    res.render('CreateUsuario');
})

router.post('/CreateUsuario', login.postCreateUsuario)

router.get('/perfil', function (req, res) {
    res.send('pag login /');
})

router.get('/usuario', function (req, res) {
    res.send('index usuario222 /');
})

module.exports = router;