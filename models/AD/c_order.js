const conexion = require("./conexion")
fs = require('fs');  

module.exports = {
    async updateFechaPrometida(documento,fecha) {   
        const values = []; 
        var query =`UPDATE C_Order SET datepromised = '${fecha}'::DATE WHERE DocumentNo = '${documento}'`;  
        const result = await conexion.query(query, values)
        .then(res => {
            return {status:"success","data":res.rows[0]};
        }).catch( e => {
            return {status:"error","data":e.stack}; 
        });
        return result;
    },
    async rf_order_ecomers(parameters) {
        const values = parameters;
        var query = fs.readFileSync("./models/AD/sql/order/rf_order_ecomers.sql","utf8");
        const result = await conexion.query(query, values)
        .then(res => {
            return {status:"success","data":res.rows[0]};
            }
        ).catch( e => {
            return {status:"error","data":e.stack};
            }
        );
        return result;
    },
    async rf_invoiceLine_ecomers(parameters) {
        const values = parameters;  
        var query = "SELECT * FROM adempiere.rf_invoiceLine_ecomers($1,$2,$3);";  
        const result = await conexion.query(query, values)
        .then(res => {
            return {status:"success","data":res.rows[0]};
            }
        ).catch( e => {
            return {status:"error","data":e.stack}; 
            }     
        );
        return result;
    }, 
    async rf_movement_ecomers(order,productos,idProdRegalo) {
        const values = [order,productos,idProdRegalo]; 
        console.log(values);
        var query = fs.readFileSync("./models/AD/sql/order/rf_movement_ecomers.sql","utf8");  
        const result = await conexion.query(query, values)
        .then(res => {
            return {status:"success","data":res.rows[0]};
            }
        ).catch( e => {
            return {status:"error","data":e.stack}; 
            }     
        );
        return result;
    },
    async updateFechaPrometid(values) { 
        var query = `UPDATE adempiere.C_Order set datepromised = $1::DATE WHERE  c_order_id = $2;`;  
        const result = await conexion.query(query, values)
        .then(res => { 
            var query = `UPDATE adempiere.C_OrderLine set datepromised = $1::DATE WHERE  c_order_id = $2;`;  
            conexion.query(query, values)
            .then(res => {return true;})
            .catch( e => {console.log(e);return false;}); 
            return true;
        }).catch( e => {console.log(e);return false;});
        return result;
    },
    
}