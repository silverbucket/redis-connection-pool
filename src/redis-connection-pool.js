/**
 * redis-connection-pool.js
 *
 * copyright 2012-2015 Nick Jennings (https://github.com/silverbucket)
 *
 * licensed under the MIT license.
 * See the LICENSE file for details.
 *
 * The latest version can be found here:
 *
 *   https://github.com/silverbucket/node-redis-connection-pool
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

var redis     = require('redis'),
    Q         = require('q'),
    Pool      = require('generic-pool').Pool,
    debug     = require('debug')('redis-connection-pool');

/**
 * Function: RedisConnectionPool
 *
 * A high-level redis management object. It manages a number of connections in
 * a pool, using them as needed and keeping all aspects of releasing active
 * connections internal to the object, so the user does not need to worry about
 * forgotten connections leaking memory and building up over time.
 *
 * Parameters:
 *
 *   uid - (string) - Unique identifer to retreive an existing instance from
 *                    elsewhere in an application. If left undefined, one will
 *                    be generate automatically and avaialble via the `uid`
 *                    property of the returned object.
 *
 *   cfg - (object) - A series of configuration parameters to be optionally
 *                    passed in and used during initialization of the object.
 *
 *
 *   cfg.host - (string) - Redis host (default: "127.0.0.1")
 *
 *   cfg.port - (number) - Redis port (default: 6379)
 *
 *   cfg.max_clients - (number) - Max clients alive in the connection pool at
 *                                once. (default: 30)
 *
 *   cfg.perform_checks - (boolean) - Perform a series of redis checks,
 *                                    currently this checks to to see if
 *                                    blocking push/pops can be used.
 *                                    (default: false)
 *
 *   cfg.database - (number) - if you prefer a specific database number for this
 *                             pool, you can specify that here (default: 0)
 *
 * Returns:
 *
 *   A RedisConnectionPool object
 */
function RedisConnectionPool(uid, cfg) {
  this.uid            = (typeof uid ==='string') ? uid : 'redis-connection-pool-' + Math.floor((Math.random() * 99999) + 10000);
  this.host           = (typeof cfg.host === 'string') ? cfg.host : '127.0.0.1';
  this.port           = (typeof cfg.port === 'number') ? cfg.port : 6379;
  this.max_clients    = (typeof cfg.max_clients === 'number') ? cfg.max_clients : 30;
  this.perform_checks = (typeof cfg.perform_checks === 'boolean') ? cfg.perform_checks : false;
  this.options        = (typeof cfg.options === 'object') ? cfg.options : null;
  this.database       = (typeof cfg.database === 'number') ? cfg.database : 0;

  this.blocking_support = true;
  this.version_array    = undefined;
  this.version_string   = undefined;

  var self = this;

  var i = 0;
  this.pool = Pool({
    name: self.uid,
    create: function (callback) {
      var client = redis.createClient(self.port, self.host, self.options);
      client.__name = "client" + i;
      i = i + 1;

      self.database = self.database || 0;

      debug('selecting database ' + self.database);
      client.on('error', function (err) {
        debug(err);
      });
      
      client.on('ready', function () {
        client.select(self.database, function (err) {
          debug('2. selected database: ' + client.selected_db);
          callback(null, client);
        });
      });
    },
    destroy: function (client) {
      return client.quit();
    },
    max: self.max_clients,
    log: false
  });

  redisCheck.apply(this, []);

  setTimeout(function poolStats(pool) {
    // periodically report pool statistics
    debug('REDIS POOL: [size: ' + pool.getPoolSize() +
                ' avail:' + pool.availableObjectsCount() +
                ' waiting:' + pool.waitingClientsCount() + ']');
    setTimeout(poolStats, 300000, pool);
  }, 300000, this.pool);

  return this;
}



/**
 * Function: on
 *
 * listen for redis events
 *
 * Parameters:
 *
 *   type - (string) - Type of event to listen for.
 *   cb   - (function) - Callback function when the event is triggered.
 *
 */
RedisConnectionPool.prototype.on = function(type, cb) {
  client = redis.createClient();
  client.on(type, cb);
};

/**
 * Function: serverInfo
 *
 * Get server info
 *
 * Parameters: none
 *
 */
RedisConnectionPool.prototype.serverInfo = function (cb) {
  var pool = this.pool;
  pool.acquire(function (err, client) {
    var serverInfo = client.server_info;
    serverInfo.database = client.selected_db;
    pool.release(client);
    cb(null, serverInfo);
  });
};


/**
 * Function: expire
 *
 * Execute a redis EXPIRE command
 *
 * Parameters:
 *
 *   key   - (string) - A key to assign value to
 *   value - (number) - TTL in seconds
 *
 */
