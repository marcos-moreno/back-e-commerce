
const express = require('express');
const router = express.Router();
const secretKey = 'MGsecretkey$Adempiere$NodeJS&vueJS';
const jwt = require('jsonwebtoken');
const SaleOrder = require('../../models/mongoose/saleorder');
const OrderModel = require("../../models/AD/c_order");
const productosModel = require("../../models/AD/m_product");
const soap = require('soap');
var clientWS = null;
const Mail = require("../../models/mail.js");
const layoutsEmail = require("../../layout/emails.js");
const config = require('../config.js'); 

var login = {
  "tns:user":"sistemas.refividrio","tns:pass":"DevTI-Web_Service#21.",
  "tns:lang":192,"tns:ClientID":1000000,"tns:RoleID":1000016,
  "tns:OrgID":0,"tns:WarehouseID":0,"tns:stage":0
};

router.get('/get_auth', (req, res, next) => {
    let token = req.headers.token;  
    jwt.verify(token, secretKey, (err, decoded) => { 
      if (err){
        return res.status(200).json({ status: 'unauthorized'})
      }else{
        if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
        else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'})

        SaleOrder.find({ad_user_id : decoded.userId},
        async  (err, sales) => {
          if (err) return res.status(200).json({ status: 'unauthorized',data:err});
          if (!sales) return res.status(200).json({ status:"success", data:""});
          
          for (let i = 0; i < sales.length; i++) { 
            for (let index = 0; index < sales[i].productos.length; index++) {
              let producto = await productosModel.one(sales[i].productos[index].value)
              .then(imgres => {
                return imgres;
              }).catch(err => { 
                return { status:"error", data:err};
              }); 
              sales[i].productos[index].prodCompleto = producto;
            }
          }
          return res.status(200).json({status:"success", data: sales})
        }).sort('-created_at'); 
      } 
  })
}); 

router.get('/get_allSales', (req, res, next) => {
  let token = req.headers.token;  
  jwt.verify(token, secretKey, (err, decoded) => { 
    if (err){
      return res.status(200).json({ status: 'unauthorized'})
    }else{
      if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
      else if (decoded.rol != 'admin')return res.status(200).json({ status: 'unauthorized'})

      SaleOrder.find().sort('-created_at').find({},async  (err, sales) => {
        if (err) return res.status(200).json({ status: 'unauthorized',data:err});
        if (!sales) return res.status(200).json({ status:"success", data:[]}); 
        return res.status(200).json({status:"success", data: sales});
      }); 
    } 
})
});

// router.get('/completorden', async (req, res, next) => {
//   let respuesta = await completeDocument("RF_Movement_Complete_PS",1034853,"RC");
//   return res.status(200).json({status:"success", data: respuesta});  
// });



