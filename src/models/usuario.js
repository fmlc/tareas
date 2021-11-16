const bd = require('./bd_connected');
const path = require('path');
const fs = require('fs-extra');
const { randomInt } = require('crypto');

UpdateFotoUsuario = async (req) => {
    let foto = 'foto';
    let destino = '';
    let tiempo = new Date();
    if (req.body.password != '') password = `, password = '${req.body.password}'`;
    if (req.files != null) {        
        foto = '/fotos/' + req.files.foto.md5 + Date.now() + path.extname(req.files.foto.name)
        destino = path.join(path.dirname(__dirname), 'public') + foto
        req.session.usuario.foto = foto
        foto = `'${foto}'`;
        
    }
    const data = {
        query:`SELECT F_UPDATEUSUARIO (${req.session.usuario.id}, '',${foto}) AS RS`,
    }
    const result = await bd.bd_query(data);
    if (result[0].rs) {
        if (foto != 'foto') {
            fs.rename(req.files.foto.tempFilePath, destino, err => {
                if (err) return console.error(err)
            })
        }
    }
    return result;
}

UpdatePassUsuario = async (req) => {
    let password = req.body.password;
    const data = {
        query: `SELECT F_UPDATEUSUARIO (${req.session.usuario.id},'${password}') AS RS`,
    }
    return await bd.bd_query(data);
}

module.exports = { UpdateFotoUsuario, UpdatePassUsuario }