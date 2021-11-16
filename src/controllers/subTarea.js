const bd = require('../models/subTareas');

crearSubTarea = async (req, res) => {
    if( req.body.descripcion.length < 3 ){
        msg = {
            ERROR : true,
            msg   : 'DEBE INGRESAR UNA DESCRIPCION CON MAS DE 3 CARACTERES'
        }
        req.flash('msg', msg);
        res.render('./subTareas/crear');
        return;
    }
    result = await bd.CrearSubTarea(req);
    if(result.ERROR){
        req.flash('msg', result);
        res.render('./subTareas/crear');
        return;
    }
    if(result.ERROR_CONSULTA){
        req.flash('msg', result);
        res.render('./subTareas/crear');
        return;
    }
    let rs = {};
    if (!result[0].rs){
        rs.ERROR = true;
        rs.msg = 'ERROR NO SE PUDO REGISTRAR LA SUB TAREA';
        req.flash('msg', rs);
        res.render('./subTareas/crear');
    } 
    rs.SUCCESS = true;
    rs.msg = 'SE REGISTROA LA NUEVA SUB TAREA';
    req.flash('msg', rs);
    res.redirect(`./${req.body.id}`);
}

SubTareas = async(req, res)=>{
    result = await bd.SubTareas(req);
    const tarea = result.tarea[0],
          subTareas = result.subTareas;
    if(tarea.ERROR){
        req.flash('msg', tarea);
    }
    if(subTareas.ERROR){
        req.flash('msg', subTareas);
    }
    res.render('./subTareas/index',{tarea, subTareas});
}

EliminarSubTarea = async (req, res) => {
    result = await bd.ElimiarSubTareas(req);
    let rs = {};
    if(result[0].rs){
        rs.SUCCESS = true;
        rs.msg = 'LA SUB TAREA SE ELIMINO';
    } else {
        rs.ERROR = true;
        rs.msg = 'ERROR NO SE PUDO ELIMINAR LA SUB TAREA';
    }
    req.flash('msg', rs);
    res.redirect(`/subTareas/${req.params.id_tarea}`);
}

VerSubTarea = async (req, res) => {
    result = await bd.VerSubTarea(req);
    if(result.ERROR){
        req.flash('msg', result);
    }
    res.render('./subTareas/modificar', {subTarea:result[0]});
}

ModificarSubTarea = async (req, res) => {
    result = await bd.ModificarSubTarea(req);
    if(result.ERROR){
        req.flash('msg', result);
        res.render('./subTareas/modificar');
        return;
    }
    if(result.ERROR_CONSULTA){
        req.flash('msg', result);
        res.render('./subTareas/modificar');
        return;
    }
    let rs = {};
    if(result[0].rs){
        rs.SUCCESS = true;
        rs.msg = 'SE MODIFICO LA SUB TAREA';
    } else {
        rs.ERROR = true;
        rs.msg = 'ERROR NO SE ENCONTRO LA SUB TAREA A MODIFICAR';
    }
    req.flash('msg', rs);
    res.redirect(`/subTareas/${req.body.id_tarea}`);
}

module.exports = { crearSubTarea, SubTareas, EliminarSubTarea, VerSubTarea, ModificarSubTarea }