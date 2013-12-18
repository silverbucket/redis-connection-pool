node-redis-pool
===============

A node.js connection pool for Redis.

## About
  node-redis-pool is high-level redis management object. It manages a number of
connections in a pool, using them as needed and keeping all aspects of
releasing active connections internal to the object, so the user does not need
to worry about forgotten connections leaking memory and building up over time.

## Installation

    npm install redis-pool

## Usage

    var redisPool = require('redis-pool')('myRedisPool');

    redisPool.set('test-channel', 'foobar', function (err) {
      redisPool.get('test-channel', function (err, reply) {
        console.log(reply); // 'foobar'
      });
    });

## Implemented methods

  * **get**
```
get(channel, name, cb)
```

  * **set**
```
set(channel, name, value, callback)
```

  * **hget**
```
hget(channel, key, name, callback)
```

  * **hset**
```
hset(channel, key, name, value, callback)
```


## License

Licensed under the [AGPLv3](https://github.com/silverbucket/node-redis-pool/blob/master/LICENSE)