router.post('/add_auth_with_ad',async (req, res, next) => {
  let token = req.headers.token;  
  jwt.verify(token, secretKey,async (err, decoded) => {//:::::::::JWT verify
    if (err) return res.status(200).json({ status: 'unauthorized'});
    if(decoded==undefined) return res.status(200).json({ status: 'unauthorized'});
    else if (decoded.rol != 'user') return res.status(200).json({ status: 'unauthorized'});
      
    let sal = req.body;delete sal._id; //Se elimina el ID de la orden ya que es nueva.
    sal.requiresdate = false;
    var saleOrder = new SaleOrder(sal);//Se crea la orden
    saleOrder.created_by = decoded.userId; //Se ingresa el id del cliente en el creado.

    //validation::::: Solo controla el error, si no se puede guardar envia un Email con los datos de la venta.
    let existError = false;let errorDebugger = false; //variables para validar los errores.
    try {
      await saleOrder.save();
    } catch (error) { 
      errorDebugger =error;
      existError = true;
    }
    if (saleOrder._id == undefined || existError){
      sendEmailDebug(saleOrder," saleOrder NOT save",errorDebugger);
      return res.status(200).json({ status: 'error',data:"Error Interno"});
    }
    //validation::::: Solo controla el error, si no se puede guardar envia un Email con los datos de la venta.

    const valuesPagado = [
      1000024 // <<< Lista de Precio
      ,saleOrder.grandtotal // <<< Total de la compra
      ,saleOrder._id // <<< ID de la compra en Mongo
      ,saleOrder.c_bpartner_id // <<< ID del socio de negocio
      ,JSON.stringify(saleOrder.productos) // <<< Colección de productos de la venta
      ,saleOrder.fechaprometida // <<< fechaprometida date
      ,saleOrder.method_pay // <<< tipoPago character varying,
      ,saleOrder.ad_org_recpt_id // <<< id de la organizacion de recepcion
    ]; 
    const orderAd = await OrderModel.rf_order_ecomers(valuesPagado); 
    saleOrder.resultOrder = orderAd.data;
    if (orderAd.status == "success") {
      saleOrder.documentno = orderAd.data.documentno;
      saleOrder.c_order_id = orderAd.data.c_order_id; 
      await saleOrder.save();
      if (saleOrder.method_pay == "TRA") {
        saleOrder.fechaprometida=''; 
        saleOrder.horaprometida=''; 
        saleOrder.fechaprometidatexto =''; 
        //:::::::::Se envia el email de la TRANSFERENCIA BANCARIA
        sendEmailDatosTransferencia(saleOrder,'Información para Transferencia electrónica de la orden: '+saleOrder.documentno,false); 
        sendEmailDatosTransferencia(saleOrder,saleOrder.documentno + ' en espera de pago por TRANSFERENCIA ELECTRÓNICA (Ecommerce para Distribuidores).',true); 
        //:::::::::Se envia el email de la TRANSFERENCIA BANCARIA
      } else {
        //:::::::::Se envia el email de la compra
        sendEmailCompraFinalizada(saleOrder,'¡Gracias por tu compra!',false); 
        sendEmailCompraFinalizada(saleOrder,saleOrder.documentno + ' se ha fincado un pedido (Ecommerce para Distribuidores).',true); 
        //:::::::::Se envia el email de la compra
      } 
    }else{
      saleOrder.documentno = "-";
    }
    await saleOrder.save();
    //:::::::::Se responde al cliente cuando la orden haya sido creada.
    res.status(200).json({status:"success", data: saleOrder});
    //:::::::::Se responde al cliente cuando la orden haya sido creada.

    if (orderAd.status == "success") {//:::::::::Si la orden se creó de forma correcta 
      //:::::::::Crear y completar traspaso
      let idProd = "0";
      if (parseFloat(saleOrder.grandtotal) >= 5000) {
        idProd = saleOrder.productoregalo;
      };
      const movementAd = await OrderModel.rf_movement_ecomers(
        saleOrder.documentno
        ,JSON.stringify(saleOrder.productos)
        ,idProd
      );
 
      await saleOrder.save();   
      if (movementAd.status == "success") { 
        saleOrder.resultMovement = movementAd.data;

        console.log("Completar RF_Movement_Complete_PS: " + movementAd.data.m_movement_id);
        saleOrder.resultMovementComplete = await completeDocument("RF_Movement_Complete_PS",movementAd.data.m_movement_id,"CO");
        console.log("Completar RF_Movement_Complete_PS: " + movementAd.data.m_movement_id);

      }else{
        saleOrder.resultMovementComplete = movementAd;
      }
      await saleOrder.save();   
      //:::::::::Crear y completar traspaso

      //:::::::::Completar Orden
      console.log("Completar Orden: " + saleOrder.c_order_id);
      saleOrder.resultOrderComplete = await completeDocument("RF_Order_Complete_PS",saleOrder.c_order_id,"CO");
      console.log("FIN Completar Orden: " + saleOrder.c_order_id);
      await saleOrder.save(); 
      //:::::::::Completar Orden 
      
      if (saleOrder.method_pay == "CRE" ||
          (saleOrder.status_pay == "pagado" && saleOrder.method_pay == "paypal"))
      {//:::::::::Se crea la factura si el pago es a crédito o ya fué pagado.

        //:::::::::Se INSERTA la factura
        let invoiceValid = await insertAD_C_invoice(saleOrder);
        await saleOrder.save();
        //:::::::::Se INSERTA la factura
        
        if(invoiceValid){//:::::::::Si la factura se insertó de forma correcta se crean las lineas 
          //:::::::::Se crean las lineas de la factura con funcion psql
          let pagado = (saleOrder.status_pay == "pagado" && saleOrder.method_pay == "paypal") ? true : false;
          const valuesInvoice = [saleOrder.c_order_id,saleOrder.c_invoice_id,pagado];
          let invoiceAD = await OrderModel.rf_invoiceLine_ecomers(valuesInvoice); 
          saleOrder.resultInvoiceLinesAD = invoiceAD;
          await saleOrder.save();
          //:::::::::Se crean las lineas de la factura con funcion psql
            
          if (invoiceAD.status == "error") {
            saleOrder.documentnoInvoice = "-"; 
          }else if (invoiceAD.status == "success") {//:::::::::Si las lineas se crearón de forma correcta se completa la factura
            saleOrder.documentnoInvoice = invoiceAD.data.documentno; 
            console.log("Inicio de ejecución completeDocumentInvoiced");
            saleOrder.resultcompleteInvoiceWS = await completeDocument("RF_Invoice_Complete_PS",saleOrder.c_invoice_id,"CO"); //completeDocumentInvoiced(saleOrder.c_invoice_id);
            console.log("Termino de ejecución completeDocumentInvoiced");
            await saleOrder.save();
            if (pagado){//:::::::::Si esta pagado se inserta el pago y se completa
              let invoiceValid = await insertAD_C_Payment(saleOrder);
              if (invoiceValid) {
                saleOrder.resultcompletePaymentWS = await completeDocument("RF_Payment_Complete_PS",saleOrder.c_payment_id,"CO");
                await saleOrder.save();
              }
            }//:::::::::Si esta pagado se inserta el pago y se completa
          }//:::::::::Si las lineas se crearón de forma correcta se completa la factura y el pago 
        }//:::::::::Si la factura se insertó de forma correcta se crean las lineas
      }//:::::::::Se crea la factura si el pago es a crédito o ya fué pagado
      await saleOrder.save();   
    }//:::::::::Si la orden se creó de forma correcta
  })//:::::::::JWT verify
});



