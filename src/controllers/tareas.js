const bd = require('../models/tareas');

crearTarea = async (req, res) => {
    let rs = {};
    if (req.body.titulo.length < 3) {
        rs = {
            ERROR: true,
            msg: 'DEBE INGRESAR UN TITULO CON MAS DE 3 CARACTERES'
        }
        req.flash('msg', rs);
        res.render('./tareas/crear');
        return;
    }
    if (req.body.descripcion.length < 3) {
        rs = {
            ERROR: true,
            msg: 'DEBE INGRESAR UNA DESCRIPCION CON MAS DE 3 CARACTERES'
        }
        req.flash('msg', rs);
        res.render('./tareas/crear');
        return;
    }
    result = await bd.CrearTarea(req);
    if (!result[0].rs) {
        rs.ERROR = true;
        rs.msg = 'ERROR NO SE PUDO REGISTRAR LA TAREA';
        req.flash('msg', rs);
        res.render('./tareas/crear');
    }
    rs.SUCCESS = true;
    rs.msg = 'SE REGISTROA LA NUEVA TAREA';
    req.flash('msg', rs);
    res.redirect('./');
}

Tareas = async (req, res) => {
    tareas = await bd.Tareas(req);
    res.render('./tareas/index', { tareas });
}

EliminarTarea = async (req, res) => {
    result = await bd.ElimiarTareas(req);
    let rs = {};
    if (!result[0].rs) {
        rs.ERROR = true;
        rs.msg = 'ERROR NO SE PUDO ELIMINAR LA TAREA';
    } else {
        rs.SUCCESS = true;
        rs.msg = 'LA TAREA SE ELIMINO';
    }
    req.flash('msg', rs);
    res.redirect('/tareas/');
}

VerTarea = async (req, res) => {
    result = await bd.VerTarea(req);
    if (result.ERROR) {
        req.flash('msg', result);
    }
    res.render('./tareas/modificar', { tarea: result[0] });
}

ModificarTarea = async (req, res) => {
    let rs = {};
    let tarea = {
        id: req.params.id,
        titulo: req.body.titulo,
        descripcion: req.body.descripcion
    };
    if(req.body.titulo.length < 3){
        rs.ERROR = true;
        rs.msg = 'ERROR EL TITULO DEBE TENER MINIMO 3 CARACTERES';        
        req.flash('msg', rs);
        res.render('./tareas/modificar', { tarea });
        return;
    }
    if(req.body.descripcion.length < 3){
        rs.ERROR = true;
        rs.msg = 'ERROR LA DESCRIPCION DEBE TENER MINIMO 3 CARACTERES';
        req.flash('msg', rs);
        res.render('./tareas/modificar', { tarea });
        return;
    }
    result = await bd.ModificarTarea(req);
    if (!result[0].rs) {
        rs.ERROR = true;
        rs.msg = 'ERROR NO SE ENCONTRO LA TAREA A MODIFICAR';
    } else {
        rs.SUCCESS = true;
        rs.msg = 'SE MODIFICO LA TAREA';
    }
    req.flash('msg', rs);
    res.redirect('/tareas/');
}

module.exports = { crearTarea, Tareas, EliminarTarea, VerTarea, ModificarTarea }