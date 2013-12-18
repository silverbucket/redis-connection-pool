if (typeof define !== 'function') {
  define = require('amdefine')(module);
}

define(['require'], function (require) {
  var suites = [];

  suites.push({
    name: "redis tests",
    desc: "collection of basic redis-connection-pool tests",
    abortOnFail: true, // don't continue with further test suites if any tests in this suite fail
    setup: function (env, test) {
      env.channel = "redis-connection-pool-tests:";
      env.redisPool = require('./../src/redis-connection-pool')('redisPoolTests', {
        HOST: '127.0.0.1',
        PORT: 6379,
        MAX_CLIENTS: 60,
        PERFORM_CHECKS: true
      });
      test.assertTypeAnd(env.redisPool, 'object');
      test.assertAnd(env.redisPool.UID, 'redisPoolTests');
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
        desc: "verify version properties are set",
        timeout: 2000,
        run: function (env, test) {
          test.assertTypeAnd(env.redisPool.VERSION_STRING, 'string');
          test.assertType(env.redisPool.VERSION_ARRAY, 'object');
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