RedisConnectionPool.prototype.expire = function (key, data) {
  redisSingle.apply(this, ['expire', key, data]);
};

/**
 * Function: set
 *
 * Execute a redis SET command
 *
 * Parameters:
 *
 *   key  - (string) - A key to assign value to
 *   data - (string) - Value to assign to key
 *   cb   - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.set = function (key, data, cb) {
  _setFuncs.apply(this, ['set', key, data, cb]);
};

/**
 * Function: get
 *
 * Execute a redis GET command
 *
 * Parameters:
 *
 *   key  - (string) - The key of the value you wish to get
 *   cb   - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.get = function (key, cb) {
  _getFuncs.apply(this, ['get', key, cb]);
};

/**
 * Function: del
 *
 * Execute a redis DEL command
 *
 * Parameters:
 *
 *   key  - (string) - The key of the value you wish to delete
 *
 */
RedisConnectionPool.prototype.del = function (key) {
  redisSingle.apply(this, ['del', key]);
};

/**
 * Function: hset
 *
 * Execute a redis HSET command
 *
 * Parameters:
 *
 *   key   - (string) - A key to assign the hash to
 *   field - (string) - Name of the field to set
 *   data  - (string) - Value to assign to hash
 *   cb    - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.hset = function (key, field, data, cb) {
  _setFuncs.apply(this, ['hset', key, field, data, cb]);
};

/**
 * Function: hget
 *
 * Execute a redis HGET command
 *
 * Parameters:
 *
 *   key   - (string) - The key of the hash you wish to get
 *   field - (string) - The field name to retrieve
 *   cb    - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.hget = function (key, field, cb) {
  _getFuncs.apply(this, ['hget', key, field, cb]);
};

/**
 * Function: hgetall
 *
 * Execute a redis HGETALL command
 *
 * Parameters:
 *
 *   key   - (string) - The key of the hash you wish to get
 *   cb    - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.hgetall = function (key, cb) {
  _getFuncs.apply(this, ['hgetall', key, cb]);
};

/**
 * Function: rpush
 *
 * Execute a redis RPUSH command
 *
 * Parameters:
 *
 *   key   - (string) - The list key
 *   data  - (string) - Value to assign to the list
 *   cb    - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.rpush = function (key, data, cb) {
  _setFuncs.apply(this, ['rpush', key, data, cb]);
};

/**
 * Function: lpush
 *
 * Execute a redis LPUSH command
 *
 * Parameters:
 *
 *   key   - (string) - The list key
 *   data  - (string) - Value to assign to the list
 *   cb    - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.lpush = function (key, data, cb) {
  _setFuncs.apply(this, ['lpush', key, data, cb]);
};

/**
 * Function: blpop
 *
 * Execute a redis BLPOP command
 *
 * Parameters:
 *
 *   key   - (string) - The list key
 *   cb    - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.blpop = function (key, cb) {
  _getFuncs.apply(this, ['blpop', key, cb]);
};

/**
 * Function: brpop
 *
 * Execute a redis BRPOP command
 *
 * Parameters:
 *
 *   key   - (string) - The list key
 *   cb    - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.brpop = function (key, cb) {
  _getFuncs.apply(this, ['brpop', key, cb]);
};

/**
 * Function: clean
 *
 * Clean the redis key namespace
 *
 * Parameters:
 *
 *   key  - (string) - The key of the value you wish to clear (can use wildcard *)
 *   cb   - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.clean = function (key, cb) {
  debug('clearing redis key ' + key);
  var client = redis.createClient();
  var self = this;

  client.keys(key, function (err, keys) {
    client.quit();
    if ((keys) && (keys.forEach)) {
      keys.forEach(function (name, pos) {
        debug('deleting name ' + name);
        self.del(name);
      });
    } else {
      debug('ERROR couldnt get keys list on key \'' + key + '\': ', keys);
    }
    if (err) {
      debug('ERROR failed clearing redis queue. ' + err);
    }
    cb();
  });
};

/**
 * Function: check
 *
 * Performs a check on redis version and sets internal config based on support.
 *
 * This function is for compatibility checking, you don't normally need this.
 *
 * Returns:
 *
 *   promise which, upon completion, will return a version number as a string.
 */
RedisConnectionPool.prototype.check = function () {
  return redisCheck.apply(this, []);
};




function redisSingle (funcName, key, val) {
  var pool = this.pool;
  pool.acquire(function (err, client) {
    if (val) {
      client[funcName](key, val, function () {
        pool.release(client);
      });
    } else {
      client[funcName](key, function () {
        pool.release(client);
      });
    }
  });
}


