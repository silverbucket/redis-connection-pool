"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConnectionPool = void 0;
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
const redis_1 = require("redis");
const generic_pool_1 = require("generic-pool");
const debug_1 = __importDefault(require("debug"));
const log = (0, debug_1.default)('redis-connection-pool');
const connectionPools = new Map();
function redisConnectionPoolFactory(uid, cfg = {}, redisCfg = {}) {
    if (!connectionPools.has(uid)) {
        connectionPools.set(uid, new RedisConnectionPool(uid, cfg, redisCfg));
    }
    return connectionPools.get(uid);
}
exports.default = redisConnectionPoolFactory;
class RedisConnectionPool {
    constructor(uid, cfg = {}, redisCfg = {}) {
        this.max_clients = 10;
        this.perform_checks = false;
        this.uid = uid;
        this.max_clients = cfg.max_clients || this.max_clients;
        this.perform_checks = this.perform_checks || this.perform_checks;
        this.redisCfg = redisCfg;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.pool = (0, generic_pool_1.createPool)({
                create: () => __awaiter(this, void 0, void 0, function* () {
                    log('create');
                    const client = (0, redis_1.createClient)(this.redisCfg);
                    client.on('error', function (err) {
                        log(err);
                    });
                    client.on('ready', () => {
                        log('ready');
                    });
                    log('connecting');
                    yield client.connect();
                    return client;
                }),
                destroy: (client) => __awaiter(this, void 0, void 0, function* () {
                    client.quit();
                })
            }, {
                max: this.max_clients
            });
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
     *   value - (number) - TTL in seconds
     *
     */
    expire(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.singleCommand('EXPIRE', key, data);
        });
    }
    ;
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
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.singleCommand('DEL', key);
        });
    }
    ;
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
    hdel(key, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.singleCommand('HDEL', key, fields);
        });
    }
    ;
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
    send_command(command_name, args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.singleCommand('send_command', command_name, args);
        });
    }
    ;
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
    ttl(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getFuncs('TTL', key);
        });
    }
    ;
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
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getFuncs('GET', key);
        });
    }
    ;
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
    hget(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getFuncs('HGET', key, field);
        });
    }
    ;
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
    hgetall(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getFuncs('HGETALL', key);
        });
    }
    ;
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
    blpop(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getFuncs('BLPOP', key);
        });
    }
    ;
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
    brpop(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getFuncs('BRPOP', key);
        });
    }
    ;
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
    brpoplpush(key1, key2) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getFuncs('BRPOPLPUSH', [key1, key2]);
        });
    }
    ;
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
    incr(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getFuncs('incr', key);
        });
    }
    ;
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
    set(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.acquire();
            const res = client.SET(key, data);
            yield this.pool.release(client);
            return res;
        });
    }
    ;
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
    hset(key, field, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.acquire();
            const res = client.HSET(key, field, data);
            yield this.pool.release(client);
            return res;
        });
    }
    ;
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
    rpush(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.acquire();
            const res = client.RPUSH(key, data);
            yield this.pool.release(client);
            return res;
        });
    }
    ;
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
    lpush(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.acquire();
            const res = client.LPUSH(key, data);
            yield this.pool.release(client);
            return res;
        });
    }
    ;
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
    clean(key) {
        return __awaiter(this, void 0, void 0, function* () {
            log('clearing redis key ' + key);
            const client = (0, redis_1.createClient)(this.redisCfg);
            yield client.connect();
            const keys = yield client.keys(key);
            client.quit();
            if ((keys) && (keys.forEach)) {
                keys.forEach((name) => {
                    log('deleting name ' + name);
                    this.del(name);
                });
            }
            else {
                log(`ERROR couldnt get keys list on key '${key}': `, keys);
            }
        });
    }
    ;
    singleCommand(funcName, key, val = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.acquire();
            let res;
            if (funcName === 'hdel') {
                const args = [key].concat(val);
                res = yield client[funcName](args);
            }
            else if (val) {
                res = yield client[funcName](key, val);
            }
            else {
                res = yield client[funcName](key);
            }
            yield this.pool.release(client);
            return res;
        });
    }
    getFuncs(funcName, key, field = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.acquire();
            let res;
            if ((funcName === 'GET') || (funcName === 'HGETALL') ||
                (funcName === 'TTL') || (funcName === 'INCR')) {
                res = yield client[funcName](key);
            }
            else if ((funcName === 'BLPOP') || (funcName == 'BRPOP')) {
                res = yield client[funcName](key, 0);
            }
            else if (funcName === 'BRPOPLPUSH') {
                res = yield client.BRPOPLPUSH(key[0], key[1], 0);
            }
            else if (funcName === 'HGET') {
                res = yield client.HGET(key, field);
            }
            yield this.pool.release(client);
            return res;
        });
    }
}
exports.RedisConnectionPool = RedisConnectionPool;
//# sourceMappingURL=/index.js.map