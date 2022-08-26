redis-connection-pool
=====================

A node.js connection pool for Redis.

https://silverbucket.github.io/redis-connection-pool

[![Build Status](http://img.shields.io/travis/silverbucket/node-redis-connection-pool.svg?style=flat)](http://travis-ci.org/silverbucket/node-redis-connection-pool)
[![license](https://img.shields.io/npm/l/redis-connection-pool.svg?style=flat)](https://npmjs.org/package/redis-connection-pool)
[![downloads](http://img.shields.io/npm/dm/redis-connection-pool.svg?style=flat)](https://npmjs.org/package/redis-connection-pool)

## About

  A high-level redis connection pooling object. It manages
a number of connections in a pool, using them as needed and keeping all aspects
of releasing active connections internal to the object.

## Installation

```javascript
npm install redis-connection-pool
```

## Usage

```javascript
import redisPoolFactory from 'redis-connection-pool';
const redisPool = await redisPoolFactory('myRedisPool', {
    max_clients: 5, // default
    redis: {
      url: 'redis://localhost:6379'
    }
  });


await redisPool.set('test-key', 'foobar');
const foo = await redisPool.get('test-key');
// returns 'foobar'
```

Or you can create a pool instance directly
```javascript
import RedisConnectionPool from 'redis-connection-pool';
const redisPool = new RedisConnectionPool();
await redisPool.init();
```

When you are done
```javascript
redisPool.shutdown();
```

## Implemented Redis methods

* **blpop**
* **brpop**
* **del**
* **expire**
* **get**
* **hdel**
* **hget**
* **hgetall**
* **hset**
* **incr**
* **keys**
* **lpush**
* **rpush**
* **sendCommand**
* **set**
* **ttl**

## Additional methods

* **init**
* **shutdown**


## API Documentation
For the full documentation on the `RedisConnectionPool` class, see https://silverbucket.github.io/redis-connection-pool/classes/RedisConnectionPool.html

## License

[MIT](https://github.com/silverbucket/node-redis-connection-pool/blob/master/LICENSE)
