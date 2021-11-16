const router = require('express').Router();
const usuario = require('../controllers/usuario')
const tareas = require('../controllers/tareas')

router.get('/', usuario.checkUsuarioLogin, tareas.Tareas)

router.get('/crear', usuario.checkUsuarioLogin,(req, res) => {
    res.render('./tareas/crear');
})

router.post('/crear', usuario.checkUsuarioLogin, tareas.crearTarea)

router.post('/ver', usuario.checkUsuarioLogin, tareas.VerTarea)

router.put('/modificar/:id', usuario.checkUsuarioLogin, tareas.ModificarTarea)

router.delete('/:id', usuario.checkUsuarioLogin, tareas.EliminarTarea)

module.exports = router