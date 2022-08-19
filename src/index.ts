/**
 * redis-connection-pool
 *
 * copyright 2012 - 2022 Nick Jennings (https://github.com/silverbucket)
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
import {
  createClient,
  RedisClientOptions,
  RedisModules,
  RedisScripts,
  RedisClientType
} from 'redis';
import {createPool, Pool}  from 'generic-pool';
import debug from 'debug';

const log = debug('redis-connection-pool');
const connectionPools = new Map();

export interface RedisConnectionPoolConfig {
  max_clients?: number;
  perform_checks?: boolean;
  redis?: RedisClientOptions;
}

type FuncNameType = 'HDEL' | 'DEL' | 'GET' | 'HGETALL' | 'TTL' | 'INCR' |
  'BRPOP' | 'HGET' | 'BLPOP' | 'BRPOPLPUSH' | 'EXPIRE'
type IdentifierType = string;

export default function redisConnectionPoolFactory(
  uid: IdentifierType,
  cfg: RedisConnectionPoolConfig
): RedisConnectionPool {
  if (! connectionPools.has(uid)) {
    connectionPools.set(uid, new RedisConnectionPool(uid, cfg));
  }
  return connectionPools.get(uid);
}

/**
 * Function: redisConnectionPoolFactory
 *
 * A high-level redis management object. It manages a number of connections in
 * a pool, using them as needed and keeping all aspects of releasing active
 * connections internal to the object, so the user does not need to worry about
 * forgotten connections leaking memory and building up over time.
 *
 * Parameters:
 *
 *   uid - (string) - Unique identifier to retrieve an existing instance from
 *                    elsewhere in an application. If left undefined, one will
 *                    be generated automatically and available via the `uid`
 *                    property of the returned object.
 *
 *   cfg - (object) - A series of configuration parameters to be optionally
 *                    passed in and used during initialization of the object.
 *
 *
 *   cfg.max_clients - (number) - Max clients alive in the connection pool at
 *                                once. (default: 30)
 *
 *   cfg.perform_checks - (boolean) - Perform a series of redis checks,
 *                                    currently this checks to see if
 *                                    blocking push/pops can be used.
 *                                    (default: false)
 *
 *   cfg.redis - (object) - A redis config object
 *
 * Returns:
 *
 *   A RedisConnectionPool object
 */
export class RedisConnectionPool {
  uid: IdentifierType;
  max_clients = 10;
  perform_checks = false;
  redis: RedisClientOptions;
  pool: Pool<RedisClientType<RedisModules, RedisScripts>>;

  constructor(uid: IdentifierType, cfg: RedisConnectionPoolConfig = {}) {
    this.uid = uid;
    this.max_clients = cfg.max_clients || this.max_clients;
    this.perform_checks = this.perform_checks || this.perform_checks;
    this.redis = cfg.redis;
  }

  async init() {
    this.pool = createPool({
      create: async () => {
        log('create');
        const client = createClient(this.redis);
        client.on('error', function (err) {
          log(err);
        });
        client.on('ready', () => {
          log('ready');
        });
        log('connecting');
        await client.connect();
        return client;
      },
      destroy: async (client) => {
        await client.quit();
      }
    }, {
      max: this.max_clients
    });
  }

  /**
   * Function: expire
   *
   * Execute a redis EXPIRE command
   *
   * Parameters:
   *
   *   key   - (string) - A key to assign value to
   *   ttl   - (number) - TTL in seconds
   *
   */
  async expire(key: string, ttl: number) {
    return await this.singleCommand('EXPIRE', [key, ttl]);
  }

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
  async del(key: string) {
    return await this.singleCommand('DEL', [key]);
  }

  /**
   * Function: hdel
   *
   * Execute a redis HDEL command
   *
   * Parameters:
   *
   *   key  - (string) - The key of the value you wish to delete
   *   fields  - [string] - Array of field names to be deleted
   *
   */
  async hdel(key: string, fields: Array<string>) {
    return await this.singleCommand('HDEL', [key, fields]);
  }

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
   *
   * For eg:
   *  send_command('HSET', ['firstRedisKey', 'key1', 'Hello Redis'] )
   */
  async send_command(command_name, args) {
    return await this.singleCommand(command_name, args);
  }


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
  async ttl(key: string) {
    return await this.getFuncs('TTL', key);
  }

  /**
   * Function: get
   *
   * Execute a redis GET command
   *
   * Parameters:
   *
   *   key  - (string) - The key of the value you wish to get
   *
   */
  async get(key: string) {
    return await this.getFuncs('GET', key);
  }


