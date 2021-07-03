
const express = require('express');
const router = express.Router();  
const Usocfdi = require("../../models/AD/uso_cfdi");
const Mail = require("../../models/mail.js");
const layoutsEmail = require("../../layout/emails.js");
const Preregistro = require('../../models/mongoose/pre-registro.js'); 
const secretKey = 'MGsecretkey$Adempiere$NodeJS&vueJS';
const jwt = require('jsonwebtoken');
const userMDL = require("../../models/AD/user");  
const config = require('../config.js');  
const soap = require('soap'); 
const sequens = require('../../models/mongoose/sequens');

const login = {
  "tns:user":"sistemas.refividrio","tns:pass":"DevTI-Web_Service#21.",
  "tns:lang":192,"tns:ClientID":1000000,"tns:RoleID":1000016,
  "tns:OrgID":0,"tns:WarehouseID":0,"tns:stage":0
}; 
var clientWS = null; 

router.get('/montPreAproved', function (req, res, next) {
  userMDL
  .montPreAproved(req.query.rfc)
  .then(user => {  
      res.json(user);
  }).catch(err => { 
      return res.status(500).send({status:"error",data:err});
  });
}); 

router.get('/testMail', async function (req, res, next) {
  // var mailOptionsd = {
  //     to: "jorgearrf@prodigy.net.mx", // list of receivers
  //     subject: "Pre registro Aprobado", // Subject line
  //     html: layoutsEmail.emailAprovedPreRegistro({montPreAprobed : 10000,nombreSolicitante:"AGUIRRE RODRIGUEZ JORGE ALBERTO"})
  // };    
  // const respuestaMail = await Mail.sendEmail(mailOptionsd);
  // return res.status(200).json(respuestaMail);    

  let isEmpleados = false;
  const Sucursal = require('../../models/mongoose/saleorder');   
  let saleOrder = await Sucursal.find({ documentno: "S27-6222" }, 
    (err, suc) => {
    if (err) return { status: 'erro',data:{"name" : "","url_maps" : ""}};
    if (!suc) return { status: 'erro',data:{"name" : "","url_maps" : ""}};
    return {status:"success", data: suc[0]};
  });
  // console.log(saleOrder);
  saleOrder  = saleOrder[0];
  saleOrder.sucursal_entrega  = {url_maps:"https://goo.gl/maps/SRVmD9CkoYkDhUkX8", name:"SUCURSAL VERACRUZ"};
 
  // saleOrder.sucursal_entrega = sucursal[0];  
  let subjectlt = '¡Gracias por tu compra, Sucursal de entrega Veracruz!';
  let emailsLocal = '';//saleOrder.emailClient;// saleOrder.emailClient; 
  if (isEmpleados) {
    emailsLocal = "desarrollo-rf@refividrio.com.mx;desarrollo4@refividrio.com.mx;";
    // emailsLocal = "desarrollo-rf@refividrio.com.mx;";
    // subjectlt = "Modificación de entrega de la Orden " + saleOrder.documentno + ' Sucursa Veracruz (Ecommerce para Distribuidores).';
    // emailsLocal = `marketing3@refividrio.com.mx;marketing@refividrio.com.mx;marketing1@refividrio.com.mx;marketing2@refividrio.com.mx;traficoventas@refividrio.com.mx;ventasmex_operaciones@refividrio.com.mx;telemarketing@refividrio.com.mx;servicio.distribuidor@refividrio.com.mx;`; 
    // emailsLocal = 'servicio.distribuidor@refividrio.com.mx;'
  }
  emailsLocal = "desarrollo-rf@refividrio.com.mx;desarrollo4@refividrio.com.mx;marcos.moreno.gm@gmail.com";
  var mailOptions = {
    to:  emailsLocal, // list of receivers 'exportation@refividrio.com.mx',
    subject: subjectlt, // Subject line
    html: layoutsEmail.emailCompraFinalizada(saleOrder,isEmpleados)
  };
  const respuestaMail = await Mail.sendEmail(mailOptions);
  return res.status(200).json({status:"success", data: respuestaMail});
  // return respuestaMail; 
}); 

