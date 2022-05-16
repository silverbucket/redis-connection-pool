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

**NOTE** Version 2.x is a rewrite and not backward compatible, please re-read the documentation to update your code.

## Installation

```javascript
npm install redis-connection-pool
```

## Usage

```javascript
var redisPool = require('redis-connection-pool')('myRedisPool', {
    max_clients: 10, // defalut
    redis: {
      host: '127.0.0.1',
      port: 6379
    }
  });

redisPool.init();

await redisPool.set('test-key', 'foobar');
```

## Implemented methods

  * **get**
```javascript
get(key)
```

  * **set**
```javascript
set(key, value, ttl)
```

  * **expire**
```javascript
expire(key, value)
```

  * **del**
```javascript
del(key)
```

  * **hget**
```javascript
hget(key, field)
```

  * **hgetall**
```javascript
hgetall(key)
```

  * **hset**
```javascript
hset(key, field, value)
```

  * **hdel**
```javascript
hdel(key, [fields])
```

  * **brpop**
```javascript
brpop(key)
```

 * **brpoplpush**
```javascript
brpoplpush(key1, key2)
```

  * **blpop**
```javascript
blpop(key)
```

  * **rpush**
```javascript
rpush(key, value)
```

  * **lpush**
```javascript
lpush(key, value)
```


## API Documentation
node-redis-connection-pool uses jsdoc-to-markdown to generate the [API.md](API.md) from the source code.

## License

[MIT](https://github.com/silverbucket/node-redis-connection-pool/blob/master/LICENSE)
