/**
 *  ______   __   __   ______  __   ______  __  __
 * /\  ___\ /\ "-.\ \ /\__  _\/\ \ /\__  _\/\ \_\ \
 * \ \  __\ \ \ \-.  \\/_/\ \/\ \ \\/_/\ \/\ \____ \
 *  \ \_____\\ \_\\"\_\  \ \_\ \ \_\  \ \_\ \/\_____\
 *   \/_____/ \/_/ \/_/   \/_/  \/_/   \/_/  \/_____/
 *                                         __   ______
 *                                        /\ \ /\  ___\
 *                                       _\_\ \\ \___  \
 *                                      /\_____\\/\_____\
 *                                      \/_____/ \/_____/
 */

var async = require('async'),
    test = require('unit.js');

describe('ejs/entities', function () {

  'use strict';

  /* eslint max-statements:0 */

  var databases = require('ejs-databases'),
      Entities,
      Entity = require('../lib/entity'),
      EAlreadyRegistered = require('../lib/errors/EAlreadyRegistered'),
      EUndefinedEntityType = require('../lib/errors/EUndefinedEntityType'),
      EUndefinedPlugin = require('../lib/errors/EUndefinedPlugin');

  beforeEach(function () {

    databases.connect('test', {
      name: 'entityCMSTest'
    });

    Entities = require('../lib');

  });

  afterEach(function (done) {

    var queue = [],
        name = require.resolve('../lib');

    delete require.cache[name];

    queue.push(function (next) {
      databases.collection('entities_test').drop(function () {
        next();
      });
    });

    queue.push(function (next) {
      databases.collection('entity_schemas').drop(function () {
        next();
      });
    });

    queue.push(function (next) {
      databases.collection('waste').drop(function () {
        next();
      });
    });

    queue.push(function (next) {
      databases.disconnect();
      next();
    });

    async.series(queue, done);

  });

  describe('Entities.register()', function () {

    it('shouldRegisterAnEntitySchema', function (done) {

      Entities.register(function (err) {

        test.value(err).isNull();

        done();

      }, 'test', {});

    });

    it('shouldThrowErrorIfAlreadyRegistered', function (done) {

      var queue = [];

      queue.push(function (next) {
        Entities.register(next, 'test', {});
      });

      queue.push(function (next) {
        Entities.register(function (err) {

          test.object(err).isInstanceOf(EAlreadyRegistered);

          next();

        }, 'test', {});
      });

      async.series(queue, done);

    });

  });

  describe('Entities.registered()', function () {

    it('shouldReturnFalseIfNotyestRegistered', function (done) {

      Entities.registered(function (err, registered) {

        test.value(err).isNull();
        test.bool(
          registered
        ).isNotTrue();

        done();

      }, 'test');

    });

    it('shouldReturnTrueIfRegistered', function (done) {

      var queue = [];

      queue.push(function (next) {
        Entities.register(next, 'test', {});
      });

      queue.push(function (next) {
        Entities.registered(function (err, registered) {

          test.value(err).isNull();
          test.bool(
            registered
          ).isTrue();

          next();

        }, 'test');
      });

      async.series(queue, done);

    });

  });

  describe('Entities.unregister()', function () {

    it('shouldRemoveTheTypeEntry', function (done) {

      var queue = [];

      queue.push(function (next) {
        Entities.register(next, 'test', {});
      });

      queue.push(function (next) {
        Entities.unregister(next, 'test');
      });

      queue.push(function (next) {
        Entities.registered(function (err, registered) {

          if (err) {
            return next(err);
          }

          test.bool(registered).isNotTrue();

          next();

        }, 'test');
      });

      async.series(queue, done);

    });

  });

  describe('Entities.registerPlugin()', function () {

    it('shouldRegisterPlugin', function () {

      var plg = function () {};

      Entities.registerPlugin('test', 'Test', 'A test plugin.', plg);

      test.object(
        Entities.plugins()
      ).is({
        'test': {
          title: 'Test',
          description: 'A test plugin.',
          callback: plg
        }
      });

    });

  });

  describe('Entities.registeredPlugin()', function () {

    it('shouldReturnFalseIfUndefined', function () {

      test.bool(
        Entities.registeredPlugin('test')
      ).isNotTrue();

    });

    it('shouldReturnTrue', function () {

      var plg = function () {};

      Entities.registerPlugin('test', 'Test', 'A test plugin.', plg);

      test.bool(
        Entities.registeredPlugin('test')
      ).isTrue();

    });

  });

  describe('Entities.unregisterPlugin()', function () {

    it('shouldThrowAnErrorIfUndefined', function () {

      test.exception(function () {
        Entities.unregisterPlugin('test');
      }).isInstanceOf(EUndefinedPlugin);

    });

    it('shouldUnregisterPlugin', function () {

      var plg = function () {};

      Entities.registerPlugin('test', 'Test', 'A test plugin.', plg);
      Entities.unregisterPlugin('test');

      test.object(
        Entities.plugins()
      ).is({});

    });

  });

  describe('Entities.plugin()', function () {

    it('shouldThrowAnErrorIfUndefined', function () {

      test.exception(function () {
        Entities.plugin('test');
      }).isInstanceOf(EUndefinedPlugin);

    });

    it('shouldReturnTheCallbackMethod', function () {

      var plg = function () {};

      Entities.registerPlugin('test', 'Test', 'A test plugin.', plg);

      test.function(
        Entities.plugin('test')
      ).is(plg);

    });

  });

  describe('Entities.plugins()', function () {

    it('shouldReturnAnEmptyObject', function () {

      test.object(
        Entities.plugins()
      ).is({});

    });

    it('shouldReturnRegisteredPlugins', function () {

      var plg = function () {};

      Entities.registerPlugin('test', 'Test', 'A test plugin.', plg);

      test.object(
        Entities.plugins()
      ).is({
        'test': {
          title: 'Test',
          description: 'A test plugin.',
          callback: plg
        }
      });

    });

  });

  describe('Entities.create()', function () {

    it('shouldThrowAnErrorIfNotRegistered', function (done) {

      Entities.create(function (err, entity) {

        test.object(
          err
        ).isInstanceOf(EUndefinedEntityType);

        test.value(
          entity
        ).isNull();

        done();

      }, 'test');

    });

    it('shouldCreateAndInitializeEntity', function (done) {

      var queue = [];

      queue.push(function (next) {
        Entities.register(next, 'test', {});
      });

      queue.push(function (next) {

        Entities.create(function (err2, entity) {

          test.value(
            err2
          ).isNull();

          test.value(
            entity
          ).isInstanceOf(Entity);

          next();

        }, 'test');

      });

      async.series(queue, done);

    });

  });

  describe('Entities.load()', function () {

    it('shouldThrowAnErrorIfNotRegistered', function (done) {

      Entities.load(function (err, entity) {

        test.object(
          err
        ).isInstanceOf(EUndefinedEntityType);

        test.value(
          entity
        ).isNull();

        done();

      }, 'test', 'test');

    });

    it('shouldLoadAndInitializeEntity', function (done) {

      var queue = [];

      queue.push(function (next) {
        Entities.register(next, 'test', {});
      });

      queue.push(function (next) {

        Entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.set(function (err2) {

            if (err2) {
              return next(err2);
            }

            entity.save(next);

          }, 'name', 'test');

        }, 'test');

      });

      queue.push(function (next) {

        Entities.load(function (err, entity) {

          if (err) {
            return next(err);
          }

          test.value(
            entity
          ).isInstanceOf(Entity);

          test.value(
            entity.get('name')
          ).is('test');

          next();

        }, 'test', 'test');

      });

      async.series(queue, done);

    });

  });

  describe('Entities.exists()', function () {

    it('shouldThrowAnErrorIfNotRegistered', function (done) {

      Entities.exists(function (err, entity) {

        test.object(
          err
        ).isInstanceOf(EUndefinedEntityType);

        test.value(
          entity
        ).isNull();

        done();

      }, 'test', 'test');

    });

    it('shouldReturnFalseIfNotExists', function (done) {

      var queue = [];

      queue.push(function (next) {
        Entities.register(next, 'test', {});
      });

      queue.push(function (next) {

        Entities.exists(function (err, exists) {

          if (err) {
            return next(err);
          }

          test.bool(
            exists
          ).isNotTrue();

          next();

        }, 'test', 'test');

      });

      async.series(queue, done);

    });

    it('shouldReturnTrueIfExists', function (done) {

      var queue = [];

      queue.push(function (next) {
        Entities.register(next, 'test', {});
      });

      queue.push(function (next) {

        Entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.set(function (err2) {

            if (err2) {
              return next(err2);
            }

            entity.save(next);

          }, 'name', 'test');

        }, 'test');

      });

      queue.push(function (next) {

        Entities.exists(function (err, exists) {

          if (err) {
            return next(err);
          }

          test.bool(
            exists
          ).isTrue();

          next();

        }, 'test', 'test');

      });

      async.series(queue, done);

    });

  });

});
