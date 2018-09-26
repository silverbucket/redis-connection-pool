node-redis-connection-pool
==========================

A node.js connection pool for Redis.

[![Build Status](http://img.shields.io/travis/silverbucket/node-redis-connection-pool.svg?style=flat)](http://travis-ci.org/silverbucket/node-redis-connection-pool)
[![license](https://img.shields.io/npm/l/redis-connection-pool.svg?style=flat)](https://npmjs.org/package/redis-connection-pool)
[![downloads](http://img.shields.io/npm/dm/redis-connection-pool.svg?style=flat)](https://npmjs.org/package/redis-connection-pool)

## About
  node-redis-connection-pool is a high-level redis management object. It manages
a number of connections in a pool, using them as needed and keeping all aspects
of releasing active connections internal to the object, so the user does not
need to worry about forgotten connections leaking resources.

## Installation

```javascript
npm install redis-connection-pool
```

## Usage

```javascript
var redisPool = require('redis-connection-pool')('myRedisPool', {
    host: '127.0.0.1', // default
    port: 6379, //default
    // optionally specify full redis url, overrides host + port properties
    // url: "redis://username:password@host:port"
    max_clients: 30, // defalut
    perform_checks: false, // checks for needed push/pop functionality
    database: 0, // database number to use
    options: {
      auth_pass: 'password'
    } //options for createClient of node-redis, optional
  });

redisPool.set('test-key', 'foobar', function (err) {
  redisPool.get('test-key', function (err, reply) {
    console.log(reply); // 'foobar'
  });
});
```

## Implemented methods

  * **get**
```javascript
get(key, cb)
```

  * **set**
```javascript
set(key, value, callback)
```

  * **expire**
```javascript
expire(key, value, callback)
```

  * **del**
```javascript
del(key, callback)
```

  * **hget**
```javascript
hget(key, field, callback)
```

  * **hgetall**
```javascript
hgetall(key, callback)
```

  * **hset**
```javascript
hset(key, field, value, callback)
```

  * **hdel**
```javascript
hdel(key, [fields], callback)
```

  * **brpop**
```javascript
brpop(key, cb)
```

 * **brpoplpush**
```javascript
brpoplpush(key1, key2, callback)
```

  * **blpop**
```javascript
blpop(key, cb)
```

  * **rpush**
```javascript
rpush(key, value, callback)
```

  * **lpush**
```javascript
lpush(key, value, callback)
```


## API Documentation
node-redis-connection-pool uses jsdoc-to-markdown to generate the [API.md](API.md) from the source code.

## License

[MIT](https://github.com/silverbucket/node-redis-connection-pool/blob/master/LICENSE)



