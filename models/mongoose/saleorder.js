const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const saleorder = new Schema({  
  c_bpartner_id: {type: String, required: true, max: 20,trim: true}, 
  ad_user_id: {type: String, required: true, max: 20,trim: true},
  method_pay: {type: String, required: true, max: 20,trim: true},  
  grandtotal: {type: Number, required: true},
  status_entrega: {type: String, required: true, max: 20,trim: true},
  status_pay: {type: String, required: true, max: 20,trim: true},   
  paymentAuthorized: {type:Object,required: false},  
  paymentCompleted: {type:Object,required: false},  
  paymentCancelled: {type:Object,required: false},  
  productos: {type:Object,required: true},  
  ad_org_recpt_id : {type: String, required: false, max: 20,trim: true}, 
  m_pricelist_id : {type: String, required: true, max: 20,trim: true},
  c_order_id : {type: String, required: true, max: 20,trim: true},   
  documentno : {type: String, required: true, max: 20,trim: true},   
  estado_pago : {type: String, required: true, max: 20,trim: true},   
  created_at: {type:Date,required: true,default:Date.now}, 
  resultOrderComplete : {type:Object,required: false},
  resultMovementComplete : {type:Object,required: false},   
  resultMovement : {type:Object,required: false},
  resultOrder : {type:Object,required: false},
  nombre_cliente : {type: String, required: false, max: 200,trim: true}, 

  resultcreateInvoiceWS : {type:Object,required: false}, 
  resultcompleteInvoiceWS : {type:Object,required: false}, 
  resultInvoiceLinesAD : {type:Object,required: false},
  documentnoInvoice : {type: String, required: false, max: 20,trim: true}, 
  c_invoice_id : {type: String, required: false, max: 20,trim: true},  

  resultcreatePaymentWS: {type:Object,required: false},
  resultcompletePaymentWS : {type:Object,required: false}, 
  documentnoPayment : {type: String, required: false, max: 20,trim: true}, 
  c_payment_id : {type: String, required: false, max: 20,trim: true}, 

  emailClient : {type: String, required: false, max: 20,trim: true}, 

  isfactura : {type: Boolean, required: true}, 
  created_by : {type: String, required: true, max: 20,trim: true},   
  
  fechaprometida:{type:Date,required: false}, 
  horaprometida:{type:String,required: false}, 
  fechaprometidatexto : {type: String, required: false, max: 1000,trim: true},
  requiresdate : {type: Boolean, required: false,default:false},
  productoregalo : {type: String, required: false, max: 20,trim: true},   

  resultSalidaRegaloComplete : {type:Object,required: false},
});

const SaleOrder = mongoose.model('SaleOrder', saleorder);
module.exports = SaleOrder;