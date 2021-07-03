const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userModel = require("../models/AD/user");
const bcrypt = require('bcrypt');
const secretKey = 'MGsecretkey$Adempiere$NodeJS&vueJS';
const Mail = require("../models/mail.js");
const layoutsEmail = require("../layout/emails.js");
const passwordDefault = "$2b$10$7qXuRIJjog6jYPjiBiBS4OkEtUzCZ3rf0XGbXBWYIS2WXdLsup9g6";
const Req_change_pass = require('../models/mongoose/req_change_pass');

router.get('/exist', function (req, res, next) {
    userModel
    .exist(req.query.value)
    .then(user => { 
        // console.log(bcrypt.hashSync('refividrio', 10));
        res.json(user);
    }).catch(err => { 
        return res.status(500).send({status:"error",data:err});
    });
}); 
 

router.post('/login', (req, res, next) => {
    userModel
    .login(req.body.user)
    .then(user => {
        if (user.status == "success") {
            let usuario = user.data[0]; 
            if (!bcrypt.compareSync(req.body.password,usuario.passwordinfo)) {
                return res.status(200).json({
                    status: 'error',
                    error: 'invalid credentials'
                })
            }else{
                let token = jwt.sign({userId: usuario.ad_user_id,rol: 'user'},secretKey/*,{expiresIn:  '5d' }*/);
                if(usuario.passwordinfo == passwordDefault){
                    usuario.requires_password_change = true;
                    requesChangePassword(usuario,"Activa tu cuenta");
                }else {
                    usuario.requires_password_change = false;
                }
                usuario.passwordinfo = "";
                usuario.rol= 'user';
                return res.status(200).json({status: 'success',user:usuario,token: token});
            } 
        }else{
            res.json(user);
        } 
    }).catch(err => { 
        return res.status(500).send({status:"error",data:err});
    });  
});

router.post('/comprobarPasswordActual', (req, res, next) => { 
    let token = req.headers.token; 
    jwt.verify(token, secretKey, (err, decoded) => { 
        if (err){
            return res.status(200).json({ status: 'unauthorized'}) 
        }else{
            if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
            else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'})  
            userModel.userByToken(decoded.userId)
            .then(user => {
                let usuario = user.data[0];
                if (!bcrypt.compareSync(req.body.password,usuario.passwordinfo)) {
                    return res.status(200).json({ status: 'error',data:false});
                }else{ 
                    return res.status(200).json({status: 'success',data:true});
                } 
            }).catch(err => {  return res.status(200).json({ status: 'error',data:false});});
        }
    });
});

// var mailOptions = { 
//     to: usuario.email, // list of receivers
//     subject: "Activación de cuenta.", // Subject line
//     html: layoutsEmail.sendEmailchangePasswordSucces(usuario)
// };
// Mail.sendEmail(mailOptions); 

router.get('/validCodSeg', (req, res, next) => {
    let token = req.headers.token;   
    jwt.verify(token, secretKey, (err, decoded) => { 
        if (err){
            return res.status(200).json({ status: 'unauthorized'}) 
        }else{
            if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
            else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'})
            Req_change_pass.findOne({ad_user_id: decoded.userId,activo: true}).sort('-creado')
            .then((rawResponse) => {
                if (rawResponse.code == req.query.code) {
                    return res.status(200).send({status:"success",data:true});
                }else{
                    return res.status(200).send({status:"success",data:false});
                }
            }).catch((err) => {
                console.log("Req_change_pass.findOne" + err);
                return res.status(200).send({status:"error",data:err});
            }); 
        }
    })
});

router.put('/changePasswordUser', (req, res, next) => {
    let token = req.headers.token;   
    jwt.verify(token, secretKey, (err, decoded) => { 
        if (err){
            return res.status(200).json({ status: 'unauthorized'}) 
        }else{
            if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
            else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'}) 
            let newPassword = bcrypt.hashSync(req.body.password, 10); 
            req.body.user
            userModel
            .updatePasswordUser({password:newPassword , ad_user_id:decoded.userId})
            .then(userREs => {
                Req_change_pass.updateMany({ad_user_id: decoded.userId},{activo: false})
                .then((rawResponse) => {
                    console.log(rawResponse);
                }).catch((err) => {
                    console.log("updatePasswordUser" + err);
                });  
                userModel.userByToken(decoded.userId)
                .then(user => {
                    let usuario = user.data[0]; 
                    let subject = "";
                    let contentEmail = ''; 
                    if (req.body.isActivate) {
                        subject = "Activación de cuenta.";
                        contentEmail = layoutsEmail.sendEmailAccountActivate(usuario);
                    }else{
                        subject = "Cambio de contraseña."; 
                        contentEmail = layoutsEmail.sendEmailchangePasswordSucces(usuario);
                    }
                    var mailOptions = { 
                        to: usuario.email, // list of receivers
                        subject: subject, // Subject line
                        html: contentEmail
                      };  
                    Mail.sendEmail(mailOptions); 
                }).catch(err => { console.log(err);}); 
                return res.status(200).json(userREs);
            }).catch(err => {  
                console.log(err);
                return res.status(200).send({status:"error",data:err});
            }); 
            
        } 
    })
});

