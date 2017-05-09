const redis = require('redis-stream'),
    client = new redis(6379, '127.0.0.1');
const moment = require('moment');

const insertOrderAndOrderDetails = (next) => {
    const insert = (i) => {

        if (i === 500) {
            return next();
        }

        // Open stream
        const stream = client.stream();

        const start = i * 100000, end = (i + 1) * 100000;
        for (let record = start; record < end; record++) {

            // Command is an array of arguments:
            const orderCommand = ['sadd', 'order:' + record % 100000, record];
            const orderDetailsCommand = ['set', 'order-details:' + record, record % 500];

            // Send command to stream, but parse it before
            stream.redis.write(redis.parse(orderCommand));
            stream.redis.write(redis.parse(orderDetailsCommand));
        }

        // Create event when stream is closed
        stream.on('close', function () {
            console.log('Step ' + i + ' completed');
            insert(i + 1);
            // Here you can create stream for reading results or similar
        });

        // Close the stream after batch insert
        stream.end();
    };

    insert(0);
};

const insertDateForOder = (next) => {
    const stream = client.stream();

    const startDate = moment('2005-01-01', 'YYYY-MM-DD');

    for (let record = 0; record < 100000; record++) {

        const date = startDate.add(1, 'days').unix() * 1000;

        // Command is an array of arguments:
        const command = ['zadd', 'order-dates', date, record];

        // Send command to stream, but parse it before
        stream.redis.write(redis.parse(command));
    }

    // Create event when stream is closed
    stream.on('close', function () {
        next();
        // Here you can create stream for reading results or similar
    });

    // Close the stream after batch insert
    stream.end();
};

const insertProducts = (next) => {
    const stream = client.stream();

    for (let record = 0; record < 500; record++) {

        // Command is an array of arguments:
        const command = ['set', 'product:' + record, 'P' + record];

        // Send command to stream, but parse it before
        stream.redis.write(redis.parse(command));
    }

    // Create event when stream is closed
    stream.on('close', function () {
        next();
        // Here you can create stream for reading results or similar
    });

    // Close the stream after batch insert
    stream.end();
};


const begin = new Date();
console.log("Inserting order and order details...");
insertOrderAndOrderDetails(() => {
    console.log("inserting products...");
    insertProducts(() => {
        console.log("inserting order dates...");
        insertDateForOder(() => {
            console.log("DONE!");
            const end = new Date();
            console.log(end - begin);
        });
    })
});



