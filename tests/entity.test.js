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
    test = require('unit.js'),
    Entity = require('../lib/entity'),
    types = require('../lib/types'),
    EUnknownField = require('../lib/errors/EUnknownField'),
    EInvalidType = require('../lib/errors/EInvalidType'),
    ERequiredField = require('../lib/errors/ERequiredField'),
    ENoFields = require('../lib/errors/ENoFields'),
    EEntityNotFound = require('../lib/errors/EEntityNotFound'),
    EUndefinedName = require('../lib/errors/EUndefinedName'),
    ECantSaveTrashed = require('../lib/errors/ECantSaveTrashed'),
    ECantTrashTrashed = require('../lib/errors/ECantTrashTrashed'),
    EEntityNotTrashed = require('../lib/errors/EEntityNotTrashed'),
    EMissingID = require('../lib/errors/EMissingID'),
    EUndefinedBundle = require('../lib/errors/EUndefinedBundle');

var databases;

describe('ejs/entities/entity', function () {

  'use strict';

  /*eslint max-statements:0*/
  /*jshint maxstatements:false*/

  beforeEach(function () {

    databases = require('ejs-databases');
    databases.connect('test', {
      name: 'entityCMSTest'
    });

  });

  afterEach(function (done) {

    var queue = [];

    delete require.cache[require.resolve('ejs-databases')];

    queue.push(function (next) {
      databases.collection('entities_test').drop(function () {
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

  describe('Entity.construct()', function () {

    it('shouldSetTheTypeValue', function () {

      var entity = new Entity('type', {});

      test.value(entity._type).is('type');

    });

  });

  describe('Entity.initialize()', function () {

    it('shouldFireInitEvent', function (done) {

      var exec = false,
          onInit = function (dne) {
            exec = true;
            dne();
          },
          entity = new Entity('type', {
            on: {
              init: [onInit]
            }
          });

      entity.initialize(function (err) {

        test.value(err).isNull();
        test.bool(exec).isTrue();

        done();

      });

    });

    it('shouldAddPluginAdditions', function (done) {

      var testPluginFn = function () {},
          TestPlugin = function (dne, ety) {
            ety.testPlugin = testPluginFn;
            ety._schema.fields.testPluginField = {
              type: types.FIELD_TYPE_STRING
            };

            dne();
          },
          entity = new Entity('type', {
            plugins: [
              TestPlugin
            ]
          });

      entity.initialize(function (err) {

        test.value(err).isNull();
        test.function(entity.testPlugin).is(testPluginFn);
        test.object(entity._schema.fields).hasProperty('testPluginField');

        done();

      });

    });

  });

  describe('Entity.validateField()', function () {

    it('shouldThrowAnExceptionIfFieldIsUndefined', function (done) {

      var entity = new Entity('test', {});

      entity.validateField(function (err) {

        test.object(err).isInstanceOf(EUnknownField);

        done();

      }, 'test', true);

    });

    it('shouldThrowAnExceptionIfValidationFailsFromType', function (done) {

      var entity = new Entity('test', {
            fields: {
              test: {type: types.FIELD_TYPE_STRING}
            }
          });

      entity.validateField(function (err) {

        test.object(
          err
        ).isInstanceOf(EInvalidType);

        done();

      }, 'test', true);

    });

    it('shouldThrowAnExceptionIfTheFieldIsRequiredNull', function (done) {

      var entity = new Entity('test', {
            fields: {
              test: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.validateField(function (err) {

        test.object(
          err
        ).isInstanceOf(ERequiredField);

        done();

      }, 'test', null);

    });

    it('shouldThrowAnExceptionIfTheFieldIsRequiredUndefined', function (done) {

      var entity = new Entity('test', {
            fields: {
              test: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.validateField(function (err) {

        test.object(
          err
        ).isInstanceOf(ERequiredField);

        entity.validateField(function (err2) {

          test.object(
            err2
          ).isInstanceOf(ERequiredField);

          done();

        }, 'test', undefined);

      }, 'test');

    });

    it('shouldValidateAndReturnTrue', function (done) {

      var entity = new Entity('test', {
            fields: {
              test: {type: types.FIELD_TYPE_STRING}
            }
          });

      entity.validateField(function (err) {

        test.value(
          err
        ).isNull();

        done();

      }, 'test', 'hello');

    });

  });

  describe('Entity.get()', function () {

    it('shouldThrowErrorIfTheFieldDoesntExist', function () {

      var entity = new Entity('test', {});

      test.exception(function () {

        entity.get('test');

      }).isInstanceOf(EUnknownField);

    });

    it('shouldReturnNullIfNotDefined', function () {

      var entity = new Entity('test', {
            fields: {
              test: {type: types.FIELD_TYPE_STRING}
            }
          });

      test.value(
        entity.get('test')
      ).isNull();

    });

    it('shouldReturnTheDefaultValueIfNotDefined', function () {

      var entity = new Entity('test', {
            fields: {
              test: {type: types.FIELD_TYPE_STRING, 'default': 'test'}
            }
          });

      test.value(
        entity.get('test')
      ).is('test');

    });

    it('shouldReturnTheValue', function () {

      var entity = new Entity('test', {
            fields: {
              test: {type: types.FIELD_TYPE_STRING, 'default': 'test'}
            }
          });

      entity._raw.test = 'foo bar';

      test.value(
        entity.get('test')
      ).is('foo bar');

    });

  });

  describe('Entity.set()', function () {

    it('shouldThrowErrorIfTheFieldDoesntExist', function (done) {

      var entity = new Entity('test', {});

      entity.set(function (err) {

        test.value(err).isInstanceOf(EUnknownField);

        done();

      }, 'test', 'foo bar');

    });

    it('shouldSetTheDataFieldValue', function (done) {

      var entity = new Entity('test', {
            fields: {
              test: {type: types.FIELD_TYPE_STRING}
            }
          });

      entity.set(function (err) {

        test.value(err).isNull();
        test.value(
          entity._raw.test
        ).is('foo bar');

        done();

      }, 'test', 'foo bar');

    });

    it('shouldSetMultipleDataFieldValues', function (done) {

      var entity = new Entity('test', {
            fields: {
              test: {type: types.FIELD_TYPE_STRING},
              test2: {type: types.FIELD_TYPE_STRING},
              test3: {type: types.FIELD_TYPE_STRING},
              test4: {type: types.FIELD_TYPE_STRING}
            }
          });

      entity.set(function (err) {

        test.value(err).isNull();

        test.value(
          entity._raw
        ).is({
          test: 'foo bar',
          test2: 'hello world',
          test4: 'hello'
        });

        done();

      }, {
        test: 'foo bar',
        test2: 'hello world',
        test4: 'hello'
      });

    });

  });

  describe('Entity.has()', function () {

    it('shouldReturnFalseIfTheFieldHasntBeenDefined', function () {

      var entity = new Entity('test', {});

      test.bool(
        entity.has('test')
      ).isNotTrue();

    });

    it('shouldReturnFalseIfTheFieldHasntBeenDefinedButDataIs', function () {

      var entity = new Entity('test', {});
      entity._raw.test = 'hello';

      test.bool(
        entity.has('test')
      ).isNotTrue();

    });

    it('shouldReturnFalseIfTheFieldHasBeenDefinedButNoData', function () {

      var entity = new Entity('test', {
            fields: {
              test: {type: types.FIELD_TYPE_STRING}
            }
           });

      test.bool(
        entity.has('test')
      ).isNotTrue();

    });

    it('shouldReturnTrueIfTheFieldAndDataHasBeenDefined', function () {

      var entity = new Entity('test', {
            fields: {
              test: {type: types.FIELD_TYPE_STRING}
            }
           });

      entity._raw.test = 'hello';

      test.bool(
        entity.has('test')
      ).isTrue();

    });

    it('shouldThrowTrueIfTheFieldAndDefaultHasBeenDefined', function () {

      var entity = new Entity('test', {
            fields: {
              test: {type: types.FIELD_TYPE_STRING, default: 'hello'}
            }
           });

      test.bool(
        entity.has('test')
      ).isTrue();

    });

  });

  describe('Entity.setBundle()', function () {

    it('unknownEntityBundleShouldThrowAnError', function () {

      var entity = new Entity('type', {});

      test.exception(function () {
        entity.setBundle('bundle');
      }).isInstanceOf(EUndefinedBundle);

    });

  });

  describe('Entity.getBundle()', function () {

    it('shouldReturnNullIfUndefined', function () {

      var entity = new Entity('type', {});

      test.value(
        entity.getBundle()
      ).isNull();

    });

    it('shouldGetTheSetBundleName', function () {

      var entity = new Entity('type', {});
      entity._bundle = 'bundle';

      test.value(
        entity.getBundle()
      ).is('bundle');

    });

  });

  describe('Entity.getFields()', function () {

    it('shouldReturnStandardFieldsIfNoFieldsNorBundle', function () {

      var entity = new Entity('type', {});
      test.object(entity.getFields()).is({
        bundle: {'default': '', type: types.FIELD_TYPE_STRING},
        name: {
          required: true,
          type: types.FIELD_TYPE_STRING,
          validate: ['machine-name']
        }
      });

    });

    it('shouldReturnFields', function () {

      var entity = new Entity('type', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
           });

      test.object(entity.getFields()).is({
        bundle: {'default': '', type: types.FIELD_TYPE_STRING},
        name: {
          required: true,
          type: types.FIELD_TYPE_STRING,
          validate: ['machine-name']
        },
        test1: {type: types.FIELD_TYPE_STRING, required: true},
        test2: {type: types.FIELD_TYPE_STRING, required: true},
        test3: {type: types.FIELD_TYPE_STRING, required: true}
      });

    });

    it('shouldReturnFieldsAndBundleFields', function () {

      var entity = new Entity('type', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            },
            bundles: {
              bundle: {
                test4: {type: types.FIELD_TYPE_STRING, required: true}
              }
            }
           });

      entity._bundle = 'bundle';
      test.object(entity.getFields()).is({
        bundle: {'default': '', type: types.FIELD_TYPE_STRING},
        name: {
          required: true,
          type: types.FIELD_TYPE_STRING,
          validate: ['machine-name']
        },
        test1: {type: types.FIELD_TYPE_STRING, required: true},
        test2: {type: types.FIELD_TYPE_STRING, required: true},
        test3: {type: types.FIELD_TYPE_STRING, required: true},
        test4: {type: types.FIELD_TYPE_STRING, required: true}
      });

    });

    it('bundleFieldsShouldOverwriteFields', function () {

      var entity = new Entity('type', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            },
            bundles: {
              bundle: {
                test2: {type: types.FIELD_TYPE_BOOLEAN, required: false},
                test4: {type: types.FIELD_TYPE_STRING, required: true}
              }
            }
           });

      entity._bundle = 'bundle';
      test.object(entity.getFields()).is({
        bundle: {'default': '', type: types.FIELD_TYPE_STRING},
        name: {
          required: true,
          type: types.FIELD_TYPE_STRING,
          validate: ['machine-name']
        },
        test1: {type: types.FIELD_TYPE_STRING, required: true},
        test2: {type: types.FIELD_TYPE_BOOLEAN, required: false},
        test3: {type: types.FIELD_TYPE_STRING, required: true},
        test4: {type: types.FIELD_TYPE_STRING, required: true}
      });

    });

  });

  describe('Entity.raw()', function () {

    it('shouldReturnDefaultValues', function () {

      var entity = new Entity('test', {
        fields: {
          test: {type: types.FIELD_TYPE_STRING, 'default': 'hello world'}
        }
      });

      test.object(
        entity.raw()
      ).is({
        name: null,
        bundle: null,
        test: 'hello world'
      });

    });

  });

  describe('Entity.validate()', function () {

    it('shouldThrowAnErrorIfNoFields', function (done) {

      var entity = new Entity('test', {});

      delete entity._schema.fields;

      entity.validate(function (err2) {

        test.object(err2).isInstanceOf(ENoFields);

        done();

      });

    });

    it('shouldThrowAnErrorIfAnyFieldFailsValidation', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.set(function (err) {

        test.value(err).isNull();

        entity.validate(function (err2) {

          test.object(err2).isInstanceOf(ERequiredField);

          done();

        });

      }, {
        test1: 'hello',
        test3: 'world'
      });

    });

    it('shouldThrowAnErrorWithMissingName', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.set(function (err) {

        test.value(err).isNull();

        entity.validate(function (err2) {

          test.object(err2).isInstanceOf(ERequiredField);

          done();

        });

      }, {
        test1: 'hello',
        test2: 'foo',
        test3: 'world'
      });

    });

    it('shouldNotThrowAnErrorIfValidates', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.set(function (err) {

        test.value(err).isNull();

        entity.validate(function (err2) {

          test.value(err2).isNull();

          done();

        });

      }, {
        name: 'test',
        test1: 'hello',
        test2: 'foo',
        test3: 'world'
      });

    });

    it('shouldFireValidateEvent', function (done) {

      var exec = false,
          onValidate = function (dne) {
            exec = true;
            dne();
          },
          entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            },
            on: {
              validate: [onValidate]
            }
          });

      entity.set(function (err) {

        test.value(err).isNull();

        entity.validate(function (err2) {

          test.value(err2).isNull();
          test.bool(exec).isTrue();

          done();

        });

      }, {
        name: 'test',
        test1: 'hello',
        test2: 'foo',
        test3: 'world'
      });

    });

  });

  describe('Entity.isNew()', function () {

    it('shouldReturnTrueByDefault', function () {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      test.bool(entity.isNew()).isTrue();

    });

    it('shouldReturnFalse', function () {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity._new = false;
      test.bool(entity.isNew()).isNotTrue();

    });

  });

  describe('Entity.isUpdated()', function () {

    it('shouldReturnFalseByDefault', function () {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      test.bool(entity.isUpdated()).isNotTrue();

    });

    it('shouldReturnTrueWhenFieldModified', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.set(function () {

        test.bool(entity.isUpdated()).isTrue();

        done();

      }, 'test1', 'test');

    });

  });

  describe('Entity.isTrashed()', function () {

    it('shouldReturnFalseByDefault', function () {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      test.bool(entity.isTrashed()).isNotTrue();

    });

    it('shouldReturnTrueWhenFieldModified', function () {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity._trash = true;
      test.bool(entity.isTrashed()).isTrue();

    });

  });

  describe('Entity.load()', function () {

    it('shouldErrorIfDocumentDoesntExist', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.load(function (err) {

        test.value(err).isInstanceOf(EEntityNotFound);

        done();

      }, 'test');

    });

    it('shouldErrorIfNameWasntProvided', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.load(function (err) {

        test.value(err).isInstanceOf(EUndefinedName);

        done();

      });

    });

    it('shouldLoadFromCollectionIfExists', function (done) {

      databases.collection('entities_test').insert({
        name: 'test',
        test1: 'hello',
        test2: 'world',
        test3: 'foo bar'
      }, function (err, doc) {

        if (err) {
          return done(err);
        }

        var entity = new Entity('test', {
              fields: {
                test1: {type: types.FIELD_TYPE_STRING, required: true},
                test2: {type: types.FIELD_TYPE_STRING, required: true},
                test3: {type: types.FIELD_TYPE_STRING, required: true}
              }
            });

        entity.load(function (err2) {

          test.value(err2).isNull();
          test.bool(entity._new).isNotTrue();
          test.string(
            entity._id.toString()
          ).is(doc._id.toString());

          done();

        }, 'test');

      });

    });

    it('shouldLoadFromCollectionIfExistsUsingInternalName', function (done) {

      databases.collection('entities_test').insert({
        name: 'test',
        test1: 'hello',
        test2: 'world',
        test3: 'foo bar'
      }, function (err, doc) {

        if (err) {
          return done(err);
        }

        var entity = new Entity('test', {
              fields: {
                test1: {type: types.FIELD_TYPE_STRING, required: true},
                test2: {type: types.FIELD_TYPE_STRING, required: true},
                test3: {type: types.FIELD_TYPE_STRING, required: true}
              }
            });

        entity._raw.name = 'test';

        entity.load(function (err2) {

          test.value(err2).isNull();
          test.bool(entity._new).isNotTrue();
          test.string(
            entity._id.toString()
          ).is(doc._id.toString());

          done();

        });

      });

    });

    it('shouldLoadFromWasteIfHasBeenTrashed', function (done) {

      databases.collection('waste').insert({
        name: 'test',
        type: 'test',
        data: {
          test1: 'hello',
          test2: 'world',
          test3: 'foo bar'
        }
      }, function (err, doc) {

        if (err) {
          return done(err);
        }

        var entity = new Entity('test', {
              fields: {
                test1: {type: types.FIELD_TYPE_STRING, required: true},
                test2: {type: types.FIELD_TYPE_STRING, required: true},
                test3: {type: types.FIELD_TYPE_STRING, required: true}
              }
            });

        entity.load(function (err2) {

          test.value(err2).isNull();
          test.bool(entity._new).isNotTrue();
          test.bool(entity._trash).isTrue();
          test.string(
            entity.get('test1')
          ).is('hello');

          test.string(
            entity.get('test2')
          ).is('world');

          test.string(
            entity.get('test3')
          ).is('foo bar');

          done();

        }, 'test');

      });

    });

    it('shouldFireTheLoadedEvent', function (done) {

      databases.collection('entities_test').insert({
        name: 'test',
        test1: 'hello',
        test2: 'world',
        test3: 'foo bar'
      }, function (err, doc) {

        if (err) {
          return done(err);
        }

        var exec = false,
            onLoaded = function (dne) {
              exec = true;
              dne();
            },
            entity = new Entity('test', {
              fields: {
                test1: {type: types.FIELD_TYPE_STRING, required: true},
                test2: {type: types.FIELD_TYPE_STRING, required: true},
                test3: {type: types.FIELD_TYPE_STRING, required: true}
              },
              on: {
                loaded: [onLoaded]
              }
            });

        entity.load(function (err2) {

          test.value(err2).isNull();
          test.bool(exec).isTrue();

          done();

        }, 'test');

      });

    });

  });

  describe('Entity.save()', function () {

    it('shouldntSaveIfFailsValidation', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.set(function (err) {

        test.value(err).isNull();

        entity.save(function (err2) {

          test.object(err2).isInstanceOf(ERequiredField);

          databases.collection('entities_test').findOne({
            name: 'test'
          }, function (err3, ety) {

            test.value(err3).isNull();
            test.value(ety).isNull();

            done();

          });

        });

      }, {
        test1: 'hello',
        test2: 'foo',
        test3: 'world'
      });

    });

    it('shouldntSaveIfTrashed', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.set(function (err) {

        test.value(err).isNull();

        entity._trash = true;

        entity.save(function (err2) {

          test.object(err2).isInstanceOf(ECantSaveTrashed);

          databases.collection('entities_test').findOne({
            name: 'test'
          }, function (err3, ety) {

            test.value(err3).isNull();
            test.value(ety).isNull();

            done();

          });

        });

      }, {
        test1: 'hello',
        test2: 'foo',
        test3: 'world'
      });

    });

    it('shouldSaveIfAllIsGood', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.set(function (err) {

        test.value(err).isNull();

        entity.save(function (err2) {

          test.value(err2).isNull();

          databases.collection('entities_test').findOne({
            name: 'test'
          }, function (err3, doc) {

            test.value(err3).isNull();
            test.object(doc)
              .hasProperty('_id')
              .hasProperty('name')
              .hasProperty('test1')
              .hasProperty('test2')
              .hasProperty('test3');

            done();

          });

        });

      }, {
        name: 'test',
        test1: 'hello',
        test2: 'foo',
        test3: 'world'
      });

    });

    it('shouldFireThePreSaveEvent', function (done) {

      databases.collection('entities_test').insert({
        name: 'test',
        test1: 'hello',
        test2: 'world',
        test3: 'foo bar'
      }, function (err, doc) {

        if (err) {
          return done(err);
        }

        var exec = false,
            onPresave = function (dne) {
              exec = true;
              dne();
            },
            entity = new Entity('test', {
              fields: {
                test1: {type: types.FIELD_TYPE_STRING, required: true},
                test2: {type: types.FIELD_TYPE_STRING, required: true},
                test3: {type: types.FIELD_TYPE_STRING, required: true}
              },
              on: {
                presave: [onPresave]
              }
            });

        entity._raw = {
          name: 'test',
          test1: 'hello',
          test2: 'world',
          test3: 'foo bar'
        };

        entity.save(function (err2) {

          test.value(err2).isNull();
          test.bool(exec).isTrue();

          done();

        });

      });

    });

    it('shouldFireTheSavedEvent', function (done) {

      databases.collection('entities_test').insert({
        name: 'test',
        test1: 'hello',
        test2: 'world',
        test3: 'foo bar'
      }, function (err, doc) {

        if (err) {
          return done(err);
        }

        var exec = false,
            onSaved = function (dne) {
              exec = true;
              dne();
            },
            entity = new Entity('test', {
              fields: {
                test1: {type: types.FIELD_TYPE_STRING, required: true},
                test2: {type: types.FIELD_TYPE_STRING, required: true},
                test3: {type: types.FIELD_TYPE_STRING, required: true}
              },
              on: {
                saved: [onSaved]
              }
            });

        entity._raw = {
          name: 'test',
          test1: 'hello',
          test2: 'world',
          test3: 'foo bar'
        };

        entity.save(function (err2) {

          test.value(err2).isNull();
          test.bool(exec).isTrue();

          done();

        });

      });

    });

  });

  describe('Entity.trash()', function () {

    it('shouldThrowErrorIfIsNew', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.trash(function (err) {

        test.object(err).isInstanceOf(EMissingID);
        test.bool(entity._trash).isNotTrue();

        done();

      });

    });

    it('shouldThrowErrorIfIsAlreadyTrashed', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity._id = '----';
      entity._trash = true;
      entity.trash(function (err) {

        test.object(err).isInstanceOf(ECantTrashTrashed);
        test.bool(entity._trash).isTrue();

        done();

      });

    });

    it('shouldMoveEntityToWaste', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      databases.collection('entities_test').insert({
        name: 'test',
        test1: 'hello',
        test2: 'world',
        test3: 'foo bar'
      }, function (err) {

        test.value(err).isNull();

        entity.load(function (err2) {

          test.value(err2).isNull();

          entity.trash(function (err3) {

            test.value(err3).isNull();
            test.bool(entity._trash).isTrue();

            databases.collection('entities_test').findOne({
              name: 'test'
            }, function (err4, doc) {

              test.value(err4).isNull();
              test.value(doc).isNull();

              databases.collection('waste').findOne({
                name: 'test',
                type: 'test'
              }, function (err5, doc2) {

                test.value(err5).isNull();
                test.object(doc2)
                  .hasProperty('_id')
                  .hasProperty('type')
                  .hasProperty('name');

                done();

              });

            });

          });

        }, 'test');

      });

    });

    it('shouldFireTheTrashedEvent', function (done) {

      var exec = false,
          onTrashed = function (dne) {
            exec = true;
            dne();
          },
          entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            },
            on: {
              trashed: [onTrashed]
            }
          });

      databases.collection('entities_test').insert({
        name: 'test',
        test1: 'hello',
        test2: 'world',
        test3: 'foo bar'
      }, function (err) {

        test.value(err).isNull();

        entity.load(function (err2) {

          test.value(err2).isNull();

          entity.trash(function (err3) {

            test.value(err3).isNull();
            test.bool(entity._trash).isTrue();
            test.bool(exec).isTrue();

            databases.collection('entities_test').findOne({
              name: 'test'
            }, function (err4, doc) {

              test.value(err4).isNull();
              test.value(doc).isNull();

              databases.collection('waste').findOne({
                name: 'test',
                type: 'test'
              }, function (err5, doc2) {

                test.value(err5).isNull();
                test.object(doc2)
                  .hasProperty('_id')
                  .hasProperty('type')
                  .hasProperty('name');

                done();

              });

            });

          });

        }, 'test');

      });

    });

  });

  describe('Entity.restore()', function () {

    it('shouldThrowErrorIfNotTrashed', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      entity.restore(function (err) {

        test.object(err).isInstanceOf(EEntityNotTrashed);
        test.bool(entity._trash).isNotTrue();

        done();

      });

    });

    it('shouldRestoreEntityFromWaste', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      databases.collection('entities_test').insert({
        name: 'test',
        test1: 'hello',
        test2: 'world',
        test3: 'foo bar'
      }, function (err) {

        test.value(err).isNull();

        entity.load(function (err2) {

          test.value(err2).isNull();

          entity.trash(function (err3) {

            test.value(err3).isNull();
            test.bool(entity._trash).isTrue();

            entity.restore(function (err4) {

              test.value(err4).isNull();
              test.bool(entity._trash).isNotTrue();

              databases.collection('entities_test').findOne({
                name: 'test'
              }, function (err5, doc) {

                test.value(err5).isNull();
                test.object(doc)
                  .hasProperty('_id')
                  .hasProperty('name')
                  .hasProperty('test1')
                  .hasProperty('test2')
                  .hasProperty('test3');

                databases.collection('waste').findOne({
                  name: 'test',
                  type: 'test'
                }, function (err6, doc2) {

                  test.value(err6).isNull();
                  test.value(doc2).isNull();

                  done();

                });

              });

            });

          });

        }, 'test');

      });

    });

  });

  describe('Entity.delete()', function () {

    it('shouldThrowErrorIfNoID', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      databases.collection('waste').insert({
        name: 'test',
        type: 'test',
        data: {
          test1: 'hello',
          test2: 'world',
          test3: 'foo bar'
        }
      }, function (err, doc) {

        test.value(err).isNull();

        entity.delete(function (err2) {

          test.object(err2).isInstanceOf(EMissingID);

          done();

        });

      });

    });

    it('shouldDeleteFromWaste', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      databases.collection('waste').insert({
        name: 'test',
        type: 'test',
        data: {
          test1: 'hello',
          test2: 'world',
          test3: 'foo bar'
        }
      }, function (err, doc) {

        test.value(err).isNull();

        entity._id = doc._id;

        entity.delete(function (err2) {

          test.value(err2).isNull();

          databases.collection('waste').findOne({
            name: 'test',
            type: 'test'
          }, function (err3, doc2) {

            test.value(err3).isNull();
            test.value(doc2).isNull();

            done();

          });

        });

      });

    });

    it('shouldDeleteFromCollection', function (done) {

      var entity = new Entity('test', {
            fields: {
              test1: {type: types.FIELD_TYPE_STRING, required: true},
              test2: {type: types.FIELD_TYPE_STRING, required: true},
              test3: {type: types.FIELD_TYPE_STRING, required: true}
            }
          });

      databases.collection('entities_test').insert({
        name: 'test',
        test1: 'hello',
        test2: 'world',
        test3: 'foo bar'
      }, function (err, doc) {

        test.value(err).isNull();

        entity._id = doc._id;

        entity.delete(function (err2) {

          test.value(err2).isNull();

          databases.collection('entities_test').findOne({
            name: 'test'
          }, function (err3, doc2) {

            test.value(err3).isNull();
            test.value(doc2).isNull();

            done();

          });

        });

      });

    });

  });

});
