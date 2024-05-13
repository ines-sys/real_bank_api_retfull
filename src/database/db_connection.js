require('dotenv').config();
const { Pool } = require('pg');

const db = new Pool({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB,
    port: process.env.PORT_DB
});

module.exports = db;