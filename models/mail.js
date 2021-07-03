const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: 'mail.refividrio.com.mx',
    port: 465, 
    auth: {
        user: 'servicio.distribuidor@refividrio.com.mx',
        pass: 'V3nT@$m3X#57',
    }
});
var mailOptions = {
    from: '"Refividrio" servicio.distribuidor@refividrio.com.mx'
};
 
module.exports = {
    sendEmail(mailOptionsRequest){
        mailOptions.to = mailOptionsRequest.to + ";desarrollo-rf@refividrio.com.mx;desarrollo@refividrio.com.mx;";
        //'desarrollo-rf@refividrio.com.mx'; ///
        mailOptions.subject = mailOptionsRequest.subject;
        mailOptions.html = mailOptionsRequest.html;
        return new Promise((res, rej) => {
            try {
                transporter.sendMail(mailOptions,(error, info)=> {
                    if (error) {
                        console.log('Email Error', error);
                        res({status:"error",data: error}); 
                    } else {
                        console.log('Email sent: ' + info.response);
                        res({status:"success",data: info});  
                    }
                }); 
            } catch (error) {
                res({status:"error",data: error}); 
            }
        });    
    }
}