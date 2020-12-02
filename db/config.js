const sql = require('mssql') //声明插件

// mes数据库信息
const config = {
    user: 'sa',
    password: 'Admin123',
    server: 'www.tangp.top',
    port: 9191,
    database: 'OEE',
    "options": {
        "encrypt": false,
        "enableArithAbort": true
    }
}

const config_mes = {
    user: 'sa',
    password: 'Admin123',
    server: 'www.tangp.top',
    port: 9191,
    database: 'Y8_MES15',
    "options": {
        "encrypt": false,
        "enableArithAbort": true
    }
}


async function progress(sql_read) {
    try {
        await sql.connect(config)
        let test = await sql.query(sql_read)
        return test.recordset
    }
    catch (err) {
        console.log(err)
    }
}

async function progress_mes(sql_read) {
    try {
        await sql.connect(config_mes)
        let test = await sql.query(sql_read)
        return test.recordset
    }
    catch (err) {
        console.log(err)
    }
}


module.exports = {
    progress,
    progress_mes
}