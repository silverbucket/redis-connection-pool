redis-connection-pool
=====================

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

  * **sendCommand**
```javascript
sendCommand(commandName, [args])
```

* **shutdown**
```javascript
shutdown()
```

## API Documentation
node-redis-connection-pool uses jsdoc-to-markdown to generate the [API.md](API.md) from the source code.

## License

[MIT](https://github.com/silverbucket/node-redis-connection-pool/blob/master/LICENSE)
