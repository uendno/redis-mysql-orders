const config = require('./config');
const mysql = require('mysql');
const conn = mysql.createConnection(config.mysql);

const start = config.search.startDate;
const end = config.search.endDate;

conn.query('SELECT name from ' +
    'orders o JOIN orderDetails od ON o.id = od.orderId ' +
    'JOIN products p ON od.productId = p.id ' +
    'WHERE o.orderDate > ? AND o.orderDate < ? ', [start, end], function (error, result, fields) {
    if (error) {
        return console.error(error);
    }

    console.log(result);
});