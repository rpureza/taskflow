const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "todoapp",

});

db.connect((err) => {
    
    if (err) {
        console.error("MySQL connection error:", err.message);
        process.exit(1);
    }

    console.log("MySQL Connected");



});

module.exports = db;