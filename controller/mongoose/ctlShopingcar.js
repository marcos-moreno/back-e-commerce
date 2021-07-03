
const express = require('express');
const router = express.Router();
const secretKey = 'MGsecretkey$Adempiere$NodeJS&vueJS';
const jwt = require('jsonwebtoken');
const Shopingcar = require('../../models/mongoose/shopingcar');
const productosModel = require("../../models/AD/m_product");
 
router.get('/get_auth', (req, res, next) => {
    let token = req.headers.token;  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err){
          return res.status(200).json({ status: 'unauthorized'})
      }else{
        if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
        else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'})

        Shopingcar.find({ ad_user_id : decoded.userId }, 
          (err, car) => {
          if (err) return res.status(200).json({ status: 'unauthorized',data:err});
          if (!car) return res.status(200).json({ status:"success", data:""});
          return res.status(200).json({status:"success", data: car})
        }); 
      } 
  })
});

router.get('/getcomplete_auth', (req, res, next) => {
  let token = req.headers.token;  
  jwt.verify(token, secretKey, (err, decoded) => {  
    if (err){
        return res.status(200).json({ status: 'unauthorized'})
    }else{ 
      if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
      else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'})

      Shopingcar.find({ ad_user_id : decoded.userId }, 
        async function(err, producto){
        if (err) return res.status(200).json({ status: 'unauthorized',data:err});
        if (!producto) return res.status(200).json({ status:"success", data:""});
        
        let carcompuesto = [];
        for (let index = 0; index < producto.length; index++) {
          const element = producto[index];
          let prod = await productosModel.one(element.value)
          .then(product => {
            return product;
          }).catch(err => {
            return false;
          }); 
          if (prod != false && prod.status == 'success') {
            let arr = prod.data[0];
            arr.cantidad = element.cantidad;   
            carcompuesto.push(arr); 
          }
        }
        return res.status(200).json({status:"success", data: carcompuesto})
      }); 
    }
})
});

router.put('/updatebyvalue_auth', (req, res, next) => { 
  let token = req.headers.token;
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err){
        return res.status(200).json({ status: 'unauthorized'})
    }else{ 
      if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
      else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'})
            
      Shopingcar.updateOne(
        {value : req.body.value, ad_user_id:decoded.userId}
        ,{cantidad: req.body.cantidad})
      .then((rawResponse) => { 
        return res.status(200).json({status:"success", data: rawResponse});
      }).catch((err) => {
        return res.status(200).json({ status:"error", data:err})
      });
    }
  })
}); 

router.delete('/deletebyvalue_auth', (req, res, next) => { 
  let token = req.headers.token;
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err){
        return res.status(200).json({ status: 'unauthorized'})
    }else{
      if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
      else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'})

      Shopingcar.deleteOne(
        {value : req.body.value, ad_user_id:decoded.userId}
        ,{})
      .then((rawResponse) => { 
        return res.status(200).json({status:"success", data: rawResponse});
      }).catch((err) => {
        return res.status(200).json({ status:"error", data:err})
      });
    }
  })
});

router.post('/add_auth', (req, res, next) => { 
  let token = req.headers.token;  
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err){
        return res.status(200).json({ status: 'unauthorized'})
    }else{
      if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
      else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'})

      Shopingcar.findOne({ value : req.body.value, ad_user_id:decoded.userId }, 
        (err, car) => {
        if (err) return res.status(200).json({ status: 'unauthorized',data:err});
        if (!car){ 
          var shopingcar = new Shopingcar({
            value : req.body.value,
            cantidad: req.body.cantidad,
            ad_user_id : decoded.userId
          }); 
          shopingcar.save(function(err, doc) {
            if (err) return res.status(200).json({ status:"error", data:err});
            return res.status(200).json({status:"success", data: doc})
          });
        }else{
          Shopingcar.updateOne(
            {value : req.body.value, ad_user_id:decoded.userId}
            ,{cantidad: parseInt(car.cantidad)  + parseInt(req.body.cantidad)}
          ).then((rawResponse) => { 
            return res.status(200).json({status:"success", data: rawResponse});
          }).catch((err) => {
            return res.status(200).json({ status:"error", data:err})
          }); 
        };  
      });    

    }
  })
});

module.exports = router;