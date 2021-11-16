//const bd = require('../models/bd_connected');
const bd = require('../models/login');

postCreateUsuario = async (req, res) => {
    result = await bd.postCreateUsuario(req);
    let rs = {};
    if (!result[0].id == -1){
        rs.ERROR = true;
        rs.msg = 'ERROR USUARIO YA EXISTENTE, INSERTO OTRO USUARIO';
    } else {
        rs.SUCCESS = true;
        rs.msg = 'REGISTRO DE USUARIO EXITOSO';
    }
    req.flash('msg', rs)
    if (rs.SUCCESS) {
        const usuario = {
            id       : result[0].id,
            nombre   : req.body.nombre,
            apellidos: req.body.apellidos,
            foto     : '/fotos/default.png',
            status   : 'A'
        }
        req.session.usuario = usuario;
        res.redirect('/usuarios/perfil')
    }
    else {
        res.render('CreateUsuario')
    }
}

getUsuario = async (req, res) => {
    result = await bd.getUsuario(req);
    if (result.ERROR_CONSULTA) {
        req.flash('msg', result)
        res.render('login');
        return;
    }
    if (result.ERROR) {
        req.flash('msg', result)
        res.render('login');
        return;
    }
    if (!result[0].rs) {
        req.flash('msg', result[0])
        res.render('login');
    }
    else {
        req.session.usuario = result[0]
        if (req.session.usuario.foto == null) {req.session.usuario.foto = '/fotos/default.png'}
        res.redirect('/tareas')
    }
}

login = (req, res) => {
    if(req.session){
        if(req.session.usuario)
        {
            res.redirect('/usuarios/perfil')
        }
    }   
    res.render('login'); 
}

module.exports = { postCreateUsuario, getUsuario, login }