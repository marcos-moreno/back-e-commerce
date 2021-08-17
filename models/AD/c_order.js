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

    async getStatus_order(parameters) {
        const values = parameters;  
        var query = `SELECT 
                        inv.isPaid,
                        CASE WHEN SUM(lin.qtyinvoiced) = SUM(lin.qtydelivered) THEN 'Y' ELSE 'N' END As isdelivered
                    FROM 
                    adempiere.C_Invoice inv
                    INNER JOIN adempiere.C_Order ov ON inv.C_Order_ID = ov.C_Order_ID 
                        AND ov.DocumentNo = $1
                    INNER JOIN C_OrderLine lin ON lin.C_Order_ID = ov.C_Order_ID
                    GROUP BY inv.isPaid `;  
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