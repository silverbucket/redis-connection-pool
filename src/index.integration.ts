import { expect } from 'chai';
import redisConnectionPoolFactory, {RedisConnectionPool} from './index';

const channel = 'redis-connection-pool-tests:';
const uid = 'redisPoolTest1';

describe('Redis Pool', () => {
  let pool: RedisConnectionPool;
  beforeEach(async () => {
    pool = await redisConnectionPoolFactory(uid,
      {
        redis: {
          url: 'redis://localhost:6379'
        }
      });
  });

  afterEach(async () => {
    const keys = await pool.keys(`${channel}*`);
    for (const key of keys) {
      await pool.del(`${key}`);
    }
  });

  it('can connect to database', () => {
    expect(typeof pool).to.eql('object');
    expect(pool.redis.url).to.eql('redis://localhost:6379');
  });

  it('basic store and fetch', async () => {
    expect(await pool.set(channel, 'a value')).to.eql('OK');
    expect(await pool.get(channel)).to.equal('a value');
  });

  it('hset and hget', async () => {
    expect(await pool.hset(channel, 'a name', 'a value')).to.eql(1);
    expect(await pool.hget(channel, 'a name')).to.equal('a value');
  });

  it('hgetall', async () => {
    expect(await pool.hset(channel, 'a name', 'a value')).to.eql(1);
    expect(await pool.hset(channel, 'b name', 'b value')).to.eql(1);
    expect(await pool.hset(channel, 'c name', 'c value')).to.eql(1);
    expect(await pool.hset(channel, 'd name', 'd value')).to.eql(1);
    expect(await pool.hset(channel, 'e name', 'e value')).to.eql(1);

    expect(await pool.hgetall(channel)).to.eql({
      'a name': 'a value',
      'b name': 'b value',
      'c name': 'c value',
      'd name': 'd value',
      'e name': 'e value'
    });
  });

  it('push and pop ', async () => {
    expect(await pool.rpush(channel, 'foo1')).to.eql(1);
    expect(await pool.rpush(channel, 'foo2')).to.eql(2);
    expect(await pool.rpush(channel, 'foo3')).to.eql(3);
    expect(await pool.lpush(channel, 'foo4')).to.eql(4);
    expect(await pool.lpush(channel, 'foo5')).to.eql(5);

    expect(await pool.brpop(channel)).to.eql({
      key: channel,
      element: 'foo3'
    });

    expect(await pool.blpop(channel)).to.eql({
      key: channel,
      element: 'foo5'
    });
  });

  it('incr', async () => {
    expect(await pool.set(channel, 1)).to.eql('OK');
    expect(await pool.incr(channel)).to.eql(2);
    expect(await pool.incr(channel)).to.eql(3);
    expect(await pool.get(channel)).to.eql('3');
  });
});

describe("Shutdown", () => {
  it('', async () => {
    const pool = await redisConnectionPoolFactory(uid);
    await pool.shutdown();
  });
});