router.post('/pagotransferencia',async (req, res, next) => {
  let token = req.headers.token;  
  jwt.verify(token, secretKey,async (err, decoded) => {//:::::::::JWT verify
    if (err) return res.status(200).json({ status: 'unauthorized'});
    if(decoded==undefined) return res.status(200).json({ status: 'unauthorized'});
    else if (decoded.rol != 'admin') return res.status(200).json({ status: 'unauthorized'});
      
    let saleOrder = req.body;     
     
      if (saleOrder.status_pay == "pagado" && saleOrder.method_pay == "TRA")
      {//:::::::::Se crea la factura si el pago es a crédito o ya fué pagado.
 
        //:::::::::Se envia el email para que se defina la fecha y hora de entrega
        var mailOptions = {
          to: saleOrder.emailClient, // list of receivers
          subject: `¡Gracias por el pago de tu orden ${saleOrder.documentno}!`, // Subject line
          html: layoutsEmail.sendEmailPagoRecibido(saleOrder)
        };
        await Mail.sendEmail(mailOptions); 
        //:::::::::Se envia el email pra qye se defina la fecha y hora de la etrega

        //:::::::::Se envia el email de la compra
        sendEmailCompraFinalizada(saleOrder,'¡Gracias por tu compra!',false); 
        sendEmailCompraFinalizada(saleOrder,saleOrder.documentno + 
          ' se ha fincado un pedido (Ecommerce para Distribuidores).',true); 
        //:::::::::Se envia el email de la compra   

        //:::::::::Se envia el email de la compra
        // sendEmailCompraFinalizada(saleOrder,'¡Gracias por tu compra!',false); 
        // sendEmailCompraFinalizada(saleOrder,saleOrder.documentno + 
        //   ' se ha fincado un pedido (Ecommerce para Distribuidores).',true); 
        //:::::::::Se envia el email de la compra 

        //:::::::::Se INSERTA la factura
        let invoiceValid = await insertAD_C_invoice(saleOrder);
        await SaleOrder.updateOne(
          {_id:saleOrder._id},
          {
            resultcreateInvoiceWS:saleOrder.resultcreateInvoiceWS
            ,c_invoice_id:saleOrder.c_invoice_id
            ,status_pay :"pagado"
            ,requiresdate:true
            ,fechaprometida:saleOrder.fechaprometida
            ,fechaprometidatexto:saleOrder.fechaprometidatexto
            ,horaprometida:saleOrder.horaprometida
          });   
        //:::::::::Se INSERTA la factura
        
        if(invoiceValid){//:::::::::Si la factura se insertó de forma correcta se crean las lineas 
          //:::::::::Se crean las lineas de la factura con funcion psql
          let pagado = true;
          const valuesInvoice = [saleOrder.c_order_id,saleOrder.c_invoice_id,pagado];
          let invoiceAD = await OrderModel.rf_invoiceLine_ecomers(valuesInvoice); 
          saleOrder.resultInvoiceLinesAD = invoiceAD;
          await SaleOrder.updateOne({_id:saleOrder._id},{resultInvoiceLinesAD:invoiceAD,status_pay :"pagado"});   
          //:::::::::Se crean las lineas de la factura con funcion 
          
          if (invoiceAD.status == "error") {
            saleOrder.documentnoInvoice = "-"; 
          }else if (invoiceAD.status == "success") {//:::::::::Si las lineas se crearón de forma correcta se completa la factura
            saleOrder.documentnoInvoice = invoiceAD.data.documentno;  
            saleOrder.resultcompleteInvoiceWS = await completeDocument("RF_Invoice_Complete_PS",saleOrder.c_invoice_id,"CO"); //completeDocumentInvoiced(saleOrder.c_invoice_id);
            
            await SaleOrder.updateOne({_id:saleOrder._id},
              {resultcompleteInvoiceWS:saleOrder.resultcompleteInvoiceWS,documentnoInvoice:saleOrder.documentnoInvoice});

            if (pagado){//:::::::::Si esta pagado se inserta el pago y se completa
              let invoiceValid = await insertAD_C_Payment(saleOrder);
                await SaleOrder.updateOne({_id:saleOrder._id},
                {resultcreatePaymentWS:saleOrder.resultcreatePaymentWS,c_payment_id:saleOrder.c_payment_id});

              if (invoiceValid) {
                saleOrder.resultcompletePaymentWS = await completeDocument("RF_Payment_Complete_PS",saleOrder.c_payment_id,"CO");
                await SaleOrder.updateOne({_id:saleOrder._id},
                  {resultcompletePaymentWS:saleOrder.resultcompletePaymentWS});
              }
            }//:::::::::Si esta pagado se inserta el pago y se completa
          }//:::::::::Si las lineas se crearón de forma correcta se completa la factura y el pago 
        }//:::::::::Si la factura se insertó de forma correcta se crean las lineas
 
        //:::::::::Se responde al cliente cuando la orden haya sido creada.
        res.status(200).json({status:"success", data: saleOrder});
        //:::::::::Se responde al cliente cuando la orden haya sido creada. 

      }//:::::::::Se crea la factura si ya fué pagada
      else{ 
        // :::::::::Cerrar OV y Reversar Traspaso
        saleOrder.resultMovementComplete = await completeDocument("RF_Movement_Complete_PS",saleOrder.resultMovement.m_movement_id,"RC");
        saleOrder.resultOrderComplete = await completeDocument("RF_Order_Complete_PS",saleOrder.c_order_id,"CL");
        // :::::::::Cerrar OV y Reversar Traspaso
        await SaleOrder.updateOne({_id:saleOrder._id},
          {resultMovementComplete:saleOrder.resultMovementComplete
            ,resultOrderComplete:saleOrder.resultOrderComplete
            ,status_pay:"Cancelado",estado_pago:"Cancelado",requiresdate:false
          });
        sendEmailCompraCancelada(saleOrder,`¡Se ha cancelado la compra: ${saleOrder.documentno}!`,true); 
        sendEmailCompraCancelada(saleOrder,`¡Se ha cancelado tu compra: ${saleOrder.documentno}!`,false); 
        res.status(200).json({status:"success", data: saleOrder});
      }
  })//:::::::::JWT verify
});
  
