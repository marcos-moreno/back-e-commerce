const express = require('express');
const router = express.Router();
const productosModel = require("../models/AD/m_product"); 

router.get('/all', function (req, res, next) {
    productosModel
        .all(req.query)
        .then(productos => { 
            res.json(productos);
        }).catch(err => { 
            console.log(err);
            return res.status(200).send({status:"error",data:err});
        }); 
}); 

router.get('/imgByValue', function (req, res, next) { 
    productosModel
        .imgByValue(req.query.filter)
        .then(img => { 
            res.json(img);
        }).catch(err => { 
            return res.status(200).send({status:"error",data:err});
        }); 
});  

module.exports = router;