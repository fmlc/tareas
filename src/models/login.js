const bd = require('./bd_connected');

getUsuario = async (req) => {
    const data = {
        query: `SELECT * FROM F_LOGIN('${req.body.usuario}','${req.body.password}')`
    }
    return await bd.bd_query(data);
}

postCreateUsuario = async (req) => {
    const data = {
        query: `SELECT F_NEWUSUARIO
        ('${req.body.nombre}', '${req.body.apellidos}', '${req.body.usuario}', '${req.body.password}') AS ID`
    }
    return await bd.bd_query(data);
}

module.exports = { postCreateUsuario, getUsuario }