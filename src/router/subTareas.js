const router = require('express').Router();
const usuario = require('../controllers/usuario')
const tareas = require('../controllers/subTarea')

router.get('/:id', usuario.checkUsuarioLogin, tareas.SubTareas)

router.get('/crear/:id', usuario.checkUsuarioLogin, (req, res) => {
    res.render('./subTareas/crear', {id: req.params.id});
})

router.post('/crear', usuario.checkUsuarioLogin, tareas.crearSubTarea)

router.post('/ver', usuario.checkUsuarioLogin, tareas.VerSubTarea)

router.put('/modificar/', usuario.checkUsuarioLogin, tareas.ModificarSubTarea)

router.delete('/:id_tarea&:id', usuario.checkUsuarioLogin, tareas.EliminarSubTarea)

module.exports = router