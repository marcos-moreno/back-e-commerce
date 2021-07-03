
const express = require('express');
const router = express.Router();
const secretKey = 'MGsecretkey$Adempiere$NodeJS&vueJS';
const jwt = require('jsonwebtoken');
const Sucursal = require('../../models/mongoose/sucursal'); 
  
router.get('/get_auth', (req, res, next) => {
    let token = req.headers.token;
    jwt.verify(token, secretKey, (err, decoded) => {
    if (err){
        return res.status(200).json({ status: 'unauthorized'})
    }else{
      Sucursal.find({}, 
        (err, sucursales) => { 
        if (err) return res.status(200).json({ status: 'error',data:err});
        if (!sucursales) return res.status(200).json({ status:"success", data:""});
        return res.status(200).json({status:"success", data: sucursales})
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
      else if (decoded.rol != 'admin')return res.status(200).json({ status: 'unauthorized'})
      var sucursal = new Sucursal(req.body); 
      sucursal.save(function(err, doc) {
        if (err){return res.status(200).json({ status:"error", data:err});} 
        return res.status(200).json({status:"success", data: doc})
      }); 
    }
  })
});

router.get('/get_dias_entrega', (req, res, next) => {
  let token = req.headers.token;
  jwt.verify(token, secretKey,async (err, decoded) => {
  if (err){
      return res.status(200).json({ status: 'unauthorized'})
  }else{
    try {
      let sucursal = req.query.sucursal;  
      sucursal = JSON.parse(sucursal);
      let saleorder = req.query.saleOrder;
      saleorder = JSON.parse(saleorder);

      sucursal = await Sucursal.find({ad_org_id : sucursal.ad_org_id},(err, sucursales) => {
        if (err) return false;
        if (!sucursales) return false;
        return sucursales;
      });

      if(sucursal!=false) sucursal = sucursal[0];
      var days = ["Domingo","Lunes","Martes","Miercoles","Jueves","Viernes","Sabado"];
      var month= ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Nobiembre","Diciembre"];  
      // let diacompra = new Date('2021-06-28 13:59');
      let diacompra = new Date(); 
      let horacompra = diacompra.getHours();
      sucursal.isruta = sucursal.isruta === true|| sucursal.isruta ==='true'?true:false;
      if (sucursal.isruta) { 
        for (let index = 0; index < sucursal.rutas.length; index++) {
          const element = sucursal.rutas[index];
          let diarealQuesePrepara = diacompra; 
          while (diarealQuesePrepara.getDay() != element.dia_prepara) { 
            diarealQuesePrepara = addDays(diarealQuesePrepara, 1);
          }
          sucursal.rutas[index].diarealQuesePrepara = diarealQuesePrepara; 
        }   
        let rutaSeleccionada = 0;  
        for (let index = 0; index < sucursal.rutas.length; index++) {
            const element = sucursal.rutas[index];
            if (rutaSeleccionada == 0) {
              if (diacompra == element.diarealQuesePrepara) { 
                if (horacompra < element.hr_max) {
                  rutaSeleccionada = element;
                }
              }else{
                rutaSeleccionada = element;
              }
            }else{ 
              if (element.diarealQuesePrepara < rutaSeleccionada.diarealQuesePrepara) {
                if (diacompra == element.diarealQuesePrepara) { 
                  if (horacompra < element.hr_max) {
                    rutaSeleccionada = element;
                  }
                }else{
                  rutaSeleccionada = element;
                }
              }
            }  
        } 
        let diarealQuesLlega = diacompra; 
        while (diarealQuesLlega.getDay() != rutaSeleccionada.dia_llegada) { 
          diarealQuesLlega = addDays(diarealQuesLlega, 1);
        }
        let diaDisponible = {
          fecha:diarealQuesLlega,
          hora : 9,
          texto:`
            Tu pedido estará disponible para su entrega en la 
            ${sucursal.name} a partir del día ${days[diarealQuesLlega.getDay()]}
            ${ diarealQuesLlega.getDate()} 
            de ${month[diarealQuesLlega.getMonth()]} 
            del ${diacompra.getFullYear()} a las 9:00:00 hrs
        `};
        return res.status(200).json({status:"success", data:diaDisponible}); 
      }else{// No es ruta
        let diadeEspera = diacompra.getDay();
        let horaEspera = horacompra + 2;  
        let minutos = diacompra.getMinutes();
        if (minutos > 30) {
          horaEspera ++;
        }
        if (diacompra.getDay() == 6) {
          if (horaEspera >= 14) {
            horaEspera = 9;
            diadeEspera = 1; 
          } 
        }else if(diacompra.getDay() == 0){
          horaEspera = 9;
          diadeEspera = 1; 
        }else{
          if (horaEspera >= 18) {
            horaEspera = 9;
            diadeEspera ++; 
          }  
        } 
        let diarealQuesLlega = diacompra; 
        while (diarealQuesLlega.getDay() != diadeEspera) { 
          diarealQuesLlega = addDays(diarealQuesLlega, 1);
        }
        
        if (saleorder.method_pay == 'EFE') {
          let diaDisponible = [];
          let diarealQuesLlegaEFE = diarealQuesLlega;
          for (let index = 0; index < 4; index++) { 
            if (index == 0) {
              diaDisponible.push({
                fecha:diarealQuesLlegaEFE,
                hora : horaEspera,
                texto:`
                  Puedes pagar y recoger tu pedido en la ${sucursal.name} a partir del día ${days[diarealQuesLlegaEFE.getDay()]}
                  ${ diarealQuesLlegaEFE.getDate()} de ${month[diarealQuesLlegaEFE.getMonth()]} 
                  del ${diarealQuesLlegaEFE.getFullYear()} a las ${horaEspera}:00:00 hrs`
              });
            }else{
              diarealQuesLlegaEFE = addDays(diarealQuesLlegaEFE,1);
              diaDisponible.push({
                fecha:diarealQuesLlegaEFE,
                hora : 9,
                texto:`
                  Puedes pagar y recoger tu pedido en la ${sucursal.name} a partir del día ${days[diarealQuesLlegaEFE.getDay()]}
                  ${ diarealQuesLlegaEFE.getDate()} de ${month[diarealQuesLlegaEFE.getMonth()]} 
                  del ${diarealQuesLlegaEFE.getFullYear()} a las 9:00:00 hrs`
              });
            }
          }
          return res.status(200).json({status:"success", data:diaDisponible}); 
        }else{ 
          let diaDisponible = {
            fecha:diarealQuesLlega,
            hora : horaEspera,
            texto:`
              Tu pedido estará disponible para su entrega en la 
              ${sucursal.name} a partir del día ${days[diarealQuesLlega.getDay()]}
              ${ diarealQuesLlega.getDate()} 
              de ${month[diarealQuesLlega.getMonth()]} 
              del ${diacompra.getFullYear()}
              a las ${horaEspera}:00:00 hrs
              `
          };
          return res.status(200).json({status:"success", data:diaDisponible}); 
        } 
      }
     
     
    } catch (error) {
      console.log(error);
      return res.status(200).json({status:"error", data: error});
    }
  }//fin else
})
});  

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  if (result.getDay() == 0) {
    result.setDate(result.getDate() + 1);
  }
  return result;
} 
  
module.exports = router;