const bd = require('pg');
const config = {
    host: process.env.SERVER,
    user: process.env.SERVER_BD_USER,
    password: process.env.SERVER_BD_PASSWORD,
    database: process.env.SERVER_BD,
    port: process.env.SERVER_BD_PORT
}

bd_connected = async () => {
    try {
        const Client = new bd.Client(config);
        await Client.connect();
        return Client
    } catch (error) {
        return { type: 'ERROR_SERVER', msg: 'ERROR EN LA CONFIGURACION AL SERVIDOR BD', result: error.message }
    }
}

bd_query = async (data) => {
    let msg = data.msg || 'REGISTRO'
    let error = data.error || 'ERROR'
    try {
        const Client = new bd.Client(config);
        await Client.connect();
        try {
            const result = await Client.query(data.query) 
            Client.end();
            if (result.rowCount === 0 && result.command != 'SELECT') {
                return { ERROR: true, msg: data.error }
            }
            if (result.command == 'SELECT') return  result.rows ;
            return { SUCCESS: true, msg}
        } catch (er) {
            return { ERROR_CONSULTA: true, msg: error, error: er.message }
        }
    } catch (e) {
        return { ERROR_SERVER: true, msg: 'ERROR EN LA CONFIGURACION AL SERVIDOR BD', error: e.message }
    }
}

module.exports = { bd_connected, bd_query }