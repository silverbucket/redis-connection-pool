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
import { RedisClientOptions } from 'redis';
import { Pool } from 'generic-pool';
interface RedisConnectionPoolConfig {
    max_clients?: number;
    perform_checks?: boolean;
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
 *   uid - (string) - Unique identifer to retreive an existing instance from
 *                    elsewhere in an application. If left undefined, one will
 *                    be generate automatically and avaialble via the `uid`
 *                    property of the returned object.
 *
 *   cfg - (object) - A series of configuration parameters to be optionally
 *                    passed in and used during initialization of the object.
 *
 *
 *       cfg.max_clients - (number) - Max clients alive in the connection pool at
 *                                once. (default: 30)
 *
 *       cfg.perform_checks - (boolean) - Perform a series of redis checks,
 *                                    currently this checks to to see if
 *                                    blocking push/pops can be used.
 *                                    (default: false)
 *
 *   redisConfig - (object) - A redis config object
 *
 * Returns:
 *
 *   A RedisConnectionPool object
 */
export default function redisConnectionPoolFactory(uid: string, cfg?: RedisConnectionPoolConfig, redisCfg?: RedisClientOptions): any;
export declare class RedisConnectionPool {
    uid: string;
    max_clients: number;
    perform_checks: boolean;
    redisCfg: RedisClientOptions;
    pool: Pool<any>;
    constructor(uid: string, cfg?: RedisConnectionPoolConfig, redisCfg?: RedisClientOptions);
    init(): Promise<void>;
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
    expire(key: any, data: any): Promise<any>;
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
    del(key: any): Promise<any>;
    /**
     * Function: hdel
     *
     * Execute a redis HDEL command
     *
     * Parameters:
     *
     *   key  - (string) - The key of the value you wish to delete
     *   fields  - [string] - The field names to be deleted
     *
     */
    hdel(key: any, fields: any): Promise<any>;
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
     */
    send_command(command_name: any, args: any): Promise<any>;
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
    ttl(key: any): Promise<any>;
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
    get(key: any): Promise<any>;
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
    hget(key: any, field: any): Promise<any>;
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
    hgetall(key: any): Promise<any>;
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
    blpop(key: any): Promise<any>;
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
    brpop(key: any): Promise<any>;
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
    brpoplpush(key1: any, key2: any): Promise<any>;
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
    incr(key: any): Promise<any>;
    /**
     * Function: set
     *
     * Execute a redis SET command
     *
     * Parameters:
     *
     *   key  - (string) - A key to assign value to
     *   data - (string) - Value to assign to key
     *
     */
    set(key: any, data: any): Promise<any>;
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
    hset(key: any, field: any, data: any): Promise<any>;
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
    rpush(key: any, data: any): Promise<any>;
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
    lpush(key: any, data: any): Promise<any>;
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
    clean(key: any): Promise<void>;
    private singleCommand;
    private getFuncs;
}
export {};
