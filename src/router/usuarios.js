const router = require('express').Router();
const usuario = require('../controllers/usuario')

router.get('/', function (req, res) {
    res.send('index usuario /');
})

router.get('/perfil', usuario.checkUsuarioLogin, function (req, res) {
    const lg_session = req.session.usuario;
    res.render('./perfil', {lg_session});
})

router.post('/cambiarFoto', usuario.checkUsuarioLogin, usuario.UpdateFotoUsuario)

router.post('/cambiarPass', usuario.checkUsuarioLogin, usuario.UpdatePassUsuario)

router.get('/cerrar', usuario.checkUsuarioLogin, usuario.cerrar)

module.exports = router;