const conexion = require("./conexion")
var fs = require('fs');  

module.exports = { 
     async search_orden(params) { 
            const values = [params.no_orden];
            var query = fs.readFileSync("./models/AD/sql/order/search_st_orde.sql","utf8");  
            const result = await conexion.query(query, values)
                .then(res => {
                    return {status:"success","data":res.rows};
                }).catch( e => {
                    console.log(e);
                    return {status:"error","data":e.stack}; 
                }
            );
        return result;
    }, 

    async search_entrega(params) {  
        const values = [params.code_entrega];  
        var query = `
            SELECT 
                orden.documentno,
                entrega.documentno,
                entrega.M_InOut_ID,
                orden.c_order_id
            FROM adempiere.c_order As orden
            INNER JOIN adempiere.M_InOut entrega ON orden.c_order_id = entrega.c_order_id 
                AND entrega.DocStatus = 'CO' 
            WHERE
                orden.DocumentNo = $1
                AND orden.DocStatus = 'CO' 
                AND entrega.ad_org_id = '1000032'
            ORDER BY entrega.M_InOut_ID
        `;  
        const result = await conexion.query(query, values)
            .then(res => {
                return {status:"success","data":res.rows};
            }).catch( e => {
                console.log(e);
                return {status:"error","data":e.stack}; 
            }
        ); 
        return result;
    }, 


    async search_estados_entrega(params) { 
        const values = [params.m_inout_id];  
        var query = `
        SELECT  
            valuesList.name,status.datetrx
        FROM   
            adempiere.RF_Ecommerce_OrderStatus status 
            INNER JOIN adempiere.AD_Ref_List valuesList ON valuesList.value = rf_statusorder
        WHERE
            status.M_InOut_id =   $1
            AND status.isactive = 'Y'  
        ORDER BY datetrx 
        `;  
        const result = await conexion.query(query, values)
            .then(res => {
                return {status:"success","data":res.rows};
            }).catch( e => {
                console.log(e);
                return {status:"error","data":e.stack}; 
            }
        ); 
        return result;
    },  

    async getEstados() { 
        const values = []; 
        var query = `
            SELECT name,description,value 
            FROM adempiere.AD_Ref_List 
            WHERE AD_Reference_ID=1000017 AND isActive = 'Y'
        `;  
        const result = await conexion.query(query, values)
        .then(res => {
            return {status:"success","data":res.rows};
            }
        ).catch( e => {
            return {status:"error","data":e.stack}; 
            }     
        );
        return result;
    },  
    async insert_rf_ecommerce_orderstatus(parameters) { 
        var query = `  
            INSERT INTO adempiere.rf_ecommerce_orderstatus(
                ad_client_id, ad_org_id, c_order_id, created, createdby, datetrx, isactive, m_inout_id,
                rf_ecommerce_orderstatus_id, 
                rf_statusorder, updated, updatedby)
            VALUES (1000000, 0, $1, NOW()::DATE,1000035, NOW()::DATE, 'Y', $2, 
                    (SELECT adempiere.nextidfunc((SELECT AD_Sequence_ID FROM adempiere.AD_Sequence WHERE Name = 'RF_Ecommerce_OrderStatus')::integer, 'N'))
                    ,$3, NOW()::DATE,1000035);
        `;
        const result = await conexion.query(query, parameters)
        .then(res => {
            return {status:"success","data":res};
            }
        ).catch( e => {
            return {status:"error","data":e.stack};
            }
        );
        return result;
    },

   
        
}   