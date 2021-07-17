const express = require('express');
const router = express.Router();
const SeguimientoPedido = require("../../models/AD/SeguimientoPedido"); 
const jwt = require('jsonwebtoken');
const secretKey = 'MGsecretkey$Adempiere$NodeJS&vueJS'; 
const sequens = require('../../models/mongoose/sequens');

router.get('/search_orden', async function (req, res, next) {
    sequens.find({"nombre" : "acceso_solicitud"},async  (err, code) => {
        if (err) return res.status(200).json({ status: 'unauthorized',data:err});
        if (!code) return res.status(200).json({ status:"unauthorized", data:[]}); 

        if (req.query.code_seguridad == code[0].value) {

            let entregasArray = await SeguimientoPedido
            .search_orden(req.query)
            .then(entregas => {
                return entregas;
            }).catch(err => { 
                console.log(err);
                return res.status(200).send({status:"error",data:err});
            }); 
           
            if (entregasArray.status == "success") {
                entregasArray = entregasArray.data; 
                for (let index = 0; index < entregasArray.length; index++) {
                    entregasArray[index].estados = 
                    await SeguimientoPedido
                    .search_estados_entrega({m_inout_id: entregasArray[index].m_inout_id})
                    .then(estados => { 
                        if (estados.status == "success") {
                            return estados.data;
                        }else{
                            return [];
                        } 
                    }).catch(err => {  
                        console.log(err);
                        return [];
                    }); 
                }  
            }  
            return res.status(200).json({ status: 'success',data:entregasArray}) 
        }else{
            return res.status(200).json({ status: 'unauthorized'})
        }
        
    });  
}); 

router.get('/entregas', function (req, res, next) {
    let token = req.headers.token;
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err){
            return res.status(200).json({ status: 'unauthorized'})
        }else{
            if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
            else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'});
            SeguimientoPedido
            .search_entrega(req.query)
            .then(entregas => {
                res.json(entregas);
            }).catch(err => { 
                console.log(err);
                return res.status(200).send({status:"error",data:err});
            }); 
        }
    }) 
}); 
 
router.get('/catalogo_estados', function (req, res, next) { 
    SeguimientoPedido
    .getEstados(req.query)
    .then(estados => {
        res.json(estados);
    }).catch(err => { 
        console.log(err);
        return res.status(200).send({status:"error",data:err});
    });   
}); 

// User purchase
router.get('/estados', function (req, res, next) {
    let token = req.headers.token;
    jwt.verify(token, secretKey, (err, decoded) => {
    if (err){
        return res.status(200).json({ status: 'unauthorized'})
    }else{
        if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
        else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'});
        SeguimientoPedido
        .search_estados_entrega(req.query)
        .then(entregas => { 
            res.json(entregas);
        }).catch(err => { 
            console.log(err);
            return res.status(200).send({status:"error",data:err});
        }); 
    }
  }) 
}); 

router.post('/insert_estado_seguimiento',async (req, res, next) => {
    sequens.find({"nombre" : "acceso_solicitud"},async  (err, code) => {
        if (err) return res.status(200).json({ status: 'unauthorized',data:err});
        if (!code) return res.status(200).json({ status:"unauthorized", data:[]}); 
        if (req.body.code_seguridad == code[0].value) {
            const parameters = [
                req.body.c_order_id // <<< c_order_id  
                ,req.body.m_inout_id // <<< m_inout_id 
                ,req.body.rf_statusorder// <<< rf_statusorder
            ]; 
            const estado = await SeguimientoPedido.insert_rf_ecommerce_orderstatus(parameters);  
            return res.status(200).json(estado)
        }else{
            return res.status(200).json({ status: 'unauthorized'})
        }
        
    });  
    
}); 

  
module.exports = router;