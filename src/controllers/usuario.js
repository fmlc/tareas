const bd = require('../models/usuario');
const path = require('path');
const { match } = require('assert');

UpdateFotoUsuario = async (req, res) => {
    if (req.files != null) {
        if (req.files.foto.mimetype === 'image/jpeg' || req.files.foto.mimetype === 'image/png') {
            const result = await bd.UpdateFotoUsuario(req);
            let rs = {};
            if (result[0].rs) {
                rs.SUCCESS = true;
                rs.msg = 'LOS DATOS FUERON ACTUALIZADOS';
            } else {
                rs.ERROR = true;
                rs.msg = 'ERROR LA FOTOGRAFIA NO CUMPLE CON LOS PARAMETROS';
            }
            req.flash('msg', rs);
            res.redirect('./perfil');
        } else {
            let msg = {
                ERROR: true,
                msg: 'LA IMAGEN DEBE SER JPG O PNG'
            }
            req.flash('msg', msg);
            res.redirect('./perfil');
        }
    } else {
        let msg = {
            ERROR: true,
            msg: 'DEBE SELECCIONAR UNA IMAGEN'
        }
        req.flash('msg', msg);
        res.redirect('./perfil');
    }
}

UpdatePassUsuario = async (req, res) => {
    if (req.body.password != '') {
        let rs = {};
        if (req.body.password.length < 3) {
            rs.ERROR = true;
            rs.msg = 'ERROR LA NUEVA CONTRASEÑA DEBE TENER MINIMO 3 CARACTERES';
        } else {
            const result = await bd.UpdatePassUsuario(req);
            if (result[0].rs) {
                rs.SUCCESS = true;
                rs.msg = 'LOS DATOS FUERON ACTUALIZADOS';
            } else {
                rs.ERROR = true;
                rs.msg = 'ERROR LA NUEVA CONTRASEÑA NO CUMPLE CON LOS PARAMETROS';
            }
        }
        req.flash('msg', rs);
        res.redirect('./perfil');
    } else {
        let msg = {
            ERROR: true,
            msg: 'ERROR DEBE INGRESAR COMO MINIMO 3 CARACTERES'
        }
        req.flash('msg', msg);
        res.redirect('./perfil');

    }
}

checkUsuarioLogin = (req, res, next) => {
    if (req.session.usuario == undefined) {
        res.redirect('/login');
    }
    req.flash('session', req.session.usuario);
    next();
}

cerrar = (req, res) => {
    delete req.session.usuario;
    req.flash('session', false);
    res.redirect('/login');
}

module.exports = { UpdateFotoUsuario, checkUsuarioLogin, UpdatePassUsuario, cerrar }