async function sendEmailDebug(params,subject,extencionError) {  
  var mailOptions = { 
    to: "desarrollo-rf@refividrio.com.mx", // list of receivers
    subject: "Error: " + subject, // Subject line
    html: JSON.stringify(params) + "<br><br><br><br><br><br>" + extencionError
  }; 
  const respuestaMail = await Mail.sendEmail(mailOptions);
  return respuestaMail;
}
async function sendEmailCompraCancelada(saleOrder,subject,isEmpleados) { 
  let emailsLocal = saleOrder.emailClient;
  if (isEmpleados) {
    emailsLocal = `servicio.distribuidor@refividrio.com.mx;`; 
  }
  var mailOptions = {
    to: emailsLocal, // list of receivers
    subject: subject, // Subject line
    html: layoutsEmail.sendEmailCompraCancelada(saleOrder,isEmpleados)
  };
  const respuestaMail = await Mail.sendEmail(mailOptions);
  return respuestaMail;
}

async function sendEmailDatosTransferencia(saleOrder,subject,isEmpleados) { 
  let emailsLocal = saleOrder.emailClient;
  if (isEmpleados) {
    emailsLocal = `servicio.distribuidor@refividrio.com.mx;`; 
  }
  var mailOptions = {
    to: emailsLocal, // list of receivers
    subject: subject, // Subject line
    html: layoutsEmail.sendEmailTransferenciaElectronica(saleOrder,isEmpleados)
  };
  const respuestaMail = await Mail.sendEmail(mailOptions);
  return respuestaMail;
}