  /**
   * Function: hget
   *
   * Execute a redis HGET command
   *
   * Parameters:
   *
   *   key   - (string) - The key of the hash you wish to get
   *   field - (string) - The field name to retrieve
   *
   */
  async hget(key: string, field: string) {
    return await this.getFuncs('HGET', key, field);
  }

  /**
   * Function: hgetall
   *
   * Execute a redis HGETALL command
   *
   * Parameters:
   *
   *   key   - (string) - The key of the hash you wish to get
   *
   */
  async hgetall(key: string) {
    return await this.getFuncs('HGETALL', key);
  }

  /**
   * Function: blpop
   *
   * Execute a redis BLPOP command
   *
   * Parameters:
   *
   *   key   - (string) - The list key
   *
   */
  async blpop(key: string) {
    return await this.getFuncs('BLPOP', key);
  }

  /**
   * Function: brpop
   *
   * Execute a redis BRPOP command
   *
   * Parameters:
   *
   *   key   - (string) - The list key
   *
   */
  async brpop(key: string) {
    return await this.getFuncs('BRPOP', key);
  }

  /**
   * Function: brpoplpush
   *
   * Execute a redis BRPOPLPUSH command
   *
   * Parameters:
   *
   *   key1   - (string) - The pop list key
   *   key2   - (string) - The push list key
   *
   */
  async brpoplpush(key1: string, key2: string) {
    return await this.getFuncs('BRPOPLPUSH', key1, key2);
  }

  /**
   * Function: incr
   *
   * Execute a redis INCR command
   *
   * Parameters:
   *
   *   key   - (string) - A key whose value you wish to increment
   *
   */
  async incr(key: string) {
    return await this.getFuncs('INCR', key);
  }

  /**
   * Function: set
   *
   * Execute a redis SET command
   *
   * Parameters:
   *
   *   key  - (string) - A key to assign value to
   *   data - (string) - Value to assign to key
   *   ttl  - (number) - optional TTL (Time to Live) in seconds
   *
   */
  async set(key: string, data: string, ttl = 0) {
    const client = await this.pool.acquire();
    const res = client.SET(key, data, { "EX": ttl });
    await this.pool.release(client);
    return res;
  }

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
   *
   */
  async hset(key: string, field: string, data: never) {
    const client = await this.pool.acquire();
    const res = client.HSET(key, field, data);
    await this.pool.release(client);
    return res;
  }

  /**
   * Function: rpush
   *
   * Execute a redis RPUSH command
   *
   * Parameters:
   *
   *   key   - (string) - The list key
   *   data  - (string) - Value to assign to the list
   *
   */
  async rpush(key: string, data: never) {
    const client = await this.pool.acquire();
    const res = client.RPUSH(key, data);
    await this.pool.release(client);
    return res;
  }

  /**
   * Function: lpush
   *
   * Execute a redis LPUSH command
   *
   * Parameters:
   *
   *   key   - (string) - The list key
   *   data  - (string) - Value to assign to the list
   *
   */
  async lpush(key: string, data: never) {
    const client = await this.pool.acquire();
    const res = client.LPUSH(key, data);
    await this.pool.release(client);
    return res;
  }

  /**
   * Function: clean
   *
   * Clean the redis key namespace
   *
   * Parameters:
   *
   *   key  - (string) - The key of the value you wish to clear (can use wildcard *)
   *
   */
  async clean(key: string) {
    log('clearing redis key ' + key);
    const client = createClient(this.redis);
    await client.connect();

    const keys = await client.keys(key);
    await client.quit();
    if (Array.isArray(keys)) {
      await keys.forEach((name) => {
        log('deleting name ' + name);
        this.del(name);
      });
    } else {
      log(`ERROR couldn't get keys list on key '${key}': `, keys);
    }
  }

  private async singleCommand(funcName: FuncNameType, functionParams: Array<any>) {
    const client = await this.pool.acquire();
    const res = await client[funcName](...(functionParams || []));
    await this.pool.release(client);
    return res;
  }

  private async getFuncs(
    funcName: FuncNameType,
    key: string,
    field: string | undefined = undefined
  ) {
    const client = await this.pool.acquire();
    let res;
    if ((funcName === 'GET') || (funcName === 'HGETALL') ||
      (funcName === 'TTL') || (funcName === 'INCR')) {
      res = await client[funcName](key);
    } else if ((funcName === 'BLPOP') || (funcName === 'BRPOP')) {
      res = await client[funcName](key, 0);
    } else if (funcName === 'BRPOPLPUSH') {
      res = await client.BRPOPLPUSH(key, field, 0);
    } else if (funcName === 'HGET') {
      res = await client.HGET(key, field);
    }
    await this.pool.release(client);
    return res;
  }
}
