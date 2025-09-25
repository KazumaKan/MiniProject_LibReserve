const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Zer@0036919",
  database: "libraryroombooking",
});

module.exports = pool;
