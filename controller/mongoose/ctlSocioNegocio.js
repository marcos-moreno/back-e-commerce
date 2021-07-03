
const express = require('express');
const router = express.Router();
const secretKey = 'MGsecretkey$Adempiere$NodeJS&vueJS';
const jwt = require('jsonwebtoken'); 
const USER = require("../../models/AD/user");

router.get('/valida_credito', (req, res, next) => {
  let token = req.headers.token;  
  jwt.verify(token, secretKey, (err, decoded) => { 
    if (err){
      return res.status(200).json({ status: 'unauthorized'})
    }else{
        if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
        else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'});
        USER
        .RF_CreditValidate_Ecommerce(decoded.userId)
        .then(credito => { 
            return res.status(200).send({status:"success",data:credito});
        }).catch(err => { 
            console.log(err);
            return res.status(200).send({status:"error",data:err});
        });  
    }
  })
});
module.exports = router;