
module.exports = {   
    emailAprovedPreRegistro(data){
        let credito = '';
        if (data.montPreAprobed > 0) { 
            let img=''; 
            switch (parseInt(data.montPreAprobed)) {
                case 1500:
                    img = "Aprobado1.jpg";
                break;
                case 2000:
                    img = "Aprobado2.jpg";
                break;
                case 3000:
                    img = "Aprobado3.jpg";
                break;
                case 5000:
                    img = "Aprobado5.jpg";
                break;
                case 7000:
                    img = "Aprobado7.jpg";
                break;
                case 10000:
                    img = "Aprobado10.jpg";
                break;          
            } 
            if (img != '') {
                credito =`
                <tr>
                    <td class="esd-block-text es-p15t" align="left">
                        <center><img src="https://aromatizantes.refividrio.com.mx/${img}" width="80%" /></center>
                    </td>
                <tr>`;
            }else{
                credito =` 
                <tr>
                        <td class="esd-block-text es-p15t" align="left">
                            <center><img src="https://aromatizantes.refividrio.com.mx/no-credito.jpg" width="80%" /></center>
                        </td>
                <tr>`;
            }   
        }else{
            credito =` 
            <tr>
                    <td class="esd-block-text es-p15t" align="left">
                        <center><img src="https://aromatizantes.refividrio.com.mx/no-credito.jpg" width="80%" /></center>
                    </td>
            <tr>`;
        }  
        return  `
        ${header}  
            <table width="100%" cellspacing="0" cellpadding="0">
                <tbody> 
                    <tr>
                        <td class="esd-container-frame" width="520" valign="top" align="center">
                            <table width="100%" cellspacing="0" cellpadding="0">
                                <tbody>
                                    <tr>
                                        <td class="esd-block-text es-m-txt-l" align="left">
                                            <h2>
                                                ¡${'ESTIMADO(A) ' + data.nombreSolicitante.toUpperCase()} FELICIDADES! 
                                            </h2> 
                                        </td>
                                    </tr>   
                                    ${credito}
                                </tbody>
                            </table>
                        </td>
                    </tr> 
                </tbody>
            </table> 
        <br>   
        ${footer}`; 
    } 
    ,emailPreRegistro(data){   
        let credito = '';
        if (data.montPreAprobed > 0) {
            let img = '';
            switch (parseInt(data.montPreAprobed)) {
                case 1000:
                    img = "Aprobado1.jpg";
                break;
                case 2000:
                    img = "Aprobado2.jpg";
                break;
                case 3000:
                    img = "Aprobado3.jpg";
                break;
                case 5000:
                    img = "Aprobado5.jpg";
                break;
                case 7000:
                    img = "Aprobado7.jpg";
                break;
                case 10000:
                    img = "Aprobado10.jpg";
                break;          
            } 
            img = "";
            if (img != '') {
                credito =`
                <tr>
                    <td class="esd-block-text es-p15t" align="left">
                        <center><img src="https://aromatizantes.refividrio.com.mx/${img}" width="100%" /></center>
                    </td>
                <tr>`;
            }  
        }  
        return  `
                ${header}  
                <table width="100%" cellspacing="0" cellpadding="0">
                <tbody> 
                    <tr>
                        <td class="esd-container-frame" width="520" valign="top" align="center">
                            <table width="100%" cellspacing="0" cellpadding="0">
                                <tbody>
                                    <tr>
                                        <td class="esd-block-text es-m-txt-l" align="center">
                                            <h2>
                                                 ${'ESTIMADO(A) ' + data.nombreSolicitante.toUpperCase()}
                                            </h2> 
                                        </td>
                                    </tr> 
                                    <tr>
                                        <td class="esd-block-text es-m-txt-l" align="center">
                                            <img src="https://aromatizantes.refividrio.com.mx/pre-registro.jpg" width="100%" />
                                        </td>
                                    </tr> 
                                    <tr>
                                        <td class="esd-block-text es-p15t" align="center">
                                            <h4>FOLIO DE SOLICITUD: ${data.folio}</h4>
                                        </td>
                                    </tr> 
                                    <tr>
                                        <td class="esd-block-text es-p15t" align="center">
                                            <table style="margin-top: 10;margin-bottom: 10;" > 
                                                <tr>
                                                    <td>Solicitante</td>
                                                    <td>${data.tipoSolicitante[0].tipo}</td>
                                                </tr> 
                                                <tr>
                                                    <td>Nombre</td>
                                                    <td>${data.nombreSolicitante}</td>
                                                </tr>
                                                <tr>
                                                    <td>RFC</td>
                                                    <td>${data.tipoSolicitante[0].rfcColborador}</td>
                                                </tr> 
                                                <tr>
                                                    <td>Celular</td>
                                                    <td>${data.numeroCelular}</td>
                                                </tr> 
                                                <tr>
                                                    <td>Correo Electrónico</td>
                                                    <td>${data.email}</td>
                                                </tr> 
                                            </table>  
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <br>
                        </td>
                    </tr>
                    <br>
                    ${credito}   
                </tbody>
            </table> 
            <br> 
            <br>
            ${footer}`;
            //line 149 ${dataFactura}
        // <p style="color: mediumblue;">A partir del día 14 de Junio podrás ingresar a la tienda Online.</p>
    } 
    ,emailUpdateUser(data){   
        let passReset = '';
        if (data.isResetPass) {
            passReset = `
            <br>
            <h3>ESTIMADO(A) ${data.cpname.toUpperCase()}</h3>
            <h3>Hemos reiniciado tu contraseña, si no solicitaste este
             movimiento contactanos a nuestro número de contacto.</h3>
            <p>Ingresa con las siguientes credenciales de acceso.</p>
            <center>
                <table border=1 align="center">
                    <tr>
                        <td>Usuario:</td>
                        <td><strong>Número celular/correo electrónico</strong></td>
                    </tr> 
                    <tr>
                        <td>Contraseña</td>
                        <td><strong>refividrio</strong></td>
                    </tr>
                </table> 
            </center>  
            `;
        } 
        if (data.Isinactive) {
            passReset = ` 
            <br><br>
            <tr>
                <td class="esd-block-text es-p15t" align="left">
                    <center><img src="https://aromatizantes.refividrio.com.mx/Baja.jpg" width="100%" /></center>
                </td>
            <tr> 
            `;
        } 
        return  `
            ${header} 
            ${passReset}  
            <br><br>
            ${footer}`;
    },  
    sendEmailchangePassword(dataUser){
        return  `
        ${header}
        <br>
        <center>
        <h2>ESTIMADO(A) ${dataUser.cpname.toUpperCase()} ACTIVA TU CUENTA.</h2> 
        <h1>Código de seguridad <br>${dataUser.code}</h1>
        <h3 >Usa el siguiente código de seguridad para la cuenta
        <a style="color:#129BD7;">
            ${dataUser.email.substring(0,2)}*****${dataUser.email.substring(dataUser.email.indexOf('@'),dataUser.email.length)}
        </a>
        </h3>
        <center>
        <br><br>
        ${footer}`;
    } 
    ,sendEmailAccountActivate(dataUser){
        return  `
        ${header}
        <br>
        <center>
        <h2>ESTIMADO(A) ${dataUser.cpname.toUpperCase()} TU CUENTA HA SIDO ACTIVADA CORRECTAMENTE.</h2>   
        <center>
        <br><br>
        ${footer}`;
    }
    ,sendEmailchangePasswordSucces(dataUser){
        return  `
        ${header}
        <br><center>
        <h2>ESTIMADO(A) ${dataUser.cpname.toUpperCase()} TU CONTRASEÑA HA SIDO CAMBIADA CORRECTAMENTE.</h2>   
        <center><br><br>
        ${footer}`;
    },sendEmailCompraCancelada(data,isEmpleado){
        let value = "<br><center>";
        if (!isEmpleado) {
            value += ` 
            <h2>No. Orden: ${data.documentno}</h2>
            <h2>ESTIMADO(A) ${data.nombre_cliente.toUpperCase()} Tu orden ha sido cancelada ya que no se recibió tu pago.</h2>   
            <br>
            <h4>Si tienes alguna duda sobre tu pedido, Contáctanos a través de
                <a href="https://api.whatsapp.com/send?phone=525551757108" target="_new">
                    WhatsApp 55-5175-7108
                </a></h4>
            `;
        } else {
            value += ` 
            <h2>No. Orden: ${data.documentno}</h2>
            <h2>Se ha cancelado la orden de venta ${data.documentno} al igual que su movimiento de material.</h2>    
            <center> 
            `;
        }
        return  `${header}${value}${footer}`;
    },sendEmailPagoRecibido(data){
        return `${header}
            <br><center>
            <h2>No. Orden: ${data.documentno}</h2>
            <h2>ESTIMADO(A) ${data.nombre_cliente.toUpperCase()} recibimos tu pago.</h2>   
            <br>
            <h4>En breve recibirás la confimación de tu pedido con la fecha de disponibilidad para su entrega.
            </h4><br>
            <h5>Si tienes alguna duda sobre tu pedido, Contáctanos a través de
                <a href="https://api.whatsapp.com/send?phone=525551757108" target="_new">
                    WhatsApp 55-5175-7108
                </a>
            </h5>
            ${footer}
            `;
    },sendEmailTransferenciaElectronica(data,isEmpleado){
        let value = "<br><center>";
        if (!isEmpleado) {
            value += `
            <h2>No. Orden: ${data.documentno}</h2>
            <h2>ESTIMADO(A) ${data.nombre_cliente.toUpperCase()} has elegido pagar por transferencia bancaria. </h2>   
            <h3>Aquí está la información que necesita para realizar la transferencia:</h3>
            <center><br><br>
            <div style="text-align:left;" >
            <p>Importe: <strong>${formatMXN(parseFloat(data.grandtotal))}</strong></p>
            <p>Titular de la cuenta: <strong>RFV TRUCK PARTS AND ACCESSORIES SA DE CV</strong></p>
            <p>Detalles de la cuenta: <strong>No. Cuenta: 0116523536</strong></p>
            <p>No. Cuenta CLABE: <strong>012180001165235368</strong></p>
            <p>Dirección del banco: <strong>Bancomer</strong></p>
            <p>Por favor, incluye el número de orden: <strong>${data.documentno}</strong> en los detalles de la transferencia bancaria.</p>
            </div>
            `;
        } else {
            value += ` 
            <h2>No. Orden: ${data.documentno}</h2>
            <h2>Se ha fincado un pedido con pago en transferencia bancaria, favor de
                 corroborar el pago y actualizar el estado de la orden.</h2>    
            <center>
            <br>
                <div style="text-align:left;" >
                <p>Cliente: <strong>${data.nombre_cliente.toUpperCase()}</strong></p>
                <p>Importe: <strong>${formatMXN(parseFloat(data.grandtotal))}</strong></p>
                <p>Titular de la cuenta: <strong>RFV TRUCK PARTS AND ACCESSORIES SA DE CV</strong></p>
                <p>Detalles de la cuenta: <strong>No. Cuenta: 0116523536</strong></p>
                <p>No. Cuenta CLABE: <strong>012180001165235368</strong></p>
                <p>Dirección del banco: <strong>Bancomer</strong></p>
                <p>El número de orden: <strong>${data.documentno}</strong> deberá aparecer en los detalles de la transferencia bancaria.</p>
                </div>
                <br><br>
            `;
        }
        return  `${header}${value}${footer}`;
    }
    ,emailCompraFinalizada(data,isEmployee){
        let formaPagoText = "";
        switch (data.method_pay.toUpperCase()) {
            case "CRE":
                formaPagoText = "CRÉDITO REFIVIDRIO"
            break;
            case "EFE":
                formaPagoText = "PAGO EN SUCURSAL"
            break;
            case "PAYPAL":
                formaPagoText = "PAGO INMEDIATO PAYPAL"
            break;
            case "TRA":
                formaPagoText = "TRANSFERENCIA ELECTRÓNICA"
            break;
            default:
                formaPagoText = "No DEFINIDO"
            break;
        }   
        let pago = `   
        <h4> Forma de pago: ${formaPagoText}  <br>Estado: ${data.status_pay.toUpperCase()}</h4>`; 
        // let formaEntrega = 'Tu entrega la podrás recoger'; 
        // if (data.sucursal_entrega.ad_org_id == 1000005) { 
        //     formaEntrega += ` a partir del día ${formatDate(data.created_at,1)}`; 
        //     if (data.method_pay == "EFE") {
        //         formaEntrega += ` y tendrás hasta el día ${formatDate(data.created_at,6)} para efectuar 
        //         tu pago en sucursal, de lo contrario tu pedido no se reservará.`;
        //     }
        // } else { //POReference
        //     formaEntrega += ` a partir del día ${formatDate(data.created_at,10)}`; 
        // }
        let formaEntrega = "";  
        if (isEmployee) {
            formaEntrega = `La entrega debé estar disponible a partir del día ${formatDate(data.fechaprometida)} a las ${data.horaprometida}:00:00 hrs`; 
        }else{
            formaEntrega = data.fechaprometidatexto;//`Tu entrega estará disponible a partir del día ${data.fechaprometida}`; 
        }
        let entrega = `   
            <center><h3> ${formaEntrega}</h3>
                <p style="color:#0E0494;">
                Horarios de atención en sucursal:
                <br>Lunes a Viernes de 9:00 hrs. a 18:30 hrs.
                <br>Sabado de 9:00 hrs. a 14:30 hrs.
                </p>
                
            </center>  
            <center>
                <p style="color:#00ABB9;">
                ENTREGA EN ${data.sucursal_entrega.name} <br>
                <a href="${data.sucursal_entrega.url_maps}" target="_new">
                encontrar en en el mapa <img src="https://aromatizantes.refividrio.com.mx/ubicacion.png" width="25px" />
                </a></p>
            </center>
            <br>
        `; 
        if (parseFloat(data.grandtotal)>=5000) {
            if (data.productoregalo.toString() == "1018346") {
                entrega += `
                <center>
                <p>${isEmployee == false?'Has recibido un regalo por tu compra superior a $5,000 MXN'
                    :'Favor de incluir el regalo del cliente.'    
                }</p>
                <table>
                <tr style='height: 100px;'>
                <td ><img width="100" src="https://refividrio.com.mx/imgdis/P15UN0978.jpg"></td> 
                <td>BOLSAS CIMBOA BLANCA AROMAS DE ANDALUCIA (5 PZ)</td>
                </tr>
                </table></center>
                <br>
                `;
            }
            if (data.productoregalo.toString() == "1018347") {
                entrega += `
                <center>
                <p>${isEmployee == false?'Has recibido un regalo por tu compra superior a $5,000 MXN'
                    :'Favor de incluir el regalo del cliente.'    
                }</p>
                <table>
                <tr style='height: 100px;'>
                <td ><img width="100" src="https://refividrio.com.mx/imgdis/P15UN0979.jpg"></td> 
                <td>BOLSAS CIMBOA VERDE AIR NATUR (5 PZ)</td>
                </tr>
                </table></center>
                <br>
                `;
            } 
        }
        let productos = `  
        <table style='width: 100%;'>
        <tr style="background:#5B5B5B;color:#fff" >
            <td></td>
            <td><center>PRODUCTO</center></td>
            <td style='width: 20%;'><center>CANTIDAD</center></td>
            <td style='width: 20%'><center>SUBTOTAL</center></td>
        </tr>`;
        let isProdOrdenados = false;
        let productosOrdenados =""; 
        for (let index = 0; index < data.productos.length; index++) {
            const producto = data.productos[index];
            productos += `
                    <tr style='height: 100px;'>
                        <td ><img width="100" src="https://refividrio.com.mx/imgdis/${producto.value}.jpg"></td> 
                        <td>${producto.name}`;

                            
                if(parseInt(producto.cantidadOrdenada) <= 0){
                    productos +=  "<div style='font-size:12px;color:#00ABB9;'>Cantidad disponible para entregar.</div>";
                }else{
                    productos += "<div style='font-size:12px;color:#CA1616;'>"; 
                        if(parseInt(producto.cantidadExistente) == 0){
                            productos += "No contamos con pzas disponibles";
                        }else{
                            productos += `Solo contamos con ` + producto.cantidadExistente +
                            `${(producto.cantidadExistente == 1 ? " pza disponible":" pzas disponibles")}`;
                        }
                    productos += " para entregar.</div>";
                }

            productos += `
                        </td>
                        <td><center>${producto.quantity} X ${formatMXN(parseFloat(producto.price))}</center></td>
                        <td><center>${formatMXN(parseFloat(producto.total))}</center></td>
                    </tr> `;
            if (producto.cantidadOrdenada > 0)  
                isProdOrdenados = true;  
            
        }
        if (isProdOrdenados) {
            if (isEmployee) {
                productosOrdenados = `  
                <strong>
                    <h4 style="color:#00ABB9;">
                    Esta compra tiene productos en forma de pedido, favor de revisar existencias y comunicarse con el cliente lo antes posible.
                    </h4>
                </strong>`; 
            }else{
                productosOrdenados = `  
                    <strong>
                        <h4 style="color:#00ABB9;">
                        Tu compra tiene productos en forma de pedido, nuestros agentes de ventas se comunicarán
                        contigo en cuento la existencia del producto este disponible.
                        </h4>
                    </strong>`; 
            }
            
        }else{
            productosOrdenados = "";
        }
        productos += `
            <tr>
                <td></td>
                <td><center>TOTAL<center></td>
                <td  style="background:#5B5B5B;color:#fff;height: 50px;" >
                <strong><center>${formatMXN(parseFloat(data.grandtotal))}</center></strong></td>
            </tr> `; 
        productos += `</table>`
        let email = ''; 
        email = `
        <center><h4>No. Orden: ${data.documentno}</h4></center>
        <center>
            ${!isEmployee ?
                `<h3>Hola ${data.nombre_cliente.toUpperCase()}<br>¡Gracias por comprar en Refividrio!</h3>`:
                `<h3>El cliente ${data.nombre_cliente.toUpperCase()}<br>realizo su compra, favor de atender lo antes posible.</h3>`
            } 
        </center>
        <center> ${pago} </center>  
        ${entrega} 
        Fecha compra: ${formatDate(data.created_at)}
        <center> 
            ${productos}
        </center> 
        ${productosOrdenados} 
        <br><br><br>
        `;

        if (data.method_pay == "CRE") {
            email += `
            <br>
            <h3>Esta es la información que necesita si requieres realizar la transferencia de tu pago:</h3>
            <center><br>
            <div style="text-align:left;" >
            <p>Importe: <strong>${formatMXN(parseFloat(data.grandtotal))}</strong></p>
            <p>Titular de la cuenta: <strong>RFV TRUCK PARTS AND ACCESSORIES SA DE CV</strong></p>
            <p>Detalles de la cuenta: <strong>No. Cuenta: 0116523536</strong></p>
            <p>No. Cuenta CLABE: <strong>012180001165235368</strong></p>
            <p>Dirección del banco: <strong>Bancomer</strong></p>
            <p>Por favor, incluye el número de orden: <strong>${data.documentno}</strong> en los detalles de la transferencia bancaria.</p>
            </div>
            <br>
            `; 
        } 

        if (!isEmployee) {
            email += `
            Si tienes alguna duda sobre tu pedido, Contáctanos a través de
                <a href="https://api.whatsapp.com/send?phone=525551757108" target="_new">
                    WhatsApp 55-5175-7108
                </a>
            <!-- <br>
            Si lo deseas, puedes revisar nuestros Términos y Condiciones, garantías y 
            políticas de devolución aplicables a tu pedido. -->
            <br> 
            Puedes seguir Comprando aquí <a href="https://aromatizantes.refividrio.com.mx/shop/" target="_new">Ecommerce para distribuidores</a>,
            esperamos que encuentres algo de tu agrado.
            <br><br>
            <center><h4>¡Te esperamos de vuelta!</h4>
            <br> <br>
            Sin otro particular, se despide atentamente
            <br>
            Equipo de servicio al cliente - Refividrio</center>
            `; 
        }
        return  `
            ${header}
            <br>
            ${email}
            <br><br>
            ${footer}`;
    } 
    ,test(data){} 
}

