<a name="redisConnectionPoolFactory"></a>

## redisConnectionPoolFactory()
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
<pre><code>  cfg.max_clients - (number) - Max clients alive in the connection pool at
                           once. (default: 30)

  cfg.perform_checks - (boolean) - Perform a series of redis checks,
                               currently this checks to to see if
                               blocking push/pops can be used.
                               (default: false)
</code></pre>
<p>redisConfig - (object) - A redis config object</p>
<p>Returns:</p>
<p>A RedisConnectionPool object</p>

**Kind**: global function  
