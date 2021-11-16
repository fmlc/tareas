const bd = require('./bd_connected');
const path = require('path');
const fs = require('fs-extra');
const { randomInt } = require('crypto');

CrearTarea = async (req) => {
    const data = {
        query: `SELECT F_TAREAS(1, ${req.session.usuario.id}, 0,  '${req.body.titulo}', '${req.body.descripcion}') AS RS`
    }
    return await bd.bd_query(data);
}

Tareas = async (req) => {
    const data = {
        query: `SELECT * FROM V_TAREAS  WHERE ID_USUARIO = '${req.session.usuario.id}'`
    }
    return await bd.bd_query(data);
}

ElimiarTareas = async(req)=>{
    const data = {
        query: `SELECT F_TAREAS(3, ${req.session.usuario.id}, ${req.params.id}) AS RS`
    }
    return await bd.bd_query(data);
}

VerTarea = async(req)=>{
    const data = {
        query: `SELECT * FROM V_TAREAS  WHERE ID  = '${req.body.id}'`,
        msg: 'SUCCESS',
        error: 'ERROR NO SE ENCONTRO LA TAREA'
    }
    return await bd.bd_query(data);
}

ModificarTarea = async(req)=>{
    const data = {
        query: `SELECT F_TAREAS(2, ${req.session.usuario.id}, ${req.params.id},  '${req.body.titulo}', '${req.body.descripcion}') AS RS`
    }
    return await bd.bd_query(data);
}

module.exports = { CrearTarea, Tareas, ElimiarTareas, VerTarea, ModificarTarea }