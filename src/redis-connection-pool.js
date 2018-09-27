/**
 * redis-connection-pool.js
 *
 * copyright 2012 - 2018 Nick Jennings (https://github.com/silverbucket)
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

const redis       = require('redis'),
      genericPool = require('generic-pool'),
      debug       = require('debug')('redis-connection-pool');

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
 *   cfg.url - (string) - [optional] Complete Redis URL (overrides host and port)
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
  this.uid            = (typeof uid ==='string') ? uid : 'redis-connection-pool-' +
                         Math.floor((Math.random() * 99999) + 10000);
  this.host           = (typeof cfg.host === 'string') ? cfg.host : '127.0.0.1';
  this.port           = (typeof cfg.port === 'number') ? cfg.port : 6379;
  this.max_clients    = (typeof cfg.max_clients === 'number') ? cfg.max_clients : 30;
  this.perform_checks = (typeof cfg.perform_checks === 'boolean') ? cfg.perform_checks : false;
  this.options        = (typeof cfg.options === 'object') ? cfg.options : null;
  this.database       = (typeof cfg.database === 'number') ? cfg.database : 0;

  if (typeof cfg.url === 'string') {
    this.url = cfg.url;
    this.host = undefined;
    this.port = undefined;
  }

  this.blocking_support = true;
  this.version_array    = undefined;
  this.version_string   = undefined;

  let i = 0;
  const factory = {
    create: () => {
      return new Promise((resolve, reject) => {
        let client;
        if (this.url) {
          client = redis.createClient(this.url, this.options);
        } else {
          client = redis.createClient(this.port, this.host, this.options);
        }
        client.__name = `client${i}`;
        i = i + 1;

        this.database = this.database || 0;

        debug('selecting database ' + this.database);
        client.on('error', function (err) {
          debug(err);
        });

        client.on('ready', () => {
          client.select(this.database, (err) => {
            debug('2. selected database: ' + client.selected_db);
            if (err) { return reject(err); }
            else { return resolve(client); }
          });
        });
      });
    },
    destroy: (client) => {
      return new Promise((resolve, reject) => {
        client.quit();
        resolve();
      });
    }
  };

  this.pool = genericPool.createPool(factory, {
    max: this.max_clients
  });

  redisCheck.apply(this, []);

  setInterval(() => {
    // periodically report pool statistics
    debug('pool size: ' + this.pool.size +
          ', available:' + this.pool.available +
          ', pending:' + this.pool.pending);
  }, 300000);

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
RedisConnectionPool.prototype.on = function (type, cb) {
  const client = redis.createClient();
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
  this.pool.acquire().then((client) => {
    let serverInfo = client.server_info;
    serverInfo.database = client.selected_db;
    this.pool.release(client);
    cb(null, serverInfo);
  }).catch(cb);
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
RedisConnectionPool.prototype.expire = function (key, data, cb) {
  redisSingle.apply(this, ['expire', key, data, cb]);
};

/**
 * Function: ttl
 *
 * Execute a redis TTL command
 *
 * Parameters:
 *
 *   key   - (string) - A key whose TTL(time-to-expire) has to be returned

 *
 */
