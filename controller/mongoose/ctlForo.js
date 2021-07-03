
const express = require('express');
const router = express.Router();
const secretKey = 'MGsecretkey$Adempiere$NodeJS&vueJS';
const jwt = require('jsonwebtoken');
const Pregunta = require('../../models/mongoose/pregunta'); 
const Respuesta = require('../../models/mongoose/respuesta'); 
const sequens = require('../../models/mongoose/sequens'); 

router.get('/get_all', (req, res, next) => {
    let token = req.headers.token;
    jwt.verify(token, secretKey, (err, decoded) => {
    if (err){
        return res.status(200).json({ status: 'unauthorized'})
    }else{
      Pregunta.find({}, 
        (err, preguntas) => { 
        if (err) return res.status(200).json({ status: 'error',data:err});
        if (!preguntas) return res.status(200).json({ status:"success", data:""});
        return res.status(200).json({status:"success", data: preguntas})
      }); 
    }
  })
}); 

router.get('/get_question', (req, res, next) => {
  let token = req.headers.token;
  jwt.verify(token, secretKey, (err, decoded) => {
  if (err){
      return res.status(200).json({ status: 'unauthorized'})
  }else{
    let question =req.query.pregunta;
        //console.log(question);
        // const { search } = JSON.stringify(req.query);
        // const rgx = (question) => new RegExp(`.*${question}.*`);
        // const searchRgx = rgx(search);
        const userRegex = new RegExp(question, 'i')
      Pregunta.find({pregunta: userRegex}, 
      (err, preguntas) => { 
      if (err) return res.status(200).json({ status: 'error',data:err});
      if (!preguntas) return res.status(200).json({ status:"success", data:""});
      // console.log(preguntas);
      return res.status(200).json({status:"success", data: preguntas})
    }); 
  }
})
}); 

router.post('/add_question',  (req, res, next) => { 
  let token = req.headers.token;  
  jwt.verify(token, secretKey,async (err, decoded) => {
    if (err){
      return res.status(200).json({ status: 'unauthorized1' , data :err}  )
    }else{
      if(decoded==undefined)return res.status(200).json({ status: 'unauthorized2'})
      else if (decoded.rol != 'admin')return res.status(200).json({ status: 'unauthorized3'})
      let preguntatemp = req.body;
      preguntatemp.numeropregunta = await sequencePregunta();
      var pregunta = new Pregunta(preguntatemp); 
      pregunta.save(function(err, doc) { 
        if (err){return res.status(200).json({ status:"error", data:err});} 
        return res.status(200).json({status:"success", data: doc})
      }); 
    }
  })
});

async function sequencePregunta() {
  try {
    var secFolio = await sequens.find({"nombre" : "preguntas"}, async function (err, docs) {
      //console.log(docs);
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


router.post('/add_answer_user',  (req, res, next) => { 
  let token = req.headers.token;  
  jwt.verify(token, secretKey,async (err, decoded) => {
    if (err){
      return res.status(200).json({ status: 'unauthorized1' , data :err}  )
    }else{
      if(decoded==undefined)return res.status(200).json({ status: 'unauthorized2'})
      else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized3'})
      let preguntatemp = req.body;
      var pregunta = new Respuesta(preguntatemp); 
      pregunta.save(function(err, doc) { 
        if (err){return res.status(200).json({ status:"error", data:err});} 
        return res.status(200).json({status:"success", data: doc})
      }); 
    }
  })
});

  
module.exports = router;