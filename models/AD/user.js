const conexion = require("./conexion")
var fs = require('fs');  

module.exports = {  
    async exist(value) {
        const values = [value]; 
        var query = fs.readFileSync("./models/AD/sql/user/exist.sql","utf8");  
        const result = await conexion.query(query, values)
        .then(res => { return {status:"success","data":res.rows}; })
        .catch( e => { return {status:"error","data":e.stack};});
        return result;
    },
    async login(value) {
        const values = [value]; 
        var query = fs.readFileSync("./models/AD/sql/user/login.sql","utf8");
        const result = await conexion.query(query, values)
        .then(res => { return {status:"success","data":res.rows}; })
        .catch( e => { return {status:"error","data":e.stack};});
        return result;
    },
    async getAccountAll() {
        const values = []; 
        var query = fs.readFileSync("./models/AD/sql/user/admin/getAccountAll.sql","utf8");
        const result = await conexion.query(query, values)
        .then(res => { return {status:"success","data":res.rows}; })
        .catch( e => { return {status:"error","data":e.stack};});
        return result;
    },
    async loginAdmin(value) {
        const values = [value]; 
        var query = fs.readFileSync("./models/AD/sql/user/admin/loginAdmin.sql","utf8");  
        const result = await conexion.query(query, values)
        .then(res => { return {status:"success","data":res.rows}; })
        .catch( e => { return {status:"error","data":e.stack};});
        return result;
    },
    async existAdmin(value) {
        const values = [value]; 
        var query = fs.readFileSync("./models/AD/sql/user/admin/existAdmin.sql","utf8");  
        const result = await conexion.query(query, values)
        .then(res => { return {status:"success","data":res.rows}; })
        .catch( e => { return {status:"error","data":e.stack};});
        return result;
    },
    async montPreAproved(rfc) {
        const values = [rfc]; 
        var query = `SELECT * FROM adempiere.RF_CreditsProposalClients 
                        WHERE UPPER(rfcprov) = UPPER($1) AND isActive = 'Y' LIMIT 1`;  
        const result = await conexion.query(query, values)
        .then(res => { return {status:"success","data":res.rows}; })
        .catch( e => { return {status:"error","data":e.stack};});
        return result;
    },
    async rf_insercbpartner_ecomers(jsonSolicitud,isLocation) {
        const values = [jsonSolicitud,isLocation]; 
        var query = "SELECT * FROM adempiere.rf_insercbpartner_ecomers($1,$2);";  
        const result = await conexion.query(query, values)
        .then(res => { return res.rows[0]})
        .catch( e => { return {status:"error","data":e.stack};});
        return result;
    },
    async userByToken(value) {
        const values = [value]; 
        var query = fs.readFileSync("./models/AD/sql/user/userById.sql","utf8");  
        const result = await conexion.query(query, values)
        .then(res => { return {status:"success","data":res.rows}; })
        .catch( e => { return {status:"error","data":e.stack};}); 
        return result;
    },
    async userByTokenAdmin(value) {
        const values = [value]; 
        var query = fs.readFileSync("./models/AD/sql/user/admin/userByIdAdmin.sql","utf8");  
        const result = await conexion.query(query, values)
        .then(res => { return {status:"success","data":res.rows}; })
        .catch( e => { return {status:"error","data":e.stack};}); 
        return result;
    },
    async updateUser(jsonUser) {
        let password = '';
        let inactiveStrg = '';

        const values = [jsonUser.phone2,jsonUser.email,jsonUser.ad_user_id]; 

        if(jsonUser.isResetPass) password = ",PasswordInfo = '$2b$10$7qXuRIJjog6jYPjiBiBS4OkEtUzCZ3rf0XGbXBWYIS2WXdLsup9g6'"; 
        if (jsonUser.Isinactive) inactiveStrg = `,IsWebstoreUser = 'N',isLoginUser = 'N'`
      
        var query = `UPDATE adempiere.AD_User SET Phone2 = $1 ${password} ,EMail= $2  ${inactiveStrg}
                        WHERE 
                            AD_User_id = $3;`;  

        const result = await conexion.query(query, values)
        .then(res => { return res;})
        .catch( e => { return {status:"error","data":e.stack};});
        return result;
    },
    async updatePasswordUser(usuario) {
        const values = [usuario.password,usuario.ad_user_id];  
        var query = `UPDATE adempiere.AD_User SET PasswordInfo = $1  WHERE AD_User_id = $2;`;  
        const result = await conexion.query(query, values)
        .then(res => { return {status: 'success',res};})
        .catch( e => { return {status:"error","data":e.stack};});
        return result;
    },
    async RF_CreditValidate_Ecommerce(rfc) {
        const values = [rfc]; 
        var query = `SELECT * FROM adempiere.RF_CreditValidate_Ecommerce($1)`;  
        const result = await conexion.query(query, values)
        .then(res => { return {status:"success","data":res.rows}; })
        .catch( e => { return {status:"error","data":e.stack};});
        return result;
    },
}