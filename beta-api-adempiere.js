const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
var login = require('./controller/login');
var products = require('./controller/ctlM_product');
var shopingcar = require('./controller/mongoose/ctlShopingcar');
var sucursal = require('./controller/mongoose/ctlSucursal');
var saleorder = require('./controller/mongoose/ctlSaleOrder');
var preregistro = require('./controller/mongoose/ctlPreRegistro');
var socioNegocio = require('./controller/mongoose/ctlSocioNegocio');
var foro = require('./controller/mongoose/ctlForo');
var queja = require('./controller/mongoose/ctlQuejaSugerencia');
var SeguimientoPedido = require('./controller/AD/ctlSeguimientoPedido');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/user', login);
app.use('/productos', products);
app.use('/shopingcar', shopingcar);
app.use('/sucursal', sucursal);
app.use('/saleorder', saleorder);
app.use('/preregistro', preregistro);
app.use('/partner', socioNegocio); 
app.use('/foro', foro);
app.use('/queja', queja);
app.use('/seguimientopedido', SeguimientoPedido);

const mongoose = require('mongoose'); 

mongoose.connect('mongodb://74.208.159.188:27017/e-commers-pruebas', {
  auth: {user: 'e-commers-user',password: 'mongo-e-come.#d'},
  useNewUrlParser: true, useUnifiedTopology: true,'useCreateIndex': true
})
.then(() => console.log('connection Mongo DB successful'))
.catch((err) => console.error(err));
 
// const port = process.env.PORT || 5000;
// app.listen(port, (err) => {
//   if (err) return console.log(err);
//   console.log('server running on port ' + port);
// })

// Produccion 
const options = {
  key: fs.readFileSync('./cert/_.refividrio.com.mx_private_key.key'),
  cert: fs.readFileSync('./cert/refividrio.com.mx_ssl_certificate.cer')
}; 
//CORS Middleware
app.use(function (req, res, next) { 
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
  next();
});  
//Enviroment Production
// https.createServer(options, app).listen(5000); 
https.createServer(options, app).listen(5001); //Beta

const port = process.env.PORT || 4001;
app.listen(port, (err) => {
  if (err) return console.log(err);
  console.log('server Pruebas running on port ' + port);
});