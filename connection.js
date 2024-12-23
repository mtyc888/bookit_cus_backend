const mysql = require('mysql')
require('dotenv').config();

//Create the connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.DB_PORT
});

//Connect to the database
connection.connect((err) => {
    if(err){
        console.error("Error creating the connection", err);
        return;
    }else{
        console.log("Connected to AWS MySQL");
    }
});

module.exports = connection;