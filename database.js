const { Client } = require('pg');
require('dotenv').config();

const host=process.env.HOST;
const user=process.env.USER;
const password=process.env.PASSWORD;
const port=process.env.PORT;
const database=process.env.DATABASE;


const client = new Client({
    host: host,
    user: user,
    password: password,
    port: port,
    database: database,
});

client.connect()
    .then(() => console.log('Connected to Postgres database'))
    .catch(err => console.error('Error connecting to database', err));

module.exports = client;