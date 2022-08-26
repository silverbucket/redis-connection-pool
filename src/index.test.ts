import { expect } from 'chai';
//@ts-ignore
import proxyquire from 'proxyquire';
import * as sinon from 'sinon';

const clientFake = {
  BLPOP: sinon.stub(),
  BRPOP: sinon.stub(),
  LPUSH: sinon.stub(),
  RPUSH: sinon.stub(),
  HGETALL: sinon.stub(),
  HGET: sinon.stub(),
  HSET: sinon.stub(),
  HDEL: sinon.stub(),
  GET: sinon.stub(),
  SET: sinon.stub(),
  DEL: sinon.stub(),
  connect: sinon.stub(),
  quit: sinon.stub(),
  keys: sinon.stub()
}

function createPoolFake(factory, opts) {
  return {
    init: sinon.stub(),
    acquire: async () => {
      return clientFake;
    },
    release: async () => {},
    drain: sinon.stub(),
    clear: sinon.stub()
  }
}

const NRCPMod = proxyquire('./index', {
  'generic-pool': {
    createPool: createPoolFake
  },
  'redis': {
    createClient: () => clientFake
  }
});
const RedisConnectionPool = NRCPMod.RedisConnectionPool;
const redisConnectionPoolFactory = NRCPMod.default;

describe('redisConnectionPoolFactory', () => {
  let pool;

  beforeEach(async () => {
    pool = await redisConnectionPoolFactory('foo', {
      max_clients: 99,
      redis: {
        host: 'some host',
        port: 876
      }
    });
    expect(pool.max_clients).to.equal(99);
    for (const key of Object.keys(clientFake)) {
      clientFake[key].reset();
    }
  })

  it('returns a pool', () => {
    expect(pool instanceof RedisConnectionPool).to.equal(true);
    expect(typeof pool.init).to.equal('function');
  });

  it('can initialize pool', () => {
    pool.init();
    expect(typeof pool.pool).to.equal('object');
  });

  it('set', async () => {
    await pool.set('some key', 'a value');
    sinon.assert.calledWith(clientFake.SET, 'some key', 'a value')
  });

  it('get', async () => {
    clientFake.GET.returns('test');
    const res = await pool.get('some key');
    sinon.assert.calledWith(clientFake.GET, 'some key');
    sinon.assert.calledOnce(clientFake.GET);
    expect(res).to.equal('test');
  });

  it('hset', async () => {
    await pool.hset('identifier', 'a key', 'a value');
    await pool.hset('identifier', 'foo', 'bar');
    await pool.hset('identifier', 'grad', 'darg');
    sinon.assert.calledThrice(clientFake.HSET);
    sinon.assert.calledWith(clientFake.HSET, 'identifier', 'a key', 'a value');
    sinon.assert.calledWith(clientFake.HSET, 'identifier', 'foo', 'bar');
    sinon.assert.calledWith(clientFake.HSET, 'identifier', 'grad', 'darg');
  });

  it('hget', async () => {
    clientFake.HGET.returns('bar');
    expect(await pool.hget('identifier', 'foo')).to.equal('bar');
    sinon.assert.calledWith(clientFake.HGET, 'identifier', 'foo');
    sinon.assert.calledOnce(clientFake.HGET);
  });

  it('hgetall', async () => {
    clientFake.HGETALL.returns('yarg')
    expect(await pool.hgetall('identifier')).to.eql('yarg');
    sinon.assert.calledOnce(clientFake.HGETALL);
  });

  it('hdel', async () => {
    clientFake.HDEL.returns(1);
    expect(await pool.hdel('identifier', ['identifier 2'])).to.eql(1);
    sinon.assert.calledOnce(clientFake.HDEL);
    sinon.assert.calledWith(clientFake.HDEL, 'identifier', 'identifier 2')
  });

  it('rpush', async () => {
    await pool.rpush('identifier', 'a value');
    await pool.rpush('identifier', 'foo');
    await pool.rpush('identifier', 'darg');
    sinon.assert.calledThrice(clientFake.RPUSH);
    sinon.assert.calledWith(clientFake.RPUSH, 'identifier', 'a value');
    sinon.assert.calledWith(clientFake.RPUSH, 'identifier', 'foo');
    sinon.assert.calledWith(clientFake.RPUSH, 'identifier', 'darg');
  })

  it('lpush', async () => {
    await pool.lpush('identifier', 'margen');
    await pool.lpush('different identifier', 'janicme');
    sinon.assert.calledTwice(clientFake.LPUSH);
    sinon.assert.calledWith(clientFake.LPUSH, 'identifier', 'margen');
    sinon.assert.calledWith(clientFake.LPUSH, 'different identifier', 'janicme');
  });

  it('brpop', async () => {
    clientFake.BRPOP.returns('yo');
    expect(await pool.brpop('identifier')).to.equal('yo');
    clientFake.BRPOP.returns('lo');
    expect(await pool.brpop('identifier')).to.equal('lo');
    sinon.assert.calledTwice(clientFake.BRPOP);
  });

  it('blpop', async () => {
    clientFake.BLPOP.returns('yarg');
    expect(await pool.blpop('identifier')).to.equal('yarg');
    clientFake.BLPOP.returns('gray');
    expect(await pool.blpop('identifier')).to.equal('gray');
    sinon.assert.calledTwice(clientFake.BLPOP);
  });

  it('del', async () => {
    await pool.del('hummus');
    sinon.assert.calledOnce(clientFake.DEL);
    sinon.assert.calledWith(clientFake.DEL, 'hummus');
  });

  it('shutdown', async () => {
    await pool.shutdown();
  });
});
