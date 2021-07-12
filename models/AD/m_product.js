const conexion = require("./conexion")
var fs = require('fs');  

module.exports = { 
     async all(params) {  
        const values = [params.filter]; 
        // console.log(params.filter);
        var query = fs.readFileSync("./models/AD/sql/product/productoGeneral.sql","utf8");  
        if (params.onliStock == true || params.onliStock == 'true') {
            query = query.replace("--#1","AND Mex_.Mex_quantytotal > 0");
        }   
        if (params.range != undefined) { 
            if (params.range.length == 2) {
                query = query.replace("--#2",`AND  l0::INTEGER BETWEEN ${params.range[0]} AND (${params.range[1]} + 1)`);
            }
        }
      
        
        // ::: Filtrar empresa 
        if (params.marcasfiltradas != "#" && params.marcasfiltradas != undefined) {
            query = query.replace("--#3",`AND p.M_Product_Group_ID IN (${params.marcasfiltradas})`);
        }

        // ::: Filtrar intencidades 
        if (params.intencidadesfiltradas != undefined) {
            switch (params.intencidadesfiltradas) {
                case "#":
                    query = query.replace("--#4",``);
                    break;
                case "1000002,1000001,1000000":
                    query = query.replace("--#4",`AND (p.m_class_intensity_id IN (${params.intencidadesfiltradas})
                    OR p.m_class_intensity_id IS NULL)`);
                    break;
                default:
                    query = query.replace("--#4",`AND p.m_class_intensity_id IN (${params.intencidadesfiltradas})`);
                    break;
            }  
        }
        
        if (params.categorias_group != undefined) { 
            if (params.categorias_group != "#") {  
                query = query.replace("--#5",`AND p.M_Product_Category_ID IN (${params.categorias_group})`); 
            } 
        }

        if (params.sub_categorias_group != undefined) { 
            if (params.sub_categorias_group != "#") { 
                query = query.replace("--#6",`AND p.M_Product_Classification_ID IN (${params.sub_categorias_group})`); 
            } 
        }
 
        if (params.ordenMenorP == 'true') {
            query = query.replace("ORDER BY value ASC",`ORDER BY l0 ASC`); 
        }
        if (params.ordenMayorP == 'true') {
            query = query.replace("ORDER BY value ASC",`ORDER BY l0 DESC`); 
        }
        if (params.ordenMasVendido == 'true') {
            query = query.replace("/*****",''); 
            query = query.replace("****/",''); 
            query = query.replace("/*****",''); 
            query = query.replace("****/",''); 
            query = query.replace("ORDER BY value ASC",`ORDER BY totalfac DESC`); 
        } 
        // console.log(query);  
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
    async novedades() {  
        const values = [];  
        var query = fs.readFileSync("./models/AD/sql/product/productosNovedad.sql","utf8");   
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
    async one(filter) {  
        const values = [filter];  
        var query = fs.readFileSync("./models/AD/sql/product/productoGeneral.sql","utf8");  
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
    async getattributes(params) {
        let values = []; 
        var query = '';  
        switch (params.type) {
            case 'marcas':
                query = `SELECT
                DISTINCT(marca.name) AS marca,marca.M_Product_Group_ID
                ,'M_Product_Group_ID' as field,true As isview
                FROM adempiere.m_product p     
                LEFT JOIN adempiere.M_Product_Group marca ON marca.M_Product_Group_ID=p.M_Product_Group_ID    
                WHERE p.ad_client_id=1000000 AND p.isActive = 'Y' AND p.value LIKE 'P15%'    
                AND marca.M_Product_Group_ID <> 1000005 AND marca.isActive = 'Y'`;
            break;
            case 'categoria':
                query = `SELECT 
                    DISTINCT(categoria.name) AS categoria
                    ,categoria.M_Product_Category_ID
                    ,'M_Product_Category_ID' as field,true As isview,false As is_active
                FROM adempiere.m_product p     
                INNER JOIN adempiere.M_Product_Category categoria ON categoria.M_Product_Category_ID=p.M_Product_Category_ID AND categoria.isActive = 'Y'
                WHERE p.ad_client_id=1000000 AND p.isActive = 'Y' AND p.value LIKE 'P15%'`;
            break;
            case 'presentacion':
                query = `
                SELECT DISTINCT(presentacion.name) AS presentacion,
                    presentacion.M_Presentation_ID,'M_Presentation_ID' as field,true As isview
                FROM adempiere.m_product p     
                INNER JOIN adempiere.M_Presentation presentacion ON presentacion.M_Presentation_ID=p.M_Presentation_ID AND presentacion.isActive = 'Y'     
                WHERE p.ad_client_id=1000000 AND p.isActive = 'Y' AND p.value LIKE 'P15%'  `;
            break;
            case 'intencidad':
                query = `SELECT 
                    DISTINCT(intencidad.name) AS intencidad,
                    intencidad.M_Class_Intensity_ID,'M_Class_Intensity_ID' as field ,true As isview
                FROM adempiere.m_product p     
                INNER JOIN adempiere.M_Class_Intensity intencidad 
                    ON intencidad.M_Class_Intensity_ID=p.M_Class_Intensity_ID 
                    AND intencidad.isActive = 'Y'
                WHERE p.ad_client_id=1000000 AND p.isActive = 'Y' AND p.value LIKE 'P15%'`;
            break;
            case 'sub_categoria':
                query = `SELECT 
                    DISTINCT(sub_categoria.name) AS sub_categoria
                    ,sub_categoria.M_Product_Classification_ID
                    ,'M_Product_Classification_ID' as field,true As isview
                FROM adempiere.m_product p     
                INNER JOIN adempiere.M_Product_Classification sub_categoria 
                    ON sub_categoria.M_Product_Classification_ID=p.M_Product_Classification_ID
                    AND sub_categoria.isActive = 'Y'
                WHERE p.ad_client_id=1000000 AND p.isActive = 'Y' AND p.value LIKE 'P15%' 
                AND sub_categoria.M_Product_Category_ID = $1`;
                values = [params.m_product_category_id];
            break;
        }
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
    async imgByValue(value) { 
        const values = [value]; 
        var query = fs.readFileSync("./models/AD/sql/product/imgByValue.sql","utf8");  
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