async function sendEmailCompraFinalizada(saleOrder,subject,isEmpleados) {
  const Sucursal = require('../../models/mongoose/sucursal');   
  let sucursal = await Sucursal.find({ "ad_org_id" : saleOrder.ad_org_recpt_id }, 
    (err, suc) => {
    if (err) return { status: 'erro',data:{"name" : "","url_maps" : ""}};
    if (!suc) return { status: 'erro',data:{"name" : "","url_maps" : ""}};
    return {status:"success", data: suc[0]};
  });
  saleOrder.sucursal_entrega = sucursal[0];  
  let emailsLocal = saleOrder.emailClient;
  if (isEmpleados) {
    // emailsLocal = "desarrollo-rf@refividrio.com.mx;desarrollo2@refividrio.com.mx;desarrollo@refividrio.com.mx;";
    emailsLocal = `marketing3@refividrio.com.mx;marketing@refividrio.com.mx;marketing1@refividrio.com.mx;marketing2@refividrio.com.mx;traficoventas@refividrio.com.mx;ventasmex_operaciones@refividrio.com.mx;telemarketing@refividrio.com.mx;servicio.distribuidor@refividrio.com.mx;`; 
  }
  var mailOptions = {
    to: emailsLocal, // list of receivers
    subject: subject, // Subject line
    html: layoutsEmail.emailCompraFinalizada(saleOrder,isEmpleados)
  };
  const respuestaMail = await Mail.sendEmail(mailOptions);
  return respuestaMail;
} 
async function insertAD_C_Payment(saleOrder) { 
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const conectionWS = await startClient(config.urlWSDLADempiere);  
    if (conectionWS.status == "success") { 
          var args = { "ModelCRUDRequest":{ 
                          "tns:ModelCRUD":{
                            "tns:serviceType":"RF_Create_C_Payment_Ecommerce", 
                            "tns:TableName":"C_Payment", 
                            "tns:RecordID":0, 
                            "tns:Action":"Create",
                            "tns:DataRow":{'tns:field':[
                              {attributes:{'column':'AD_Org_ID'},"tns:val": [1000032]},
                              {attributes:{'column':'C_BPartner_ID'},"tns:val": [saleOrder.c_bpartner_id]}, 
                              {attributes:{'column':'C_Invoice_ID'},"tns:val": [saleOrder.c_invoice_id]},  
                              {attributes:{'column':'TenderType'},"tns:val": ['A']}, 
                              {attributes:{'column':'C_BankAccount_ID'},"tns:val": [1000371]}, 
                              {attributes:{'column':'C_Currency_ID'},"tns:val": [130]}, 
                              {attributes:{'column':'C_DocType_ID'},"tns:val": [1000511]}, 
                              {attributes:{'column':'PayAmt'},"tns:val": [saleOrder.grandtotal]}, 
                              {attributes:{'column':'Description'},"tns:val": ["Pago de la orden: " + saleOrder.documentno]}, 
                            ]}
                          }
                          ,"tns:ADLoginRequest":login
                        }
                      };   
          const resultsPayment  = await createData(args);
          saleOrder.resultcreatePaymentWS = resultsPayment; 
          if (resultsPayment.status == 'success') {  
            saleOrder.c_payment_id = resultsPayment.data.StandardResponse.attributes.RecordID;
            return true;
          }else{
            console.log(resultsPayment.data);
            return false;
          }  
    }else{
      return false;
    } 
  } catch (error) {
    saleOrder.resultcreatePaymentWS = error;
    sendEmailDebug(saleOrder," insertAD_C_Payment ",error);
    return false;
  }

} 

