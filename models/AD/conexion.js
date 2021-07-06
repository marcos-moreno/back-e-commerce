const { Pool } = require("pg")

//Credenciales BD REAL 

// const pool = new Pool({
//     user: 'postgres',
//     host: 'db.refividrio.com.mx',
//     // host:"192.168.193.83",
//     database: 'rfhoods390',
//     password: '[rfhood.?/]',
//     port: 65432,
//     schema: 'adempiere',
// });
// module.exports = pool;


const pool = new Pool({
    user: 'adempiere',
    host: '68.183.55.140', 
    database: 'RFV221218',
    password: '[rfhood_.?/]',
    port: 65432,
    schema: 'adempiere',
});
module.exports = pool;



// Conexion BD PRUEBAS 

// const pool = new Pool({
//     user: 'postgres',
//     host: '172.16.103.113',
//     //host: 'pruebas.refividrio.com.mx',
//     database: 'RFV03072021',
//     password: '@d3mp13r3',
//     port: 55432,
//     schema: 'adempiere',
// });
// module.exports = pool; 