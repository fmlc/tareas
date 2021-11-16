const bd = require('./bd_connected');
const path = require('path');
const fs = require('fs-extra');
const { randomInt } = require('crypto');
const { Tareas } = require('./tareas');

CrearSubTarea = async (req) => {
    const data = {
        query: `SELECT F_SUB_TAREAS(1,${req.body.id}, 0, '${req.body.descripcion}') AS RS`
    }
    console.log(data);
    return await bd.bd_query(data);
}

SubTareas = async (req) => {
    let data = {
        query: `SELECT * FROM v_tareas WHERE ID = '${req.params.id}' ORDER BY ID`,
        error: 'ERROR NO SE ENCONTRO LA TAREA'
    }
    tarea =  await bd.bd_query(data);
    data = {
        query: `SELECT * FROM V_SUBTAREAS WHERE ID_TAREA = ${req.params.id} ORDER BY ID`,
        error: 'ERROR NO SE ENCONTRARON SUB TAREAS'
    }
    subTareas =  await bd.bd_query(data);
    return { tarea, subTareas};
}

ElimiarSubTareas = async(req)=>{
    const data = {
        query: `SELECT F_SUB_TAREAS(3, ${req.params.id_tarea}, '${req.params.id}') AS RS`
    }
    return await bd.bd_query(data);
}

VerSubTarea = async(req)=>{
    const data = {
        query: `SELECT * FROM V_SUBTAREAS WHERE ID  = '${req.body.id}' AND ID_TAREA = ${req.body.id_tarea}`,
        msg: 'SUCCESS',
        error: 'ERROR NO SE ENCONTRO LA SUB TAREA'
    }
    return await bd.bd_query(data);
}

ModificarSubTarea = async(req)=>{
    const data = {
        query: `SELECT F_SUB_TAREAS(2, ${req.body.id_tarea}, ${req.body.id}, '${req.body.descripcion}') AS RS`
    }
    return await bd.bd_query(data);
}

module.exports = { CrearSubTarea, SubTareas, ElimiarSubTareas, VerSubTarea, ModificarSubTarea }