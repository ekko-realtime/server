const tap = require('tap');
const AssociationsMgr = require('./associationsMgr');

const s3Data = `{
  "applications": {
    "notes": {
      "channels": [
        { "channelName": "big-channel", "functionNames": ["reverse", "sanitize"] }
      ]
    }
  }
}`;

const s3Mock = {
  getObject() {
    return {
      async promise() {
        return { Body: s3Data }
      }
    }
  }
};

tap.test('loadData updates data property with value from S3', async t => {
  const s3 = {
    getObject() {
      return {
        async promise() {
          return { Body: '{ "applications": { "maps": {} } }' };
        }
      }
    }
  };
  const manager = new AssociationsMgr({ s3 })
  await manager.loadData();

  t.same(manager.data, { maps: {} });
});

tap.test('loadData sets data property to undefined when parsing results in error', async t => {
  const s3 = {
    getObject() {
      return {
        async promise() {
          return { Body: 'oops' };
        }
      }
    }
  };
  const manager = new AssociationsMgr({ s3 })
  await manager.updateData(s3Data);
  await manager.loadData();

  t.same(manager.data, undefined);
});

tap.test('updateData sets data property', async t => {
  const manager = new AssociationsMgr({ s3: s3Mock })
  manager.updateData('{ "applications": { "simple": "test" } }');

  t.same(manager.data, { simple: "test" });
});

tap.test('handleUpdateAssociations sets data property', async t => {
  const manager = new AssociationsMgr({ s3: s3Mock })
  manager.handleUpdateAssociations('{ "applications": { "simple": "test" } }');

  t.same(manager.data, { simple: "test" });
});

tap.test('getData returns the value of the data property', async t => {
  const manager = new AssociationsMgr({ s3: s3Mock })
  manager.updateData('{ "applications": { "simple": "test" } }');
  const result = manager.getData();

  t.same(result, { simple: "test" });
});

tap.test('getChannelData returns undefined when application not found', async t => {
  const manager = new AssociationsMgr({ s3: s3Mock })
  manager.updateData(s3Data);
  const result = manager.getChannelData('stocks');

  t.same(result, undefined);
});

tap.test('getChannelData returns channel when found', async t => {
  const manager = new AssociationsMgr({ s3: s3Mock });
  manager.updateData(s3Data);
  const result = manager.getChannelData('notes', 'big-channel');

  t.same(result, { "channelName": "big-channel", "functionNames": ["reverse", "sanitize"] });
});

tap.test('getFunctionsByChannel returns undefined when application not found', async t => {
  const manager = new AssociationsMgr({ s3: s3Mock })
  manager.updateData(s3Data);
  const result = manager.getFunctionsByChannel('stocks', 'big-channel');

  t.same(result, undefined);
});

tap.test('getFunctionsByChannel returns function names when found', async t => {
  const manager = new AssociationsMgr({ s3: s3Mock });
  manager.updateData(s3Data);
  const functions = manager.getFunctionsByChannel('notes', 'big-channel');

  t.same(functions, ["reverse", "sanitize"]);
});
