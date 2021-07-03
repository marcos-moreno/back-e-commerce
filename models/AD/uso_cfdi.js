const conexion = require("./conexion") 

module.exports = { 
     async all() { 
        const values = []; 
        var query = "SELECT name,description,value FROM adempiere.AD_Ref_List WHERE AD_Reference_ID=53948 AND isActive = 'Y'";  
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
}