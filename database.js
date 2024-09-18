const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'ali',
    port: 5432,
    database: 'ritter_dahait',
});

client.connect()
    .then(() => console.log('Connected to Postgres database'))
    .catch(err => console.error('Error connecting to database', err));

module.exports = client;