node-redis-connection-pool
==========================

A node.js connection pool for Redis.

[![Build Status](http://img.shields.io/travis/silverbucket/node-redis-connection-pool.svg?style=flat)](http://travis-ci.org/silverbucket/webfinger.js)
[![Code Climate](http://img.shields.io/codeclimate/github/silverbucket/node-redis-connection-pool.svg?style=flat)](https://codeclimate.com/github/silverbucket/webfinger.js)
[![license](https://img.shields.io/npm/l/node-redis-connection-pool.svg?style=flat)](https://npmjs.org/package/webfinger.js)
[![downloads](http://img.shields.io/npm/dm/node-redis-connection-pool.svg?style=flat)](https://npmjs.org/package/webfinger.js)

## About
  node-redis-connection-pool is high-level redis management object. It manages
a number of connections in a pool, using them as needed and keeping all aspects
of releasing active connections internal to the object, so the user does not
need to worry about forgotten connections leaking memory and building up over
time.

## Installation

    npm install redis-connection-pool

## Usage

    var redisPool = require('redis-connection-pool')('myRedisPool');

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

  * **expire**
```
expire(key, value)
```

  * **hget**
```
hget(key, field, callback)
```

  * **hgetall**
```
hgetall(key, callback)
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
node-redis-connection-pool uses NaturalDocs to generate API documentation, which can be
viewed after cloning the repository, in the doc/ directory, using a web browser.


## License

Licensed under the [AGPLv3](https://github.com/silverbucket/node-redis-connection-pool/blob/master/LICENSE)


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/silverbucket/node-redis-connectoin-pool/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