RedisConnectionPool.prototype.ttl = function (key, cb) {
  _getFuncs.apply(this, ['ttl', key, cb]);
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
RedisConnectionPool.prototype.del = function (key, cb) {
  redisSingle.apply(this, ['del', key, cb]);
};

/**
 * Function: hdel
 *
 * Execute a redis HDEL command
 *
 * Parameters:
 *
 *   key  - (string) - The key of the value you wish to delete
 *   fields  - [string] - The field names to be deleted
 *   cb    - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.hdel = function (key, fields, cb) {
  redisSingle.apply(this, ['hdel', key, fields, cb]);
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
 * Function: brpoplpush
 *
 * Execute a redis BRPOPLPUSH command
 *
 * Parameters:
 *
 *   key1   - (string) - The pop list key
 *   key2   - (string) - The push list key
 *   cb    - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.brpoplpush = function (key1, key2, cb) {
  _getFuncs.apply(this, ['brpoplpush', [key1, key2], cb]);
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
  const client = redis.createClient();

  client.keys(key, (err, keys) => {
    client.quit();
    if ((keys) && (keys.forEach)) {
      keys.forEach((name) => {
        debug('deleting name ' + name);
        this.del(name);
      });
    } else {
      debug(`ERROR couldnt get keys list on key '${key}': `, keys);
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

/**
 * Function: incr
 *
 * Execute a redis INCR command
 *
 * Parameters:
 *
 *   key   - (string) - A key whose value you wish to increment
 *   cb   - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.incr = function (key, cb) {
  _getFuncs.apply(this, ['incr', key, cb]);
};

/**
 * Function: send_command
 *
 * Sends an explicit command to the redis server. Helpful for new commands in redis
 *   that aren't supported yet by this JS API.
 *
 * Parameters:
 *
 *   command_name  - (string) - The redis command to execute
 *   args          - (array) - The arguments to the redis command
 *   cb            - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.send_command = function (command_name, args, cb) {
  redisSingle.apply(this, ['send_command', command_name, args, cb]);
};



function redisSingle(funcName, key, val, cb) {
  if (typeof val === 'function') {
    cb = val;
    val = null;
  }
  this.pool.acquire().then((client) => {
    if (funcName === 'hdel') {
      const args = [key].concat(val);
      client[funcName](args, (err, reply) => {
        this.pool.release(client);
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      });
    } else if (val) {
      client[funcName](key, val, (err, reply) => {
        this.pool.release(client);
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      });
    } else {
      client[funcName](key, (err, reply) => {
        this.pool.release(client);
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      });
    }
  }).catch(cb);
}


function _setFuncs(funcName, key, field, data, cb) {
  if (typeof cb === 'undefined') {
    cb = data;
    data = field;
    field = null;
  }

  this.pool.acquire().then((client) => {
    if (funcName === 'hset') {
      client[funcName](key, field, data, (err, reply) => {
        this.pool.release(client);
        if (err) {
          debug(`ERROR ${funcName}: ` + err);
        }
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      });
    } else if (funcName === 'set') {
      client[funcName](key, data, (err, reply) => {
        this.pool.release(client);
        if (err) {
          debug(`ERROR ${funcName}: ` + err);
        }
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      });
    } else {
      client[funcName](key, data, (err, reply) => {
        this.pool.release(client);
        if (err) {
          debug('ERROR ' + err);
        }
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      });
    }
  }).catch(cb);
}


function _getFuncs(funcName, key, field, cb) {
  if ((typeof field === 'function') && (typeof cb === 'undefined')) {
    cb = field;
    field = null;
  }

  this.pool.acquire().then((client) => {
    if ((funcName === 'get') || (funcName === 'hgetall') ||
        (funcName === 'ttl') || (funcName === 'incr')) {
      redisGet.apply(this, [funcName, client, key, cb]);
    } else if (funcName === 'blpop') {
      redisBlockingGet.apply(this, ['blpop', client, key, cb]);
    } else if (funcName === 'brpop') {
      redisBlockingGet.apply(this, ['brpop', client, key, cb]);
    } else if (funcName === 'brpoplpush') {
      redisBlockingGetBRPOPLPUSH.apply(this, ['brpoplpush', client, key[0], key[1], cb]);
    } else if (funcName === 'hget') {
      redisHashGet.apply(this, [client, key, field, cb]);
    } else if (funcName === 'hgetall') {
      redisHashGet.apply(this, [client, key, null, cb]);
    }
  }).catch(cb);
}


// works for get and hgetall
function redisGet(funcName, client, key, cb) {
  let responded = false;
  client[funcName](key, (err, replies) => {
    responded = true;
    this.pool.release(client);
    if (err) {
      debug('ERROR: redis error (' + funcName + ' ' + key + ')', err);
      cb(err, null);
    } else {
      cb(err, replies);
    }
  });

  setTimeout(() => {
    if (!responded) {
      debug('ERROR: redis.' + funcName+' never returned (5s), destroying connection. ' + key);
      this.pool.destroy(client);
    }
  }, 5000);
}


function redisHashGet(client, key, field, cb) {
  if (field) {
    client.hget(key, field, (err, replies) => {
      this.pool.release(client);
      if (err) {
        debug('ERROR: redis error (hget ' + key + ')', err);
        cb(err, null);
      } else {
        cb(err, replies);
      }
    });
  } else {
    client.hgetall(key, (err, replies) => {
      this.pool.release(client);
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
  let responded = false;
  client[funcName](key, 0, (err, replies) => {
    responded = true;
    this.pool.release(client);
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

function redisBlockingGetBRPOPLPUSH(funcName, client, key1, key2, cb) {
  let responded = false;
  client[funcName](key1, key2, 0, (err, replies) => {
    responded = true;
    this.pool.release(client);
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
  return new Promise((resolve, reject) => {
    let client;
    if (this.url) {
      client = redis.createClient(this.url, this.options);
    } else {
      client = redis.createClient(this.port, this.host, this.options);
    }
    try {
      client.on('error', (err) => {
        client.quit();
        reject(err);
      });
      client.on('ready', () => {
        client.server_info = client.server_info || {};
        this.version_string = client.server_info.redis_version;
        this.version_array = client.server_info.versions;
        if (!this.version_array || this.version_array[0] < 2) {
          this.blocking_support = false;
        }
        client.quit();
        resolve(this.version_string);
      });
    } catch (e) {
      debug('ERROR cannot connect to redis, ' + e);
      client.quit();
      reject('cannot connect to redis: ' + e);
    }
  });
}


let redisConnectionPoolWrapper;
(function () {
  let redisConnectionPools = {};
  redisConnectionPoolWrapper = function (uid, cfg) {
    if (typeof redisConnectionPools[uid] === 'object') {
      return redisConnectionPools[uid];
    } else {
      const redisConnectionPool = new RedisConnectionPool(uid, cfg);
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

  return redisConnectionPoolWrapper(uid, cfg);
};
