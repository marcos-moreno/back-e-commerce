
const express = require('express');
const router = express.Router();
const secretKey = 'MGsecretkey$Adempiere$NodeJS&vueJS';
const jwt = require('jsonwebtoken');
const Queja = require('../../models/mongoose/queja'); 
const QuejaRespuesta = require('../../models/mongoose/queja_respuesta'); 
const sequens = require('../../models/mongoose/sequens'); 

router.get('/get_user_complain', (req, res, next) => {
    let token = req.headers.token;
    jwt.verify(token, secretKey, (err, decoded) => {
    if (err){
        return res.status(200).json({ status: 'unauthorized'})
    }else{
      //console.log(req.query);
      let answer = req.query;
      Queja.find(answer, 
        (err, quejas) => { 
        if (err) return res.status(200).json({ status: 'error',data:err});
        if (!quejas) return res.status(200).json({ status:"success", data:""});
        return res.status(200).json({status:"success", data: quejas})
      }); 
    }
  })
}); 

router.post('/add_complain',  (req, res, next) => { 
  let token = req.headers.token;  
  jwt.verify(token, secretKey,async (err, decoded) => {
    if (err){
      return res.status(200).json({ status: 'unauthorized1' , data :err}  )
    }else{
      if(decoded==undefined)return res.status(200).json({ status: 'unauthorized2'})
      else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized3'})
      let preguntatemp = req.body;
      preguntatemp.numero_queja = await sequenceQueja();
      var queja = new Queja(preguntatemp); 
      queja.save(function(err, doc) { 
        if (err){return res.status(200).json({ status:"error", data:err});} 
        return res.status(200).json({status:"success", data: doc})
      }); 
    }
  })
});

async function sequenceQueja() {
  try {
    var secFolio = await sequens.find({"nombre" : "quejas"}, async function (err, docs) {
      console.log(docs);
      if (err){console.log(err);return {};
      }else{return docs[0];}
    }); 
    secFolio = secFolio[0];
    secFolio.value = secFolio.value + 1;
    await sequens.updateOne({_id:secFolio._id},{value:secFolio.value})    
   //console.log( );
    return secFolio.value;
  } catch (error) {
    console.log(error);
    return 0;
  } 
}

router.get('/get_user_specific_complain', (req, res, next) => {
  let token = req.headers.token;
  jwt.verify(token, secretKey, (err, decoded) => {
  if (err){
      return res.status(200).json({ status: 'unauthorized'})
  }else{

    //console.log(req.query);
    let answer = req.query;

    QuejaRespuesta.find(answer, 
      (err, queja_respuesta) => { 
      if (err) return res.status(200).json({ status: 'error',data:err});
      if (!queja_respuesta) return res.status(200).json({ status:"success", data:""});
      return res.status(200).json({status:"success", data: queja_respuesta})
    }); 
  }
})
}); 

router.post('/add_user_specific_complain',  (req, res, next) => { 
  let token = req.headers.token;  
  jwt.verify(token, secretKey,async (err, decoded) => {
    if (err){
      return res.status(200).json({ status: 'unauthorized1' , data :err}  )
    }else{
      if(decoded==undefined)return res.status(200).json({ status: 'unauthorized2'})
      else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized3'})
      let preguntatemp = req.body;
      var queja_respuesta = new QuejaRespuesta(preguntatemp); 
      queja_respuesta.save(function(err, doc) { 
        if (err){return res.status(200).json({ status:"error", data:err});} 
        return res.status(200).json({status:"success", data: doc})
      }); 
    }
  })
});



/*
router.post('/add_answer',  (req, res, next) => { 
  let token = req.headers.token;  
  jwt.verify(token, secretKey,async (err, decoded) => {
    if (err){
      return res.status(200).json({ status: 'unauthorized1' , data :err}  )
    }else{
      if(decoded==undefined)return res.status(200).json({ status: 'unauthorized2'})
      else if (decoded.rol != 'admin')return res.status(200).json({ status: 'unauthorized3'})
      let preguntatemp = req.body;
      var pregunta = new Respuesta(preguntatemp); 
      pregunta.save(function(err, doc) { 
        if (err){return res.status(200).json({ status:"error", data:err});} 
        return res.status(200).json({status:"success", data: doc})
      }); 
    }
  })
});

router.get('/get_all_answer', (req, res, next) => {
  let token = req.headers.token;
  jwt.verify(token, secretKey, (err, decoded) => {
  if (err){
      return res.status(200).json({ status: 'unauthorized'})
  }else{

    console.log(req.query);
    let preguntass = req.query;

    Respuesta.find(req.query, 
      (err, respuesta) => { 
      if (err) return res.status(200).json({ status: 'error',data:err});
      if (!respuesta) return res.status(200).json({ status:"success", data:""});
      return res.status(200).json({status:"success", data: respuesta})
    }); 
  }
})
}); 



*/
  
module.exports = router;