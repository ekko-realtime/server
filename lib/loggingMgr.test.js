const tap = require('tap');
const LoggingMgr = require('./loggingMgr');

const socket = {
  uuid: 'a56a3c78-6c5f-4954-b0e4-964268fd3fb7',
  admin: 'socket-admin',
  appName: 'notes',
}

tap.test('logEvent generates a payoad and calls sendStatus', async t => {
  const params = { socket, eventName: 'tada-event' };
  const wanted = {
    uuid: 'a56a3c78-6c5f-4954-b0e4-964268fd3fb7',
    admin: 'socket-admin',
    app: 'notes',
    event: 'tada-event',
  };
  
  const sendStatusMock = payload => t.same(payload, wanted);

  const manager = new LoggingMgr({});
  manager.sendStatus = sendStatusMock;
  manager.logEvent(params);
});

tap.test('generateEventPayload returns formatted payload', async t => {
  const manager = new LoggingMgr({});
  const wanted = {
    uuid: 'a56a3c78-6c5f-4954-b0e4-964268fd3fb7',
    admin: 'socket-admin',
    app: 'notes',
    event: 'tada-event',
  };

  const found = manager.generateEventPayload({ socket, eventName: 'tada-event' });

  t.same(found, wanted);
});

tap.test('sendStatus makes calls on socketio client', async t => {
  const payload = { big: 'payload', app: 'notes' };
  const socketMock = {
    of(app) {
      t.same(app, 'notes');
      return {
        to(name) {
          t.same(name, 'admin')
          return {
            emit(status, payloadArg) {
              t.same(status, 'status');
              t.same(payloadArg, payload);
            }
          }
        }
      }
    }
  };

  const manager = new LoggingMgr({ io: socketMock });
  manager.sendStatus(payload);
});

tap.test('sendPresenceEvents makes calls on socketio client', async t => {
  const logEventMock = ({ socket }) => {
    t.same(socket, {
      appName: 'notes',
      uuid: 'a56a3c78-6c5f-4954-b0e4-964268fd3fb7'
    });
  };
  const socketMockAnother = {
    of(app) {
      t.same(app, 'notes');
      return {
        to(name) {
          t.same(name, '321');
          return {
            emit(status, payloadArg) {
              t.same(status, 'presence');
              t.same(payloadArg, {
                eventName: "big-event",
                channel: "123",
                presenceChannel: "321",
                uuid: "a56a3c78-6c5f-4954-b0e4-964268fd3fb7",
              });
            }
          }
        }
      }
    }
  };

  const manager = new LoggingMgr({ io: socketMockAnother });
  manager.logEvent = logEventMock;

  manager.sendPresenceEvents({
    eventName: 'big-event',
    socket: {
      appName: 'notes',
      uuid: 'a56a3c78-6c5f-4954-b0e4-964268fd3fb7'
    },
    channel: '123',
    presenceChannel: '321'
  });
});