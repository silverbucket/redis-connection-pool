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

    redisPool.set('test-key', 'foobar', function (err) {
      redisPool.get('test-key', function (err, reply) {
        console.log(reply); // 'foobar'
      });
    });

## Implemented methods

  * **get**
```
get(key, cb)
```

  * **set**
```
set(key, value, callback)
```

  * **hget**
```
hget(key, field, callback)
```

  * **hset**
```
hset(key, field, value, callback)
```

  * **brpop**
```
brpop(key, cb)
```

  * **blpop**
```
blpop(key, cb)
```

  * **rpush**
```
rpush(key, value, callback)
```

  * **lpush**
```
lpush(key, value, callback)
```


## API Documentation
node-redis-pool uses NaturalDocs to generate API documentation, which can be
viewed after cloning the repository, in the doc/ directory, using a web browser.


## License

Licensed under the [AGPLv3](https://github.com/silverbucket/node-redis-pool/blob/master/LICENSE)