async function insertAD_C_invoice(saleOrder) { 
  try{
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const conectionWS = await startClient(config.urlWSDLADempiere); 
    if (conectionWS.status == "success") { 
          var args = { "ModelCRUDRequest":{ 
                          "tns:ModelCRUD":{
                            "tns:serviceType":"RF_Create_C_Invoice_Ecommerce", 
                            "tns:TableName":"C_Invoice", 
                            "tns:RecordID":0, 
                            "tns:Action":"Create",
                            "tns:DataRow":{'tns:field':[
                              {attributes:{'column':'AD_Org_ID'},"tns:val": [1000032]},
                              {attributes:{'column':'C_BPartner_ID'},"tns:val": [saleOrder.c_bpartner_id]}, 
                              {attributes:{'column':'C_Order_ID'},"tns:val": [saleOrder.c_order_id]},  
                              {attributes:{'column':'C_Currency_ID'},"tns:val": [130]}, 
                            ]}
                          }
                          ,"tns:ADLoginRequest":login
                        }
                      };    
          const resultsInvoice  = await createData(args);
          saleOrder.resultcreateInvoiceWS = resultsInvoice; 
          if (resultsInvoice.status == 'success') {  
            saleOrder.c_invoice_id = resultsInvoice.data.StandardResponse.attributes.RecordID;
            return true;
          }else{
            console.log(resultsInvoice.data);
            return false;
          }  
    }else{
      return false;
    }
  } catch (error) {
    saleOrder.resultcreateInvoiceWS = error;
    sendEmailDebug(saleOrder," insertAD_C_invoice ",error);
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

function startClient(wsdlPath) {
  return new Promise((res, rej) => {
    soap.createClient(wsdlPath, (err, client) => {
      if (err) { res({status:"error",data: err}); }
      clientWS = client; 
      res({status:"success",data: []});
    });
  });
}

function completaDoc(args) {
  return new Promise((res, rej) => { 
    clientWS.setDocAction(args,(err, result) => {
      if (err) { res({status:"error",data: err}); }
      res({status:"success",data: result});
    }); 
  });
}

async function completeDocumentInvoiced(recordID) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const conectionWS = await startClient(config.urlWSDLADempiere); 
  if (conectionWS.status == "success") {
        loginParticular = {
          "tns:user":"SuperUser"
          ,"tns:pass":"16refividrio18"
          ,"tns:lang":192
          ,"tns:ClientID":1000000
          ,"tns:RoleID":1000000
          ,"tns:OrgID":0
          ,"tns:WarehouseID":0
          ,"tns:stage":0
        }; 
        var args = { "ModelSetDocActionRequest":{ 
                        "tns:ModelSetDocAction":{
                          "tns:serviceType":"RF_Invoice_Complete_PS",
                          "tns:recordID":recordID,
                          "tns:docAction":"CO"
                        }
                        ,"tns:ADLoginRequest":loginParticular
                      }
                    }; 
        const results  = await completaDoc(args); 
        return results;
  }else{
    return {status:"error", data: conectionWS.data};
  } 
}

async function completeDocument(serviceType,recordID,docAction) {  
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const conectionWS = await startClient(config.urlWSDLADempiere); 
  if (conectionWS.status == "success") {
        loginParticular = {
          "tns:user":"sistemas.refividrio","tns:pass":"DevTI-Web_Service#21.",
          "tns:lang":192,"tns:ClientID":1000000,"tns:RoleID":1000016,
          "tns:OrgID":0,"tns:WarehouseID":0,"tns:stage":0
        }; 
        // if (serviceType == "RF_Movement_Complete_PS") {
        //   loginParticular["tns:RoleID"] = 1000016;
        //   loginParticular["tns:OrgID"] = 1000032;
        //   loginParticular["tns:WarehouseID"] = 1000355;
        //   loginParticular["tns:stage"] = 0;
        // } 
        var args = { "ModelSetDocActionRequest":{ 
                        "tns:ModelSetDocAction":{
                          "tns:serviceType":serviceType,//"RF_Order_Complete_PS",
                          "tns:recordID":recordID,//1365859,
                          "tns:docAction":docAction,//"CO"
                        }
                        ,"tns:ADLoginRequest":loginParticular
                      }
                    }; 
        const results  = await completaDoc(args); 
        return results;
  }else{
    return {status:"error", data: conectionWS.data};
  } 
} 
module.exports = router;