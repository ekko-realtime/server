const tap = require('tap');
const LambdaMgr = require('./lambdaMgr');
const lambdaMock = { invoke() { return { async promise() {} } } };

tap.test('getMatchingLambdas returns undefined if no app provided', async t => {
  const manager = new LambdaMgr({ lambda: lambdaMock });
  const result = manager.getMatchingLambdas();

  t.same(undefined, result);
});

tap.test('getMatchingLambdas calls associations manager for list of functions', async t => {
  const associationsMgr = {
    getFunctionsByChannel(app, channel) {
      t.same(app, 'maps');
      t.same(channel, 'drivers');

      return ['geocode', 'lat-long']
    }
  };
  const manager = new LambdaMgr({ associationsMgr, lambda: lambdaMock });
  const result = manager.getMatchingLambdas('maps', 'drivers');

  t.same(result, ['geocode', 'lat-long']);
});

tap.test('processMessage calls a list of lambdas', async t => {
  const lambdas = ['geocode', 'lat-long', 'driver-frenzy'];
  let callCount = 0;
  const callLambdaMock = ({ message, currentLambda }) => {
    callCount += 1;
    t.ok(lambdas.includes(currentLambda));
    t.same(message, 'Hello, world!');
    return message;
  };

  const manager = new LambdaMgr({});
  manager.callLambda = callLambdaMock;
  await manager.processMessage({ message: 'Hello, world!', lambdas });

  t.equal(callCount, 3);
});

tap.test('callLambda calls provided lambda with payload and returns result', async t => {
  const message = { data: 123 };
  const lambda = {
    invoke(params) {
      t.same(params, {
        FunctionName: 'geocode',
        Payload: '{"data":123}',
      })
      return {
        async promise() {
          return { Payload: '{"success":true}' };
        }
      }
    }
  }
  const manager = new LambdaMgr({ lambda });
  const got = await manager.callLambda({ message, currentLambda: 'geocode' });

  t.same({ success: true }, got);
});


tap.test('callLambda returns undefined when failing to parse response', async t => {
  const message = { data: 123 };
  const lambda = {
    invoke() { return { async promise() { return { Payload: '' }; } } }
  };
  const manager = new LambdaMgr({ lambda });
  const got = await manager.callLambda({ message, currentLambda: 'geocode' });

  t.same(undefined, got);
});