router.get('/getByFilter', (req, res, next) => {
  let token = req.headers.token;  
  jwt.verify(token, secretKey, (err, decoded) => {
      if (err){
          return res.status(200).json({ status: 'unauthorized'})
      }else{
          if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
          else if (decoded.rol != 'admin')return res.status(200).json({ status: 'unauthorized'})
          Preregistro.find().sort('-created_at').find(req.body.filer,
            async  (err, solicitudes) => {
              if (err) return res.status(200).json({ status: 'error',data:err});
              if (!solicitudes) return res.status(200).json({ status:"success", data:""});
              return res.status(200).json({status:"success", data: solicitudes})
            }); 
      } 
  })
});
  
router.post('/add_pre', async function(req, res, next){ 
    let solicitud = req.body;    
    if (solicitud.tipoSolicitante.rfcColborador == "") {
      if (solicitud.tipoSolicitante.requiredFactura == true || solicitud.tipoSolicitante.requiredFactura == "true") {
        return res.status(200).json({status:"error", data: "El RFC es Obligatorio."})
      } else {
        let folio = await sequenceFolio();
        if (folio==0) return res.status(200).json({ status:"error",data: "Error Interno del servidor, folio erroneo."});
        console.log(folio);
        solicitud.folio = folio; 
        var preregistro = new Preregistro(solicitud); 
        preregistro.save(async function(err, doc) {
          if (err) return res.status(200).json({ status:"error", data:err});
          await sendEmailPreRegistro(doc,'Gracias por tu pre-registro.'); 
          return res.status(200).json({status:"success", data: doc})
        });
      }
    }else{
      Preregistro.find(
        {"tipoSolicitante.rfcColborador":solicitud.tipoSolicitante.rfcColborador},
        async  (err, solicitudes) => {
          if (err) return res.status(200).json({ status: 'error',data:err});
          // console.log("Si entro:" + solicitudes.length);
          if (solicitudes.length == 0){  
            let folio = await sequenceFolio(); 
            if (folio==0) return res.status(200).json({ status:"error",data: "Error Interno del servidor, folio erroneo."});
            solicitud.folio = folio;
            var preregistro = new Preregistro(solicitud); 
            preregistro.save(async function(err, doc) {
              if (err) return res.status(200).json({ status:"error", data:err});
              await sendEmailPreRegistro(doc,'Gracias por tu pre-registro.'); 
              return res.status(200).json({status:"success", data: doc})
            });
          } else {
            return res.status(200).json({status:"error", data:"rfcDuplicado"})
          } 
          return false;
      });
    } 
});


// router.post('/insercbpartner',async (req, res, next) => {
//   let token = req.headers.token;  
//   jwt.verify(token, secretKey,async (err, decoded) => {
//     if (err){
//         return res.status(200).json({ status: 'unauthorized'})
//     }else{
//       if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
//       else if (decoded.rol != 'admin')return res.status(200).json({ status: 'unauthorized'})
     
//       let solicitud = req.body;
//       // solicitud.estado_solicitud = "PA";
//       respuestaUpdPreregistro = await Preregistro.updateOne({_id:solicitud._id},solicitud); 
//       console.log(respuestaUpdPreregistro);
//       if (respuestaUpdPreregistro.nModified == 1) {
//         Preregistro.findOne({_id:solicitud._id},
//           async  (err, fnsolicitud) => {
//             if (err) return res.status(200).json({ status: 'error',data:err});
//             if (!fnsolicitud) return res.status(200).json({status:"error",data:{}});
//             return res.status(200).json({status:"success", data: fnsolicitud})
//         });
//       }else{
//         return res.status(200).json({ status: 'error',data:respuestaUpdPreregistro});
//       }
      
//     }
//   })
// });