async function requesChangePassword(usuario,subject) {
    usuario.code = `${getRandomInt()}${getRandomInt()}${getRandomInt()}${getRandomInt()}${getRandomInt()}${getRandomInt()}`;  
    var mailOptions = { 
      to: usuario.email, // list of receivers
      subject: subject, // Subject line
      html: layoutsEmail.sendEmailchangePassword(usuario)
    }; 
    Req_change_pass.updateMany({ad_user_id: usuario.ad_user_id},{activo: false})
    .then((rawResponse) => {
        console.log(rawResponse);
    }).catch((err) => {
        console.log("SaleOrder.update" + err);
    }); 
    let req_change_pass = {
        code: usuario.code, 
        ad_user_id: usuario.ad_user_id,  
        expira : new Date(), 
        activo : true,    
    };
    req_change_pass  = new Req_change_pass(req_change_pass);
    req_change_pass.save();
    const respuestaMail = await Mail.sendEmail(mailOptions);
    return respuestaMail;
}  

function getRandomInt() {
    return Math.floor(Math.random() * (9 - 0)) + 0;
} 

router.post('/loginAdmin', (req, res, next) => {
    userModel
    .loginAdmin(req.body.user)
    .then(user => {
        
        if (user.status == "success") {
            let usuario = user.data[0];
            if (!bcrypt.compareSync(req.body.password,usuario.passwordinfo)) {
                return res.status(200).json({
                    status: 'error',
                    error: 'invalid credentials'
                })
            }else{
                usuario.passwordinfo = "";
                usuario.rol= 'admin'; 
                let token = jwt.sign(   { 
                                            userId: usuario.ad_user_id,
                                            rol: 'admin'
                                        },
                                        secretKey, 
                                        {expiresIn:  '2d' }
                                    );
                return res.status(200).json({
                    status: 'success'
                    ,user: usuario
                    ,token: token
                })
            } 
        }else{
            res.json(user);
        } 
    }).catch(err => {  
        return res.status(200).send({status:"error",data:err});
    });  
});

router.get('/existAdmin', function (req, res, next) {
    userModel
    .existAdmin(req.query.value)
    .then(user => {  
        res.json(user);
    }).catch(err => {
        return res.status(500).send({status:"error",data:err});
    }); 
}); 
 

router.get('/userByToken', (req, res, next) => {
    let token = req.headers.token;  
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err){
            return res.status(200).json({ status: 'unauthorized'})
        }else{
            if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
            else if (decoded.rol != 'user')return res.status(200).json({ status: 'unauthorized'})
            getUser(req,res,decoded); 
        } 
  })
});

router.get('/userByTokenAdmin', (req, res, next) => {
    let token = req.headers.token;   
    jwt.verify(token, secretKey, (err, decoded) => { 
        if (err){
            return res.status(200).json({ status: 'unauthorized'}) 
        }else{
            if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
            else if (decoded.rol != 'admin')return res.status(200).json({ status: 'unauthorized'})
            getAdmin(req,res,decoded); 
        } 
    })
});

router.get('/getAccountAll', (req, res, next) => {
    let token = req.headers.token;   
    jwt.verify(token, secretKey, (err, decoded) => { 
        if (err){
            return res.status(200).json({ status: 'unauthorized'}) 
        }else{
            if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
            else if (decoded.rol != 'admin')return res.status(200).json({ status: 'unauthorized'})
            userModel
            .getAccountAll()
            .then(accounts => { 
                return res.status(200).json(accounts);
            }).catch(err => {  
                return res.status(200).send({status:"error",data:err});
            }); 
        } 
  })
});

function getUser(req,res,decoded) {
    userModel
        .userByToken(decoded.userId)
        .then(user => {
            let usuario = user.data[0];
            usuario.passwordinfo == passwordDefault ? usuario.requires_password_change = true:usuario.requires_password_change = false;
            usuario.passwordinfo = "";
            usuario.rol = decoded.rol;
            return res.status(200).json({status: 'success',user:usuario});
        }).catch(err => {  
            return res.status(200).send({status:"error",data:err});
        });
}

function getAdmin(req,res,decoded) {
    userModel
        .userByTokenAdmin(decoded.userId)
        .then(user => { 
            if (user.data.length < 1) {
                return res.status(200).json({ status: 'unauthorized'}) 
            }
            let usuario = user.data[0]; 
            usuario.passwordinfo = "";
            usuario.rol = decoded.rol; 
            return res.status(200).json({status: 'success',user:usuario});
        }).catch(err => {
            console.log(err);
            return res.status(200).send({status:"error",data:err});
        });
}

router.put('/updateUser',async (req, res, next) => {
    let token = req.headers.token;   
    jwt.verify(token, secretKey, (err, decoded) => { 
        if (err){
            return res.status(200).json({ status: 'unauthorized'}) 
        }else{
            if(decoded==undefined)return res.status(200).json({ status: 'unauthorized'})
            else if (decoded.rol != 'admin')return res.status(200).json({ status: 'unauthorized'})
            let user = req.body;
            userModel
            .updateUser(user)
            .then(userREs => {
                if(user.isResetPass){
                    sendEmailUpdateUser(user,'Reinicio de contraseña.');
                }
                if (user.Isinactive) {
                    sendEmailUpdateUser(user,'Tu cuenta ha sido inactivada.');
                } 
                return res.status(200).json({status: 'success',userREs});
            }).catch(err => {  
                console.log(err);
                return res.status(500).send({status:"error",data:err});
            }); 
        } 
  });
});

async function sendEmailUpdateUser(params,subject) {
    var mailOptions = { 
      to: params.email, // list of receivers
      subject: subject, // Subject line
      html: layoutsEmail.emailUpdateUser(params)
    }; 
    const respuestaMail = await Mail.sendEmail(mailOptions);
    return respuestaMail;
}

module.exports = router;