function emailCompraFinalizada() {
    const SaleOrder = require('../../models/mongoose/saleorder'); 
    let saleOrder = await SaleOrder.find({ "documentno" : "S27-6192" }, 
    (err, suc) => {
    if (err) return false;
    if (!suc) return suc;
    return {status:"success", data: suc[0]};
    });
    if (saleOrder != false) {
    saleOrder = saleOrder[0]; 
    saleOrder.sucursal_entrega = {url_maps:"",name:"Ventas Toluca"};
    var mailOptionsd = { 
        to: "marcos.moreno.gm@gmail.com", // list of receivers
        subject: " mn Gracias por su compra", // Subject line
        html: layoutsEmail.emailCompraFinalizada(saleOrder)
    };  
    console.log(saleOrder);   
    const respuestaMail = await Mail.sendEmail(mailOptionsd);
    return res.status(200).json(respuestaMail);
    } 
}