router.post('/insercbpartner',async (req, res, next) => {
  let token = req.headers.token;  
  jwt.verify(token, secretKey,async (err, decoded) => {
    if (err){
        return res.status(200).json({ status: 'unauthorized'})
    }else{
      if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
      else if (decoded.rol != 'admin')return res.status(200).json({ status: 'unauthorized'})

      // Ordenamiento de la solicitud
      let solicitud = [];
      solicitud.push(req.body);
      let tipoSolic = solicitud[0].tipoSolicitante;
      solicitud[0].tipoSolicitante = [];
      solicitud[0].tipoSolicitante.push(tipoSolic);
      //-- Ordenamiento de la solicitud 

      const cbpartner = await userMDL.rf_insercbpartner_ecomers(JSON.stringify(solicitud),false);
      let respuestaUpdPreregistro = {};

      if (cbpartner.data.estado == 'SE') {
        solicitud[0].resultAD = cbpartner;
        return res.status(200).json({status:"success", data: solicitud[0]})
      }

      solicitud[0].resultADWS = [{cbpartner:{},cbpartnerlocation:{},aduser:{},lmx_bpartner:{}}];
      solicitud[0].syncAD_at = new Date(); 
      solicitud[0].resultAD = cbpartner; 
      solicitud[0].c_bpartner_id = cbpartner.c_bpartner_id;
      solicitud[0].ad_user_id = cbpartner.ad_user_id;
      solicitud[0].estado_solicitud = cbpartner.data.estado; 

      if (cbpartner.data.estado != 'ARH' && cbpartner.data.estado != 'SD' ) {
        // console.log("Esta es la solicitud");
        // console.log(solicitud[0]);
        try {
          // solicitud = solicitud[0]; 
          try {
            if (solicitud[0].estado_solicitud == 'CREATED_CFAC') {
              if(await insertCb_partner(solicitud[0],solicitud[0].tipoSolicitante[0].rfcColborador)){
                const cbpartnerlocation = await userMDL.rf_insercbpartner_ecomers(JSON.stringify(solicitud),true);
                solicitud[0].resultADWS[0].cbpartnerlocation = cbpartnerlocation; 
                solicitud[0].c_bpartner_location_id = cbpartnerlocation.c_bpartner_location_id;
                // console.log(solicitud[0]);
                if(await insertAD_user(solicitud[0])){
                  if(await insertLMX_BPartner_Ecommerce(solicitud[0],solicitud[0].UsoCFDI)){ 
                    solicitud[0].estado_solicitud = "AU"; 
                  }
                }
              } 
            }
            if (solicitud[0].estado_solicitud == 'CREATED_CM') {  
              if(await insertCb_partner(solicitud[0],"XAXX010101000")){
                const cbpartnerlocation = await userMDL.rf_insercbpartner_ecomers(JSON.stringify(solicitud),true);
                solicitud[0].resultADWS[0].cbpartnerlocation = cbpartnerlocation; 
                solicitud[0].c_bpartner_location_id = cbpartnerlocation.c_bpartner_location_id;
                if(await insertAD_user(solicitud[0])){ 
                  if(await insertLMX_BPartner_Ecommerce(solicitud[0],'P01')){ 
                    solicitud[0].estado_solicitud = "AU"; 
                  }  
                }
              } 
            } 
          } catch (error) {
            console.log(error);
          }
        
        } catch (errort) {
          console.log(errort);
          return res.status(200).json({ status: 'error',data:errort});
        }
      }

      solicitud = solicitud[0];
      if (solicitud.estado_solicitud == "AU") {
        solicitud.st_sendemail = await sendEmail(solicitud,'Pre-registro aprobado.'); 
      } 
      
      respuestaUpdPreregistro = await Preregistro.updateOne({_id:solicitud._id},solicitud); 
      if (respuestaUpdPreregistro.nModified == 1) {
        Preregistro.findOne({_id:solicitud._id},
          async  (err, fnsolicitud) => {
            if (err) return res.status(200).json({ status: 'error',data:err});
            if (!fnsolicitud) return res.status(200).json({status:"error",data:{}});
            return res.status(200).json({status:"success", data: fnsolicitud})
        }); 
      }else{
        return res.status(200).json({ status: 'error',data:respuestaUpdPreregistro});
      }
      
    }
  })
});

