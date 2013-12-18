/**
 * redis-pool.js
 *
 * copyright 2012-2013 Nick Jennings (https://github.com/silverbucket)
 *
 * licensed under the AGPLv3.
 * See the LICENSE file for details.
 *
 * The latest version can be found here:
 *   https://github.com/silverbucket/node-redis-pool
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

var redis = require('redis');
var Q = require('q');
var Pool = require('generic-pool').Pool;

function RedisPool(uid, cfg) {
  this.UID = (typeof uid ==='string') ? uid : this.UID + Math.floor((Math.random() * 99999) + 10000);
  this.DEBUG = (typeof cfg.DEBUG === 'boolean') ? cfg.DEBUG : this.DEBUG;
  this.HOST = (typeof cfg.HOST === 'string') ? cfg.HOST : this.HOST;
  this.PORT = (typeof cfg.PORT === 'number') ? cfg.PORT : this.PORT;
  this.MAX_CLIENTS = (typeof cfg.MAX_CLIENTS === 'number') ? cfg.MAX_CLIENTS : this.MAX_CLIENTS;
  this.PERFORM_CHECKS = (typeof cfg.PERFORM_CHECKS === 'boolean') ? cfg.PERFORM_CHECKS : this.PERFORM_CHECKS;
  var self = this;

  var i = 0;
  this.pool = Pool({
    name: self.UID,
    create: function (callback) {
      var client = redis.createClient(self.PORT, self.HOST);
      client.__name = "client"+i;
      i = i + 1;

      client.on('error', function (err) {
        console.log('ERROR: '+err);
      });

      client.on('ready', function () {
        callback(null, client);
      });
    },
    destroy: function (client) {
      return client.quit();
    },
    max: self.MAX_CLIENTS,
    log: this.DEBUG
  });

  if (self.DEBUG) {
    setTimeout(function poolStats() {
      // periodically report pool statistics
      console.log('REDIS POOL: [size: '+pool.getPoolSize()+' avail:'+pool.availableObjectsCount()+' waiting:'+pool.waitingClientsCount()+']');
      setTimeout(poolStats, 300000);
    }, 300000);
  }

  redisCheck.apply(this, []);
  return this;
}
RedisPool.prototype = {
  UID: 'redis-pool-',
  DEBUG: false,
  HOST: '127.0.0.1',
  PORT: 6379,
  MAX_CLIENTS: 30,
  BLOCKING_SUPPORT: true,
  PERFORM_CHECKS: false
};

RedisPool.prototype.on = function(type, cb) {
  client = redis.createClient();
  client.on(type, cb);
};

RedisPool.prototype.set = function (channel, data, cb) {
  _setFuncs.apply(this, ['set', channel, data, cb]);
};

RedisPool.prototype.get = function (channel, cb) {
  _getFuncs.apply(this, ['get', channel, cb]);
};

RedisPool.prototype.del = function (key) {
  redisSingle.apply(this, ['del', key]);
};

RedisPool.prototype.hset = function (channel, key, data, cb) {
  _setFuncs.apply(this, ['hset', channel, key, data, cb]);
};

RedisPool.prototype.hget = function (channel, key, cb) {
  _getFuncs.apply(this, ['hget', channel, key, cb]);
};

RedisPool.prototype.clean = function (channel, cb) {
  console.log('redis-pool: clearing redis channel ' + channel);
  var client = redis.createClient();
  var self = this;

  client.keys(channel, function (err, keys) {
    client.quit();
    //console.log('redis-pool: keys ', keys);
    if ((keys) && (keys.forEach)) {
      keys.forEach(function (key, pos) {
        console.log('redis-pool: deleting key ' + key);
        self.del(key);
      });
    } else {
      console.log('ERROR redis-pool: couldnt get keys list on channel \''+channel+'\': ', keys);
    }
    if (err) {
      console.log('ERROR redis-pool: failed clearing redis queue. '+err);
    }
    cb();
  });
};



function redisSingle (funcName, key) {
  var pool = this.pool;
  pool.acquire(function (err, client) {
    client[funcName](key, function () {
      pool.release(client);
    });
  });
}


function _setFuncs(funcName, chan, key, data, cb) {
  var pool = this.pool;

  if (typeof cb === 'undefined') {
    cb = data;
    data = key;
    key = null;
  }
  pool.acquire(function (err, client) {
    console.log('redis-pool: ' + funcName + ' ID: ' + client.__name +
                ' to chan ' + chan + ' KEY: '+ key + ' (func:'+typeof cb+') DATA: ', data);
    if (funcName === 'hset') {
      client[funcName](chan, key, data, function (err, reply) {
        pool.release(client);
        if (err) {
          console.log("ERROR redis-pool: " + funcName + ": " + err);
        }
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      });
    } else if (funcName === 'set') {
      //console.log('--- CHAN ('+typeof chan+'): ' + chan + ' DATA ('+typeof data+'): ', data);
      client[funcName](chan, data, function (err, reply) {
        pool.release(client);
        if (err) {
            console.error("ERROR redis-pool: " + funcName + ": " + err);
        }
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      });
    } else {
      // if ((typeof data === 'undefined') || (typeof data === 'function')) {
      //   cb = data;
      //   data = key;
      //   key = null;
      // }
      //console.log('--- KEY ('+typeof key+'): '+key+' DATA ('+typeof data+'): ', data);
      client[funcName](chan, data, function (err, reply) {
        pool.release(client);
        if (err) {
            console.error(" [util] set error: " + err);
        }
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      });
    }
  });
}


function _getFuncs(funcName, chan, key, cb) {
  var pool = this.pool;
  var self = this;
  if ((typeof key === 'function') && (typeof cb === 'undefined')) {
    cb = key;
    key = null;
  }
  console.log('redis-pool: getFuncs('+funcName+', '+chan+', '+key+', '+typeof cb);
  pool.acquire(function (err, client) {

    if ((funcName === 'get') || (funcName === 'hgetall')) {
      redisGet.apply(self, [funcName, client, chan, cb]);
    } else if (funcName === 'blpop') {
      redisBlockingGet.apply(self, ['blpop', client, chan, cb]);
    } else if (funcName === 'brpop') {
      redisBlockingGet.apply(self, ['brpop', client, chan, cb]);
    } else if (funcName === 'hget') {
      redisHashGet.apply(self, [client, chan, key, cb]);
    }
  });
}

// works for get and hgetall
function redisGet(funcName, client, chan, cb) {
  var pool = this.pool;
  //console.log('REDIS POOL: get ID: ' + client.__name + ' to chan ' + chan);
  var responded = false;
  client[funcName](chan, function (err, replies) {
    responded = true;
    pool.release(client);
    if (err) {
      console.log('ERROR: redis error ('+funcName+' '+chan+')', err);
      cb(err, null);
    } else {
      cb(err, replies);
    }
  });

  setTimeout(function() {
    if (!responded) {
      console.log('ERROR: redis.'+funcName+' never returned (5s), destroying connection. '+chan);
      pool.destroy(client);
    }
  }, 5000);
}

function redisHashGet(client, chan, key, cb) {
  var pool = this.pool;
  console.log('REDIS POOL: get ID: ' + client.__name + ' to chan ' + chan + ' KEY:' + key);
  var responded = false;
  client.hget(chan, key, function (err, replies) {
    responded = true;
    pool.release(client);
    if (err) {
      console.log('ERROR: redis error (hget '+chan+')', err);
      cb(err, null);
    } else {
      cb(err, replies);
    }
  });

  setTimeout(function() {
    if (!responded) {
      console.log('ERROR: redis.hget never returned (5s), destroying connection. '+chan);
      pool.destroy(client);
    }
  }, 5000);
}

function redisBlockingGet(funcName, client, chan, cb) {
  var pool = this.pool;
  //console.log(' [util] --- '+funcName+' ID: ' + client.__name + ' to chan ' + chan);
  var responded = false;
  client[funcName](chan, 0, function (err, replies) {
    responded = true;
    pool.release(client);
    if (err) {
      console.error(' [util] redis error (' + funcName + ')', err);
      cb(err, null);
    } else if ((!replies) || (typeof replies[1] === 'undefined')) {
      console.error('[util] got a bad reply from redis: ', replies);
      cb('got bad reply from redis', []);
    } else {
      //console.log(funcName + ' received: ', replies);
      cb(err, replies);
    }
  });

  // var minutes = 0;
  // setTimeout(function reportClient() {
  //   if (!responded) {
  //     minutes = minutes + 1;
  //     console.log(' [util] still waiting '+minutes+'m ['+funcName+':'+client.__name+' '+chan+']');
  //     setTimeout(reportClient, 60000);
  //   }
  // }, 60000);
}

function redisCheck() {
  var q = Q.defer();
  var self = this;
  console.log("redis-pool: checking redis connection at " + self.HOST + ':' + self.PORT);
  var client = redis.createClient(self.PORT, self.HOST);
  try {
    client.on('error', function (err) {
      client.quit();
      q.reject(err);
    });
    client.on('ready', function () {
      console.log('redis version: '+client.server_info.redis_version);
      var v = client.server_info.versions;
      if (v[0] < 2) {
        self.BLOCKING_SUPPORT = false;
      }
      client.quit();
      q.resolve(client.server_info.redis_version);
    });
  } catch (e) {
    q.reject('cannot connect to redis: ' + e);
    client.quit();
  }
  return q.promise;
}



var RedisPoolWrapper;
(function () {
  var redisPools = {};
  RedisPoolWrapper = function (uid, cfg) {
    if (typeof redisPools[uid] === 'object') {
      return redisPools[uid];
    } else {
      var redisPool = new RedisPool(uid, cfg);
      redisPools[redisPool.uid] = redisPool;
      return redisPool;
    }
  };
})();

module.exports = function (uid, cfg) {
  //console.log('RedisPoolWrapper: '+typeof RedisPoolWrapper);

  if (typeof uid === 'object') {
    cfg = uid;
    uid = undefined;
  } else if (typeof cfg === 'undefined') {
    cfg = {};
  }

  return RedisPoolWrapper(uid, cfg);
};