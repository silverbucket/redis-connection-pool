if (typeof define !== 'function') {
  define = require('amdefine')(module);
}

define(['require'], function (require) {
  let suites = [];

  suites.push({
    name: 'database connection tests',
    desc: 'testing states of database connectivity',
    abortOnFail: true, // don't continue with further test suites if any tests in this suite fail
    setup: function (env, test) {
      env.RedisPool = require('./../dist/index').default;
      env.channel = 'redis-connection-pool-tests:';
      test.done();
    },
    tests: [{
      desc: 'connect to database',
      run: function (env, test) {
        env.redisPool = env.RedisPool('redisPoolTests1', {
          max_clients: 30,
          perform_checks: true
        });
        test.assertTypeAnd(env.redisPool, 'object');
        test.assert(env.redisPool.uid, 'redisPoolTests1');
      },
      takedown: async function (env, test) {
        await env.redisPool.clean(env.channel + '*');
        delete env.redisPool;
        test.result(true);
      }
    }, {
      desc: 'connect to database 7',
      run: function (env, test) {
        env.redisPool = env.RedisPool('redisPoolTests2', {
          max_clients: 60,
          perform_checks: true,
          redis: {
            host: '127.0.0.1',
            port: 6379,
            database: 7
          }
        });
        test.assertTypeAnd(env.redisPool, 'object');
        test.assert(env.redisPool.uid, 'redisPoolTests2');
      },
      takedown: async function (env, test) {
        await env.redisPool.clean(env.channel + '*');
        delete env.redisPool;
        test.result(true);
      }
    }, {
      desc: 'check alternate host setting',
      run: function (env, test) {
        env.redisPool = env.RedisPool('redisPoolTests1234', {
          max_clients: 12,
          perform_checks: true,
          redis: {
            host: '1.2.3.4',
            port: 1234
          }
        });
        test.assertAnd(env.redisPool.redis.host, '1.2.3.4');
        test.assertAnd(env.redisPool.redis.port, 1234);
        test.assert(env.redisPool.max_clients, 12);
      },
      takedown: async function (env, test) {
        await env.redisPool.clean(env.channel + '*');
        delete env.redisPool;
        test.result(true);
      }
    }, {
      desc: 'connect using URL property',
      run: function (env, test) {
        env.redisPool = env.RedisPool('redisPoolTestsURL', {
          max_clients: 12,
          perform_checks: true,
          redis: {
            url: 'redis://localhost:6379'
          }}
        );
        test.assertAnd(env.redisPool.redis.url, 'redis://localhost:6379');
        test.assertTypeAnd(env.redisPool.redis.host, 'undefined');
        test.assert(env.redisPool.max_clients, 12);
      },
      takedown: async function (env, test) {
        await env.redisPool.clean(env.channel + '*');
        delete env.redisPool;
        test.result(true);
      }
    }]
  }, {
    name: 'redis tests',
    desc: 'collection of basic redis-connection-pool tests',
    abortOnFail: true, // don't continue with further test suites if any tests in this suite fail
    setup: async function (env, test) {
      env.channel = 'redis-connection-pool-tests:';
      env.redisPool = require('./../dist/index').default('redisPoolTests');
      test.assertTypeAnd(env.redisPool, 'object');
      test.assertAnd(env.redisPool.uid, 'redisPoolTests');
      await env.redisPool.init();
      test.result(true);
    },
    takedown: async function (env, test) {
      await env.redisPool.clean(env.channel + '*');
      delete env.redisPool;
      test.result(true);
    },
    tests: [{
      desc: '#pool.getPoolSize()',
      timeout: 2000,
      run: function (env, test) {
        test.assertTypeAnd(env.redisPool.pool.size, 'number', 'size');
        test.assertTypeAnd(env.redisPool.pool.available, 'number', 'available');
        test.assertType(env.redisPool.pool.pending, 'number', 'pending');
      }
    }, {
      desc: '#set',
      timeout: 2000,
      run: async function (env, test) {
        await env.redisPool.set(env.channel + 'test', 'foobar');
        test.done();
      }
    }, {
      desc: '#get',
      run: async function (env, test) {
        const res = await env.redisPool.get(env.channel + 'test');
        test.assert(res, 'foobar');
      }
    }, {
      desc: '#hset',
      run: async function (env, test) {
        await env.redisPool.hset(env.channel + 'testhash', 'foo', 'bar');
        test.done();
      }
    }, {
      desc: '#hget',
      run: async function (env, test) {
        const res = await env.redisPool.hget(env.channel + 'testhash', 'foo');
        test.assert(res, 'bar');
      }
    }, {
      desc: '#hset',
      run: async function (env, test) {
        await env.redisPool.hset(env.channel + 'testhash', 'foo', 'bar');
        await env.redisPool.hset(env.channel + 'testhash', 'john', 'doe');
        await env.redisPool.hset(env.channel + 'testhash', 'super', 'dong');
        await env.redisPool.hset(env.channel + 'testhash', 'cau', 'sau');
        test.done();
      }
    }, {
      desc: '#hgetall',
      run: async function (env, test) {
        const res = await env.redisPool.hgetall(env.channel + 'testhash');
        test.assertAnd(res.foo, 'bar');
        test.assertAnd(res.john, 'doe');
        test.assertAnd(res.super, 'dong');
        test.assertAnd(res.cau, 'sau');
      }
    }, {
      desc: '#rpush 1 foo',
      run: async function (env, test) {
        await env.redisPool.rpush(env.channel + 'testlist1', 'foo');
        test.done();
      },
    }, {
      desc: '#rpush 1 bar',
      run: async function (env, test) {
        await env.redisPool.rpush(env.channel + 'testlist1', 'bar');
        test.done();
      },
    }, {
      desc: '#rpush 1 baz',
      run: async function (env, test) {
        await env.redisPool.rpush(env.channel + 'testlist1', 'baz');
        test.done();
      }
    }, {
      desc: '#blpop 1',
      run: async function (env, test) {
        setTimeout(async () => {
          const res = await env.redisPool.blpop(env.channel + 'testlist1');
          console.log('blpop1:', res);
          test.assert(res, {key: env.channel + 'testlist1', element: 'foo'});
        }, 0);
      }
    }, {
      desc: '#brpop 1',
      run: async function (env, test) {
        const res = await env.redisPool.brpop(env.channel + 'testlist1');
        test.assert(res, {key: env.channel + 'testlist1', element: 'baz'});
      }
    }, {
      desc: '#lpush 2 foo',
      run: async function (env, test) {
        await env.redisPool.lpush(env.channel + 'testlist2', 'foo');
        test.done();
      },
    }, {
      desc: '#lpush 2 bar',
      run: async function (env, test) {
        await env.redisPool.lpush(env.channel + 'testlist2', 'bar');
        test.done();
      }
    }, {
      desc: '#lpush 2 baz',
      run: async function (env, test) {
        await env.redisPool.lpush(env.channel + 'testlist2', 'baz');
        test.done();
      }
    }, {
      desc: '#blpop 2',
      run: async function (env, test) {
        const res = await env.redisPool.blpop(env.channel + 'testlist2');
        test.assert(res, {key: env.channel + 'testlist2', element: 'baz'});
      }
    }, {
      desc: '#brpop 2',
      run: async function (env, test) {
        setTimeout(async () => {
          const res = await env.redisPool.brpop(env.channel + 'testlist2');
          console.log('brpop2:', res);
          test.assert(res, {key: env.channel + 'testlist2', element: 'bar'});
        }, 0);
      }
    }, {
      desc: '#expire',
      timeout: 2000,
      run: async function (env, test) {
        await env.redisPool.expire(env.channel + 'test', 100);
        test.done();
      }
    }, {
      desc: '#ttl',
      timeout: 2000,
      run: async function (env, test) {
        const res = await env.redisPool.ttl(env.channel + 'test');
        test.assert(res > 0, true);
      }
    }, {
      desc: '#set',
      timeout: 2000,
      run: async function (env, test) {
        await env.redisPool.set(env.channel + 'test', 1);
        test.done();
      }
    }, {
      desc: '#incr',
      timeout: 2000,
      run: async function (env, test) {
        await env.redisPool.incr(env.channel + 'test');
        test.done();
      }
    }]
  });

  return suites;
});
