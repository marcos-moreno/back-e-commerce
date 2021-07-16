const express = require('express');
const router = express.Router();
const SeguimientoPedido = require("../../models/AD/SeguimientoPedido"); 
const jwt = require('jsonwebtoken');
const secretKey = 'MGsecretkey$Adempiere$NodeJS&vueJS';

router.get('/search_orden', function (req, res, next) {
    if (req.query.code_seguridad == 55632) {
        SeguimientoPedido
        .search_orden(req.query)
        .then(productos => { 
            res.json(productos);
        }).catch(err => { 
            console.log(err);
            return res.status(200).send({status:"error",data:err});
        }); 
    }else{
        return res.status(200).json({ status: 'unauthorized'})
    }
   
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
 
module.exports = router;