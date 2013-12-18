if (typeof define !== 'function') {
  define = require('amdefine')(module);
}

define(['require'], function (require) {
  var suites = [];

  suites.push({
    name: "redis tests",
    desc: "collection of basic redis-pool tests",
    abortOnFail: true, // don't continue with further test suites if any tests in this suite fail
    setup: function (env, test) {
      env.channel = "redis-pool-tests:";
      env.redisPool = require('./../src/redis-pool')('redisPoolTests', {
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
      }

    ]
  });

  return suites;
});