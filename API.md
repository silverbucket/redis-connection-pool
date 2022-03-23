<a name="RedisConnectionPool"></a>

## RedisConnectionPool
<p>Function: redisConnectionPoolFactory</p>
<p>A high-level redis management object. It manages a number of connections in
a pool, using them as needed and keeping all aspects of releasing active
connections internal to the object, so the user does not need to worry about
forgotten connections leaking memory and building up over time.</p>
<p>Parameters:</p>
<p>uid - (string) - Unique identifer to retreive an existing instance from
elsewhere in an application. If left undefined, one will
be generate automatically and avaialble via the <code>uid</code>
property of the returned object.</p>
<p>cfg - (object) - A series of configuration parameters to be optionally
passed in and used during initialization of the object.</p>
<p>cfg.max_clients - (number) - Max clients alive in the connection pool at
once. (default: 30)</p>
<p>cfg.perform_checks - (boolean) - Perform a series of redis checks,
currently this checks to to see if
blocking push/pops can be used.
(default: false)</p>
<p>redisConfig - (object) - A redis config object</p>
<p>Returns:</p>
<p>A RedisConnectionPool object</p>

**Kind**: global class  

* [RedisConnectionPool](#RedisConnectionPool)
    * [.expire()](#RedisConnectionPool+expire)
    * [.del()](#RedisConnectionPool+del)
    * [.hdel()](#RedisConnectionPool+hdel)
    * [.send_command()](#RedisConnectionPool+send_command)
    * [.ttl()](#RedisConnectionPool+ttl)
    * [.get()](#RedisConnectionPool+get)
    * [.hget()](#RedisConnectionPool+hget)
    * [.hgetall()](#RedisConnectionPool+hgetall)
    * [.blpop()](#RedisConnectionPool+blpop)
    * [.brpop()](#RedisConnectionPool+brpop)
    * [.brpoplpush()](#RedisConnectionPool+brpoplpush)
    * [.incr()](#RedisConnectionPool+incr)
    * [.set()](#RedisConnectionPool+set)
    * [.hset()](#RedisConnectionPool+hset)
    * [.rpush()](#RedisConnectionPool+rpush)
    * [.lpush()](#RedisConnectionPool+lpush)
    * [.clean()](#RedisConnectionPool+clean)

<a name="RedisConnectionPool+expire"></a>

### redisConnectionPool.expire()
<p>Function: expire</p>
<p>Execute a redis EXPIRE command</p>
<p>Parameters:</p>
<p>key   - (string) - A key to assign value to
value - (number) - TTL in seconds</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+del"></a>

### redisConnectionPool.del()
<p>Function: del</p>
<p>Execute a redis DEL command</p>
<p>Parameters:</p>
<p>key  - (string) - The key of the value you wish to delete</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+hdel"></a>

### redisConnectionPool.hdel()
<p>Function: hdel</p>
<p>Execute a redis HDEL command</p>
<p>Parameters:</p>
<p>key  - (string) - The key of the value you wish to delete
fields  - [string] - The field names to be deleted</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+send_command"></a>

### redisConnectionPool.send\_command()
<p>Function: send_command</p>
<p>Sends an explicit command to the redis server. Helpful for new commands in redis
that aren't supported yet by this JS API.</p>
<p>Parameters:</p>
<p>command_name  - (string) - The redis command to execute
args          - (array) - The arguments to the redis command</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+ttl"></a>

### redisConnectionPool.ttl()
<p>Function: ttl</p>
<p>Execute a redis TTL command</p>
<p>Parameters:</p>
<p>key   - (string) - A key whose TTL(time-to-expire) has to be returned</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+get"></a>

### redisConnectionPool.get()
<p>Function: get</p>
<p>Execute a redis GET command</p>
<p>Parameters:</p>
<p>key  - (string) - The key of the value you wish to get</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+hget"></a>

### redisConnectionPool.hget()
<p>Function: hget</p>
<p>Execute a redis HGET command</p>
<p>Parameters:</p>
<p>key   - (string) - The key of the hash you wish to get
field - (string) - The field name to retrieve</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+hgetall"></a>

### redisConnectionPool.hgetall()
<p>Function: hgetall</p>
<p>Execute a redis HGETALL command</p>
<p>Parameters:</p>
<p>key   - (string) - The key of the hash you wish to get</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+blpop"></a>

### redisConnectionPool.blpop()
<p>Function: blpop</p>
<p>Execute a redis BLPOP command</p>
<p>Parameters:</p>
<p>key   - (string) - The list key</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+brpop"></a>

### redisConnectionPool.brpop()
<p>Function: brpop</p>
<p>Execute a redis BRPOP command</p>
<p>Parameters:</p>
<p>key   - (string) - The list key</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+brpoplpush"></a>

### redisConnectionPool.brpoplpush()
<p>Function: brpoplpush</p>
<p>Execute a redis BRPOPLPUSH command</p>
<p>Parameters:</p>
<p>key1   - (string) - The pop list key
key2   - (string) - The push list key</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+incr"></a>

### redisConnectionPool.incr()
<p>Function: incr</p>
<p>Execute a redis INCR command</p>
<p>Parameters:</p>
<p>key   - (string) - A key whose value you wish to increment</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+set"></a>

### redisConnectionPool.set()
<p>Function: set</p>
<p>Execute a redis SET command</p>
<p>Parameters:</p>
<p>key  - (string) - A key to assign value to
data - (string) - Value to assign to key</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+hset"></a>

### redisConnectionPool.hset()
<p>Function: hset</p>
<p>Execute a redis HSET command</p>
<p>Parameters:</p>
<p>key   - (string) - A key to assign the hash to
field - (string) - Name of the field to set
data  - (string) - Value to assign to hash</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+rpush"></a>

### redisConnectionPool.rpush()
<p>Function: rpush</p>
<p>Execute a redis RPUSH command</p>
<p>Parameters:</p>
<p>key   - (string) - The list key
data  - (string) - Value to assign to the list</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+lpush"></a>

### redisConnectionPool.lpush()
<p>Function: lpush</p>
<p>Execute a redis LPUSH command</p>
<p>Parameters:</p>
<p>key   - (string) - The list key
data  - (string) - Value to assign to the list
cb    - (function) - Callback to be executed on completion</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+clean"></a>

### redisConnectionPool.clean()
<p>Function: clean</p>
<p>Clean the redis key namespace</p>
<p>Parameters:</p>
<p>key  - (string) - The key of the value you wish to clear (can use wildcard *)</p>

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