router.put('/rechazar',async (req, res, next) => {
  let solicitud = req.body; 
  respuestaUpdPreregistro = await Preregistro.updateOne({_id:solicitud._id},{estado_solicitud:'RE'}); 
  console.log(respuestaUpdPreregistro);
  if (respuestaUpdPreregistro.nModified == 1) {
    console.log("Fine");
    Preregistro.findOne({_id:solicitud._id},
    async  (err, fnsolicitud) => {
      if (err) return res.status(200).json({ status: 'error',data:err});
      if (!fnsolicitud) return res.status(200).json({status:"error",data:{}});
      return res.status(200).json({status:"success", data: fnsolicitud});
    });
  }else{
    return res.status(200).json({ status: 'error',data:respuestaUpdPreregistro});
  }
});

async function sendEmail(params,subject) {
  var mailOptions = { 
    to: params.email, // list of receivers
    subject: subject, // Subject line
    html: layoutsEmail.emailAprovedPreRegistro(params)
  }; 
  const respuestaMail = await Mail.sendEmail(mailOptions);
  return respuestaMail;
}

async function sendEmailPreRegistro(params,subject) {
  var mailOptions = { 
    to: params.email, // list of receivers
    subject: subject, // Subject line
    html: layoutsEmail.emailPreRegistro(params)
  }; 
  const respuestaMail = await Mail.sendEmail(mailOptions);
  return respuestaMail;
}

function startClient(wsdlPath) {
  return new Promise((res, rej) => {
    soap.createClient(wsdlPath, (err, client) => {
      if (err) {console.log(err); res({status:"error",data: err}); }
      clientWS = client;
      res({status:"success",data: []});
    });
  });
}

async function insertCb_partner(solicitud,rfc) { 
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const conectionWS = await startClient(config.urlWSDLADempiere); 
  if (conectionWS.status == "success") { 
        var args = { "ModelCRUDRequest":{ 
                        "tns:ModelCRUD":{
                          "tns:serviceType":"RF_Create_C_BPartner_Ecommerce", 
                          "tns:TableName":"C_BPartner", 
                          "tns:RecordID":0, 
                          "tns:Action":"Create",
                          "tns:DataRow":{'tns:field':[
                            {attributes:{'column':'Name'},"tns:val": [solicitud.nombreSolicitante]},
                            {attributes:{'column':'TaxID'},"tns:val": [rfc]},
                            {attributes:{'column':'IsCustomer'},"tns:val": ['Y']},
                            {attributes:{'column':'SO_CreditLimit'},"tns:val": [solicitud.montPreAprobed]},
                            {attributes:{'column':'SOCreditStatus'},"tns:val": [(parseFloat(solicitud.montPreAprobed) >= 1500 ?'O':'X')]},
                            {attributes:{'column':'InvoiceRule'},"tns:val": ['D']},
                            {attributes:{'column':'DeliveryRule'},"tns:val": ['A']},
                            {attributes:{'column':'DeliveryViaRule'},"tns:val": ['D']},
                            {attributes:{'column':'M_PriceList_ID'},"tns:val": [1000024]},
                            {attributes:{'column':'PaymentRule'},"tns:val": ['P']},
                            {attributes:{'column':'C_PaymentTerm_ID'},"tns:val": [1000005]},
                            // {attributes:{'column':'SalesRep_ID'},"tns:val": [1000035]},
                            {attributes:{'column':'C_BP_Group_ID'},"tns:val": [1000054]},
                            {attributes:{'column':'IsActive'},"tns:val": [true]},
                            {
                              attributes:{'column':'Description'},
                              "tns:val": 
                              [
                                "Socio creado desde e-commerce de distribuidores, RFC al que corresponde: " +
                                solicitud.tipoSolicitante[0].rfcColborador + ", " + 
                                solicitud.tipoSolicitante[0].tipo
                              ]
                            }, 
                          ]}
                        }
                        ,"tns:ADLoginRequest":login
                      }
                    };   
        const results  = await createData(args);
        solicitud.resultADWS[0].cbpartner = results;
        if (results.status == 'success') { 
          solicitud.c_bpartner_id = results.data.StandardResponse.attributes.RecordID;
          return true;
        }else{
          console.log(results.data);
          return false;
        }  
  }else{
    console.log("No hay conexion con el WS");
    return false;
  }
}