function _setFuncs(funcName, key, field, data, cb) {
  var pool = this.pool;

  if (typeof cb === 'undefined') {
    cb = data;
    data = field;
    field = null;
  }

  pool.acquire(function (err, client) {
    if (funcName === 'hset') {
      client[funcName](key, field, data, function (err, reply) {
        pool.release(client);
        if (err) {
          debug("ERROR " + funcName + ": " + err);
        }
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      });
    } else if (funcName === 'set') {
      client[funcName](key, data, function (err, reply) {
        pool.release(client);
        if (err) {
            debug("ERROR " + funcName + ": " + err);
        }
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      });
    } else {
      client[funcName](key, data, function (err, reply) {
        pool.release(client);
        if (err) {
            debug("ERROR " + err);
        }
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      });
    }
  });
}


function _getFuncs(funcName, key, field, cb) {
  var pool = this.pool;
  var self = this;
  if ((typeof field === 'function') && (typeof cb === 'undefined')) {
    cb = field;
    field = null;
  }

  pool.acquire(function (err, client) {
    if ((funcName === 'get') || (funcName === 'hgetall')) {
      redisGet.apply(self, [funcName, client, key, cb]);
    } else if (funcName === 'blpop') {
      redisBlockingGet.apply(self, ['blpop', client, key, cb]);
    } else if (funcName === 'brpop') {
      redisBlockingGet.apply(self, ['brpop', client, key, cb]);
    } else if (funcName === 'hget') {
      redisHashGet.apply(self, [client, key, field, cb]);
    } else if (funcName === 'hgetall') {
      redisHashGet.apply(self, [client, key, null, cb]);
    }
  });
}


// works for get and hgetall
function redisGet(funcName, client, key, cb) {
  var responded = false;
  var pool = this.pool;
  client[funcName](key, function (err, replies) {
    responded = true;
    pool.release(client);
    if (err) {
      debug('ERROR: redis error (' + funcName + ' ' + key + ')', err);
      cb(err, null);
    } else {
      cb(err, replies);
    }
  });

  setTimeout(function() {
    if (!responded) {
      debug('ERROR: redis.' + funcName+' never returned (5s), destroying connection. ' + key);
      pool.destroy(client);
    }
  }, 5000);
}


function redisHashGet(client, key, field, cb) {
  var pool = this.pool;
  if (field) {
    client.hget(key, field, function (err, replies) {
      pool.release(client);
      if (err) {
        debug('ERROR: redis error (hget ' + key + ')', err);
        cb(err, null);
      } else {
        cb(err, replies);
      }
    });
  } else {
    client.hgetall(key, function (err, replies) {
      pool.release(client);
      if (err) {
        debug('ERROR: redis error (hget ' + key + ')', err);
        cb(err, null);
      } else {
        cb(err, replies);
      }
    });
  }
}


function redisBlockingGet(funcName, client, key, cb) {
  var pool = this.pool;
  var responded = false;
  client[funcName](key, 0, function (err, replies) {
    responded = true;
    pool.release(client);
    if (err) {
      debug('ERROR (' + funcName + ')', err);
      cb(err, null);
    } else if ((!replies) || (typeof replies[1] === 'undefined')) {
      debug('ERROR got a bad reply: ', replies);
      cb('got bad reply from redis', []);
    } else {
      cb(err, replies);
    }
  });
}


function redisCheck() {
  var q = Q.defer();
  var self = this;
  var client = redis.createClient(self.port, self.host);
  try {
    client.on('error', function (err) {
      client.quit();
      q.reject(err);
    });
    client.on('ready', function () {
      self.version_string = client.server_info.redis_version;
      self.version_array = client.server_info.versions;
      if (self.version_array[0] < 2) {
        self.blocking_support = false;
      }
      client.quit();
      q.resolve(self.version_string);
    });
  } catch (e) {
    debug('ERROR cannot connect to redis, ' + e);
    q.reject('cannot connect to redis: ' + e);
    client.quit();
  }
  return q.promise;
}


var RedisConnectionPoolWrapper;
(function () {
  var redisConnectionPools = {};
  RedisConnectionPoolWrapper = function (uid, cfg) {
    if (typeof redisConnectionPools[uid] === 'object') {
      return redisConnectionPools[uid];
    } else {
      var redisConnectionPool = new RedisConnectionPool(uid, cfg);
      redisConnectionPools[redisConnectionPool.uid] = redisConnectionPool;
      return redisConnectionPool;
    }
  };
})();

module.exports = function (uid, cfg) {
  if (typeof uid === 'object') {
    cfg = uid;
    uid = undefined;
  } else if (typeof cfg === 'undefined') {
    cfg = {};
  }

  return RedisConnectionPoolWrapper(uid, cfg);
};