function formatMXN(value) {
    var formatter = new Intl.NumberFormat('en-ES', {style: 'currency', currency: 'USD',});
    return formatter.format(value);
}
function formatDate(dates) {
    try {
        var month= ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio",
        "Agosto","Septiembre","Octubre","Nobiembre","Diciembre"];  
        return `${(new Date(Date.parse(dates))).getDate()} de ${month[(new Date(Date.parse(dates))).getMonth()-1]} del ${(new Date(Date.parse(dates))).getFullYear()}`;
    } catch (error) {
        return "sin fecha";
    }  
}
function formatDate(dates,numDays) {
    if (dates === undefined)return "Error de Fecha" 
    try {
        var month= ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Nobiembre","Diciembre"];  
        let date = new Date(Date.parse(dates)); 
        if (numDays > 0) {
            for (let index = 1; index < numDays+1; index++) {
                date = addDays(date, 1); 
                while (date.getDay() == 0 || date.getDay() == 6) {
                    date = addDays(date, 1); 
                } 
            }
        } 
        return `${date.getDate()} de ${month[date.getMonth()]} del ${date.getFullYear()}`;
    } catch (error) {
        console.log(error);
        return "Error de Fecha";
    }
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}


const header =`
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title></title> 
</head>

<body>
    <div class="es-wrapper-color">
        <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="background-position: center top;">
            <tbody>
                <tr>
                    <td class="esd-email-paddings" valign="top">
                        <table class="es-content" cellspacing="0" cellpadding="0" align="center">
                            <tbody>
                                <tr>
                                    <td class="esd-stripe" align="center">
                                        <table class="es-content-body" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">
                                            <tbody>
                                                <tr>
                                                    <td class="esd-block-image" align="left" style="font-size:0">
                                                        <br>
                                                        <center>
                                                            <img src="https://aromatizantes.refividrio.com.mx/refivid.png"
                                                             style="display: block;" width="199">
                                                        </center>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="esd-structure es-p30t es-p40r es-p40l" style="background-repeat: no-repeat;" align="left">
`; 