async function insertAD_user(solicitud) { 
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const conectionWS = await startClient(config.urlWSDLADempiere); 
  if (conectionWS.status == "success") { 
        var args = { "ModelCRUDRequest":{ 
                        "tns:ModelCRUD":{
                          "tns:serviceType":"RF_Create_AD_User_Ecommerce", 
                          "tns:TableName":"AD_User", 
                          "tns:RecordID":0, 
                          "tns:Action":"Create",
                          "tns:DataRow":{'tns:field':[
                            {attributes:{'column':'Name'},"tns:val": [solicitud.nombreSolicitante]},
                            {attributes:{'column':'C_BPartner_ID'},"tns:val": [solicitud.c_bpartner_id]}, 
                            {attributes:{'column':'C_BPartner_Location_ID'},"tns:val": [solicitud.c_bpartner_location_id]},
                            {attributes:{'column':'IsWebstoreUser'},"tns:val": ['Y']},
                            {attributes:{'column':'PasswordInfo'},"tns:val": ['$2b$10$7qXuRIJjog6jYPjiBiBS4OkEtUzCZ3rf0XGbXBWYIS2WXdLsup9g6']},
                            {attributes:{'column':'EMail'},"tns:val": [solicitud.email]},
                            {attributes:{'column':'Phone2'},"tns:val": [solicitud.numeroCelular]}, 
                            {attributes:{'column':'BPName'},"tns:val": [solicitud.tipoSolicitante[0].rfcColborador]}, 
                            {attributes:{'column':'IsLoginUser'},"tns:val": ['Y']}, 
                            {attributes:{'column':'Salt'},"tns:val": ['**']}, 
                          ]}
                        }
                        ,"tns:ADLoginRequest":login
                      }
                    };   
        const results  = await createData(args);
        solicitud.resultADWS[0].aduser = results;
        if (results.status == 'success') { 
          solicitud.ad_user_id = results.data.StandardResponse.attributes.RecordID;
          return true;
        }else{
          console.log(results.data);
          return false;
        }  
  }else{
    return false;
  } 
} 

async function insertLMX_BPartner_Ecommerce(solicitud,cfdi) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const conectionWS = await startClient(config.urlWSDLADempiere); 
  if (conectionWS.status == "success") { 
        var args = { "ModelCRUDRequest":{ 
                        "tns:ModelCRUD":{
                          "tns:serviceType":"RF_Create_LMX_BPartner_Ecommerce", 
                          "tns:TableName":"LMX_BPartner", 
                          "tns:RecordID":0, 
                          "tns:Action":"Create",
                          "tns:DataRow":{'tns:field':[ 
                            {attributes:{'column':'C_BPartner_ID'},"tns:val": [solicitud.c_bpartner_id]},   
                            {attributes:{'column':'UsoCFDI'},"tns:val": [cfdi]}, 
                          ]}
                        }
                        ,"tns:ADLoginRequest":login
                      }
                    };   
        const results  = await createData(args);
        solicitud.resultADWS[0].lmx_bpartner = results;
        if (results.status == 'success') {  
          return true;
        }else{
          console.log(results.data);
          return false;
        }  
  }else{
    return false;
  } 
} 

function createData(args) { 
  return new Promise((res, rej) => { 
    clientWS.createData(args,(err, result) => { 
      if (err) { console.log(err);res({status:"error",data: err}); }
      res({status:"success",data: result});
    }); 
  });
}

async function sequenceFolio() {
  try {
    var secFolio = await sequens.find({"nombre" : "folioSolicitud"}, async function (err, docs) {
      if (err){console.log(err);return {};
      }else{return docs[0];}
    }); 
    secFolio = secFolio[0];
    secFolio.value = secFolio.value + 1;
    await sequens.updateOne({_id:secFolio._id},{value:secFolio.value})    
    return secFolio.value;
  } catch (error) {
    console.log(error);
    return 0;
  } 
} 

router.get('/get_uso_cfdi', (req, res, next) => {
  Usocfdi.all()
  .then(uso_cfdis => {
    return res.status(200).json(uso_cfdis)
  }).catch(err => {
    return res.status(200).json({status:"error","data":err})
  }); 
}); 
module.exports = router;