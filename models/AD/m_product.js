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
        if (params.range.length == 2) {
            query = query.replace("--#2",`AND  l0::INTEGER BETWEEN ${params.range[0]} AND ${params.range[1]}`);
        }
        if (params.andalucia == 'false' && params.ld == 'false' ) {
            query = query.replace("--#3",`AND p.name = ''`);
        }else{
            if (params.andalucia == 'false' || params.ld == 'false' ) { 
                if (params.andalucia == 'false'){
                    query = query.replace("--#3",`AND p.name NOT LIKE '%ANDALUCIA%'`);
                }
                if (params.ld == 'false'){
                    query = query.replace("--#3",`AND p.name LIKE '%ANDALUCIA%' `);
                }
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