const footer = `
<center><br><h3>Visita el <a href="https://aromatizantes.refividrio.com.mx/shop/" target="_new">
ecommerce para distribuidores</a></h3></center>
</td>
</tr> 
<tr>
    <td class="esd-structure es-p20t es-p40b es-p40r es-p40l" align="left">
        <table width="100%" cellspacing="0" cellpadding="0">
            <tbody>
                <tr>
                    <td class="esd-container-frame" width="520" valign="top" align="center">
                        <table width="100%" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                    <td>
                                    <center>
                                    <br> 
                                        ¿Dudas? Contáctanos a través de 
                                        <a href="https://api.whatsapp.com/send?phone=525551757108" target="_new">
                                            WhatsApp 55-5175-7108
                                        </a>
                                        o al correo<br> 
                                        <a href="mailto:servicio.distribuidor@refividrio.com.mx">servicio.distribuidor@refividrio.com.mx</a> 
                                    <center>
                                    </td> 
                                </tr>
                               <!-- <tr>
                                    <td class="esd-block-image" align="left" style="font-size:0">
                                        <br><br><br>
                                        <img src="https://aromatizantes.refividrio.com.mx/refivid.png" 
                                        style="display: block;" width="199">
                                    </td>
                                </tr> -->
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </td>
</tr> 
</tbody>
</table>
</td>
</tr>
</tbody>
</table> 
<table cellpadding="0" cellspacing="0" class="es-footer" align="center">
<tbody>
<tr>
<td class="esd-stripe" esd-custom-block-id="9101" align="center">
<table class="es-footer-body" width="600" cellspacing="0" cellpadding="0" align="center">
<tbody>
<tr>
    <td class="esd-structure es-p20t es-p10r es-p10l" align="left">
        <table width="100%" cellspacing="0" cellpadding="0">
            <tbody>
                <tr>
                    <td class="esd-container-frame" width="580" valign="top" align="center">
                        <table width="100%" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                    <td class="esd-block-text es-p10t es-m-txt-c" align="center">
                                        <br>
                                        RFV TRUCK PARTS AND ACCESORIES S.A. DE C.V.<br> Carretera Federal México Pachuca KM 30, Col. La Esmeralda, 55765 Tecámac, Estado de México, México
                                        <br>&copy; ${new Date().getFullYear()} — <strong>Grupo Refividrio</strong>
                                        <br><br>
                                    </td>
                                </tr> 
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table> 
</td>
</tr>
</tbody>
</table>
</div>
</body>

</html>
`;