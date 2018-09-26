## Constants

<dl>
<dt><a href="#redis">redis</a></dt>
<dd><p>redis-connection-pool.js</p>
<p>copyright 2012 - 2018 Nick Jennings (<a href="https://github.com/silverbucket">https://github.com/silverbucket</a>)</p>
<p>licensed under the MIT license.
See the LICENSE file for details.</p>
<p>The latest version can be found here:</p>
<p>  <a href="https://github.com/silverbucket/node-redis-connection-pool">https://github.com/silverbucket/node-redis-connection-pool</a></p>
<p>This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#RedisConnectionPool">RedisConnectionPool()</a></dt>
<dd><p>Function: RedisConnectionPool</p>
<p>A high-level redis management object. It manages a number of connections in
a pool, using them as needed and keeping all aspects of releasing active
connections internal to the object, so the user does not need to worry about
forgotten connections leaking memory and building up over time.</p>
<p>Parameters:</p>
<p>  uid - (string) - Unique identifer to retreive an existing instance from
                   elsewhere in an application. If left undefined, one will
                   be generate automatically and avaialble via the <code>uid</code>
                   property of the returned object.</p>
<p>  cfg - (object) - A series of configuration parameters to be optionally
                   passed in and used during initialization of the object.</p>
<p>  cfg.host - (string) - Redis host (default: &quot;127.0.0.1&quot;)</p>
<p>  cfg.port - (number) - Redis port (default: 6379)</p>
<p>  cfg.url - (string) - [optional] Complete Redis URL (overrides host and port)</p>
<p>  cfg.max_clients - (number) - Max clients alive in the connection pool at
                               once. (default: 30)</p>
<p>  cfg.perform_checks - (boolean) - Perform a series of redis checks,
                                   currently this checks to to see if
                                   blocking push/pops can be used.
                                   (default: false)</p>
<p>  cfg.database - (number) - if you prefer a specific database number for this
                            pool, you can specify that here (default: 0)</p>
<p>Returns:</p>
<p>  A RedisConnectionPool object</p>
</dd>
</dl>

<a name="redis"></a>

## redis
redis-connection-pool.js

copyright 2012 - 2018 Nick Jennings (https://github.com/silverbucket)

licensed under the MIT license.
See the LICENSE file for details.

The latest version can be found here:

  https://github.com/silverbucket/node-redis-connection-pool

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

**Kind**: global constant  
<a name="RedisConnectionPool"></a>

## RedisConnectionPool()
Function: RedisConnectionPool

A high-level redis management object. It manages a number of connections in
a pool, using them as needed and keeping all aspects of releasing active
connections internal to the object, so the user does not need to worry about
forgotten connections leaking memory and building up over time.

Parameters:

  uid - (string) - Unique identifer to retreive an existing instance from
                   elsewhere in an application. If left undefined, one will
                   be generate automatically and avaialble via the `uid`
                   property of the returned object.

  cfg - (object) - A series of configuration parameters to be optionally
                   passed in and used during initialization of the object.


  cfg.host - (string) - Redis host (default: "127.0.0.1")

  cfg.port - (number) - Redis port (default: 6379)

  cfg.url - (string) - [optional] Complete Redis URL (overrides host and port)

  cfg.max_clients - (number) - Max clients alive in the connection pool at
                               once. (default: 30)

  cfg.perform_checks - (boolean) - Perform a series of redis checks,
                                   currently this checks to to see if
                                   blocking push/pops can be used.
                                   (default: false)

  cfg.database - (number) - if you prefer a specific database number for this
                            pool, you can specify that here (default: 0)

Returns:

  A RedisConnectionPool object

**Kind**: global function  

* [RedisConnectionPool()](#RedisConnectionPool)
    * [.on()](#RedisConnectionPool+on)
    * [.serverInfo()](#RedisConnectionPool+serverInfo)
    * [.expire()](#RedisConnectionPool+expire)
    * [.ttl()](#RedisConnectionPool+ttl)
    * [.set()](#RedisConnectionPool+set)
    * [.get()](#RedisConnectionPool+get)
    * [.del()](#RedisConnectionPool+del)
    * [.hdel()](#RedisConnectionPool+hdel)
    * [.hset()](#RedisConnectionPool+hset)
    * [.hget()](#RedisConnectionPool+hget)
    * [.hgetall()](#RedisConnectionPool+hgetall)
    * [.rpush()](#RedisConnectionPool+rpush)
    * [.lpush()](#RedisConnectionPool+lpush)
    * [.blpop()](#RedisConnectionPool+blpop)
    * [.brpop()](#RedisConnectionPool+brpop)
    * [.brpoplpush()](#RedisConnectionPool+brpoplpush)
    * [.clean()](#RedisConnectionPool+clean)
    * [.check()](#RedisConnectionPool+check)
    * [.incr()](#RedisConnectionPool+incr)
    * [.send_command()](#RedisConnectionPool+send_command)

<a name="RedisConnectionPool+on"></a>

### redisConnectionPool.on()
Function: on

listen for redis events

Parameters:

  type - (string) - Type of event to listen for.
  cb   - (function) - Callback function when the event is triggered.

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+serverInfo"></a>

### redisConnectionPool.serverInfo()
Function: serverInfo

Get server info

Parameters: none

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+expire"></a>

### redisConnectionPool.expire()
Function: expire

Execute a redis EXPIRE command

Parameters:

  key   - (string) - A key to assign value to
  value - (number) - TTL in seconds

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+ttl"></a>

### redisConnectionPool.ttl()
Function: ttl

Execute a redis TTL command

Parameters:

  key   - (string) - A key whose TTL(time-to-expire) has to be returned

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+set"></a>

### redisConnectionPool.set()
Function: set

Execute a redis SET command

Parameters:

  key  - (string) - A key to assign value to
  data - (string) - Value to assign to key
  cb   - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+get"></a>

### redisConnectionPool.get()
Function: get

Execute a redis GET command

Parameters:

  key  - (string) - The key of the value you wish to get
  cb   - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+del"></a>

### redisConnectionPool.del()
Function: del

Execute a redis DEL command

Parameters:

  key  - (string) - The key of the value you wish to delete

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+hdel"></a>

### redisConnectionPool.hdel()
Function: hdel

Execute a redis HDEL command

Parameters:

  key  - (string) - The key of the value you wish to delete
  fields  - [string] - The field names to be deleted
  cb    - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+hset"></a>

### redisConnectionPool.hset()
Function: hset

Execute a redis HSET command

Parameters:

  key   - (string) - A key to assign the hash to
  field - (string) - Name of the field to set
  data  - (string) - Value to assign to hash
  cb    - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+hget"></a>

### redisConnectionPool.hget()
Function: hget

Execute a redis HGET command

Parameters:

  key   - (string) - The key of the hash you wish to get
  field - (string) - The field name to retrieve
  cb    - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+hgetall"></a>

### redisConnectionPool.hgetall()
Function: hgetall

Execute a redis HGETALL command

Parameters:

  key   - (string) - The key of the hash you wish to get
  cb    - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+rpush"></a>

### redisConnectionPool.rpush()
Function: rpush

Execute a redis RPUSH command

Parameters:

  key   - (string) - The list key
  data  - (string) - Value to assign to the list
  cb    - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+lpush"></a>

### redisConnectionPool.lpush()
Function: lpush

Execute a redis LPUSH command

Parameters:

  key   - (string) - The list key
  data  - (string) - Value to assign to the list
  cb    - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+blpop"></a>

### redisConnectionPool.blpop()
Function: blpop

Execute a redis BLPOP command

Parameters:

  key   - (string) - The list key
  cb    - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+brpop"></a>

### redisConnectionPool.brpop()
Function: brpop

Execute a redis BRPOP command

Parameters:

  key   - (string) - The list key
  cb    - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+brpoplpush"></a>

### redisConnectionPool.brpoplpush()
Function: brpoplpush

Execute a redis BRPOPLPUSH command

Parameters:

  key1   - (string) - The pop list key
  key2   - (string) - The push list key
  cb    - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+clean"></a>

### redisConnectionPool.clean()
Function: clean

Clean the redis key namespace

Parameters:

  key  - (string) - The key of the value you wish to clear (can use wildcard *)
  cb   - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+check"></a>

### redisConnectionPool.check()
Function: check

Performs a check on redis version and sets internal config based on support.

This function is for compatibility checking, you don't normally need this.

Returns:

  promise which, upon completion, will return a version number as a string.

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+incr"></a>

### redisConnectionPool.incr()
Function: incr

Execute a redis INCR command

Parameters:

  key   - (string) - A key whose value you wish to increment
  cb   - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
<a name="RedisConnectionPool+send_command"></a>

### redisConnectionPool.send_command()
Function: send_command

Sends an explicit command to the redis server. Helpful for new commands in redis
  that aren't supported yet by this JS API.

Parameters:

  command_name  - (string) - The redis command to execute
  args          - (array) - The arguments to the redis command
  cb            - (function) - Callback to be executed on completion

**Kind**: instance method of [<code>RedisConnectionPool</code>](#RedisConnectionPool)  
