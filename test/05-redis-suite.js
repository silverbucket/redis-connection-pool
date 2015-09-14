if (typeof define !== 'function') {
  define = require('amdefine')(module);
}

define(['require'], function (require) {
  var suites = [];

  suites.push(

  {
    name: "database connection tests",
    desc: "testing states of database connectivity",
    abortOnFail: true, // don't continue with further test suites if any tests in this suite fail
    setup: function (env, test) {
      env.RedisPool = require('./../src/redis-connection-pool');
      env.channel = "redis-connection-pool-tests:";
      test.done();
    },
    tests: [

      {
        desc: 'connect to database',
        run: function (env, test) {
          env.redisPool = env.RedisPool('redisPoolTests1', {
            host: '127.0.0.1',
            port: 6379,
            max_clients: 60,
            perform_checks: true
          });
          test.assertTypeAnd(env.redisPool, 'object');
          test.assertAnd(env.redisPool.uid, 'redisPoolTests1');
          
          env.redisPool.serverInfo(function (err, serverInfo) {
            test.assert(serverInfo.database, 0);
          });
          
        },
        takedown: function (env, test) {
          env.redisPool.clean(env.channel + '*', function () {
            test.result(true);
          });
          delete env.redisPool;
        }
      },

      {
        desc: 'connect to database 7',
        run: function (env, test) {
          env.redisPool = env.RedisPool('redisPoolTests2', {
            host: '127.0.0.1',
            port: 6379,
            max_clients: 60,
            perform_checks: true,
            database: 7
          });
          test.assertTypeAnd(env.redisPool, 'object');
          test.assertAnd(env.redisPool.uid, 'redisPoolTests2');
          
          env.redisPool.serverInfo(function (err, serverInfo) {
            test.assert(serverInfo.database, 7);
          });
        },
        takedown: function (env, test) {
          env.redisPool.clean(env.channel + '*', function () {
            test.result(true);
          });
          delete env.redisPool;
        }
      }
      
    ]
  },

  {
    name: "redis tests",
    desc: "collection of basic redis-connection-pool tests",
    abortOnFail: true, // don't continue with further test suites if any tests in this suite fail
    setup: function (env, test) {
      env.channel = "redis-connection-pool-tests:";
      env.redisPool = require('./../src/redis-connection-pool')('redisPoolTests', {
        host: '127.0.0.1',
        port: 6379,
        max_clients: 60,
        perform_checks: true
      });
      test.assertTypeAnd(env.redisPool, 'object');
      test.assertAnd(env.redisPool.uid, 'redisPoolTests');
      env.redisPool.clean(env.channel + '*', function () {
        test.result(true);
      });
    },
    takedown: function (env, test) {
      env.redisPool.clean(env.channel + '*', function () {
        test.result(true);
      });
      delete env.redisPool;
    },
    tests: [

      {
        desc: "#check()",
        timeout: 2000,
        run: function (env, test) {
          env.redisPool.check().then(function (redis_version) {
            test.assertType(redis_version, 'string');
          });
        }
      },

      {
        desc: "verify version properties are set",
        timeout: 2000,
        run: function (env, test) {
          test.assertTypeAnd(env.redisPool.version_string, 'string');
          test.assertType(env.redisPool.version_array, 'object');
        }
      },

      {
        desc: "#set",
        timeout: 2000,
        run: function (env, test) {
          env.redisPool.set(env.channel + 'test', 'foobar', function (err) {
            test.assert(err, null);
          });
        }
      },

      {
        desc: "#get",
        run: function (env, test) {
          env.redisPool.get(env.channel + 'test', function (err, reply) {
            test.assertAnd(err, null);
            test.assert(reply, 'foobar');
          });
        }
      },

      {
        desc: "#hset",
        run: function (env, test) {
          env.redisPool.hset(env.channel + 'testhash', 'foo', 'bar', function (err, reply) {
            test.assert(err, null);
          });
        }
      },

      {
        desc: "#hget",
        run: function (env, test) {
          env.redisPool.hget(env.channel + 'testhash', 'foo', function (err, reply) {
            test.assertAnd(err, null);
            test.assert(reply, 'bar');
          });
        }
      },

      {
        desc: "#hset",
        run: function (env, test) {
          env.redisPool.hset(env.channel + 'testhash', 'foo', 'bar', function (err, reply) {
            test.assertAnd(err, null);
            env.redisPool.hset(env.channel + 'testhash', 'john', 'doe', function (err, reply) {
              test.assertAnd(err, null);
              env.redisPool.hset(env.channel + 'testhash', 'super', 'dong', function (err, reply) {
                test.assertAnd(err, null);
                env.redisPool.hset(env.channel + 'testhash', 'cau', 'sau', function (err, reply) {
                  test.assert(err, null);
                });
              });
            });
          });
        }
      },

      {
        desc: "#hgetall",
        run: function (env, test) {
          env.redisPool.hget(env.channel + 'testhash', function (err, reply) {
            test.assertAnd(err, null);
            console.log('reply:', reply);
            test.assert(reply, { foo: 'bar', john: 'doe', super: 'dong', cau: 'sau' });
          });
        }
      },

      {
        desc: "#rpush",
        run: function (env, test) {
          env.redisPool.rpush(env.channel + 'testlist', 'foo', function (err, reply) {
            test.assertAnd(err, null);
            env.redisPool.rpush(env.channel + 'testlist', 'bar', function (err, reply) {
              test.assertAnd(err, null);
              env.redisPool.rpush(env.channel + 'testlist', 'baz', function (err, reply) {
                test.assert(err, null);
              });
            });
          });
        }
      },

      {
        desc: "#blpop",
        run: function (env, test) {
          env.redisPool.blpop(env.channel + 'testlist', function (err, reply) {
            test.assertAnd(err, null);
            test.assert(reply, [env.channel + 'testlist', 'foo']);
          });
        }
      },

      {
        desc: "#brpop",
        run: function (env, test) {
          env.redisPool.brpop(env.channel + 'testlist', function (err, reply) {
            test.assertAnd(err, null);
            test.assert(reply, [env.channel + 'testlist', 'baz']);
          });
        }
      },

      {
        desc: "#lpush",
        run: function (env, test) {
          env.redisPool.lpush(env.channel + 'testlist', 'foo', function (err, reply) {
            test.assertAnd(err, null);
            env.redisPool.lpush(env.channel + 'testlist', 'bar', function (err, reply) {
              test.assertAnd(err, null);
              env.redisPool.lpush(env.channel + 'testlist', 'baz', function (err, reply) {
                test.assert(err, null);
              });
            });
          });
        }
      },

      {
        desc: "#blpop",
        run: function (env, test) {
          env.redisPool.blpop(env.channel + 'testlist', function (err, reply) {
            test.assertAnd(err, null);
            test.assert(reply, [env.channel + 'testlist', 'baz']);
          });
        }
      },

      {
        desc: "#brpop",
        run: function (env, test) {
          env.redisPool.brpop(env.channel + 'testlist', function (err, reply) {
            test.assertAnd(err, null);
            test.assert(reply, [env.channel + 'testlist', 'bar']);
          });
        }
      },

    ]
  });

  return suites;
});
