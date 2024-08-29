const express = require('express');
const app = express();
const client = require("./database");

app.use(express.json());

//routes