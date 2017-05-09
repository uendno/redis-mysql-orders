const config = require('./config');
const Promise = require('bluebird');
const moment = require('moment');
const _ = require('lodash');
const redis = Promise.promisifyAll(require('redis'));
const conn = redis.createClient();


const start = moment(config.search.startDate, 'YYYY-MM-DD').startOf('day').unix() * 1000;
const end = moment(config.search.endDate, 'YYYY-MM-DD').endOf('day').unix() * 1000;

const begin = new Date();
conn.zrangebyscoreAsync('order-dates', start, end)
    .then(orderIds => {

        const promises = [];
        var orderDetailIds = [];

        _.forEach(orderIds, function (orderId) {
            promises.push(conn.smembersAsync('order:' + orderId).then(ids => {
                orderDetailIds = orderDetailIds.concat(ids);
            }));
        });

        return Promise.all(promises)
            .then(() => {
                return orderDetailIds
            });
    })
    .then(orderDetailIds => {

        const promises = [];
        const productIds = [];

        _.forEach(orderDetailIds, orderDetailId => {
            promises.push(conn.getAsync('order-details:' + orderDetailId).then(productId => productIds.push(productId)))
        });

        return Promise.all(promises)
            .then(() => productIds);
    })
    .then(productIds => {
        const promises = [];
        const products = [];

        _.forEach(productIds, productId => {
            promises.push(conn.getAsync('product:' + productId).then(product => products.push(product)))
        });

        return Promise.all(promises)
            .then(() => products);
    })
    .then(products => {
        console.log(products);
        const finish = new Date();
        console.log(end - finish);
    });