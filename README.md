node-redis-pool
===============

A node.js connection pool for Redis

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
