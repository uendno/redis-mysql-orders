const config = require('./config');
const mysql = require('mysql');
const conn = mysql.createConnection(config.mysql);
conn.connect();
const moment = require('moment');

const insertOrderDetails = (next) => {
    const insert = (i) => {

        if (i === 10000) {
            return next();
        }

        const values = [];
        // Open stream

        const start = i * 10000, end = (i + 1) * 10000;
        for (let record = start; record < end; record++) {
            values.push([record % 100000 + 1, record % 1000 + 1]);
        }

        conn.query('INSERT INTO orderDetails (orderId, productId) VALUES ?', [values], function (error, results, fields) {
            if (error) {
                return console.error(error);
            }
            console.log('Step ' + i + ' completed');
            insert(i + 1);
        })

    };

    insert(0);
};

const insertOrders = (next) => {

    const startDate = moment('2005-01-01', 'YYYY-MM-DD');

    const insert = (step) => {

        if (step === 10) {
            return next();
        }

        const values = [];

        const start = step * 10000;
        const end = (step + 1 ) * 10000;
        for (let i = start; i < end; i++) {
            const date = startDate.add(1, 'day').format('YYYY-MM-DD');
            values.push([date]);
        }

        conn.query('INSERT INTO orders (orderDate) VALUES ?', [values], function (error, results, fields) {
            if (error) {
                return console.error(error);
            }

            insert(step + 1);
        })

    };

    insert(0);
};

const insertProducts = (next) => {
    const values = [];

    for (let record = 0; record < 1000; record++) {
        values.push(['P' + record]);
    }

    conn.query('INSERT INTO products (name) VALUES ?', [values], function (error, results, fields) {
        if (error) {
            return console.error(error);
        }

        return next();
    })
};


const begin = new Date();
insertOrderDetails(() => {
    console.log("DONE!");
    const end = new Date();
    console.log(end - begin);
});


