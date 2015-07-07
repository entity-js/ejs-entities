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

/**
 * The entities component.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var async = require('async'),
    merge = require('ejs-merge'),
    databases = require('ejs-databases'),
    ejsStatic = require('ejs-static'),
    Entity = require('./entity'),
    fncToString = require('./fncToString'),
    stringToFnc = require('./stringToFnc'),
    EAlreadyRegistered = require('./errors/EAlreadyRegistered'),
    EUndefinedEntityType = require('./errors/EUndefinedEntityType'),
    EUnknownSchema = require('./errors/EUnknownSchema'),
    EUndefinedPlugin = require('./errors/EUndefinedPlugin');

var _entities,
    _static = ejsStatic('ejs-entities', {
      _plugins: {}
    }).get();

/**
 * Helper function to get the schemas collection.
 */
function schemasCollection() {
  'use strict';

  return databases.collection('entity_schemas');
}

_entities = module.exports = {
  /**
   * Initializes the entities component, and registers any default plugins.
   *
   * @method initialize
   * @param {Function} done The done callback.
   *   @param {Error} done.err Any raised errors.
   * @async
   */
  initialize: function (done) {
    'use strict';

    _entities.registerPlugin(
      'createdBy',
      'Created-by',
      'Provides a created/updated on/by field which stores the date of ' +
      'creation/updated and by who/what.',
      require('./plugins/createdBy')
    );

    done(null);
  },

  /**
   * Register an entity type.
   *
   * @method register
   * @param {Function} done The done callback.
   *   @param {Error} done.err Any raised errors.
   * @param {String} type The entity type name.
   * @param {Object} [schema] The entities schema object.
   * @async
   *
   * @throws {EAlreadyRegistered} Thrown if the entity type has already been
   *   registered.
   */
  register: function (done, type, schema) {
    'use strict';

    var schemaClone = {},
        queue = [];

    merge(schemaClone, schema);
    merge(schemaClone, {
      collection: 'entities_' + type,
      fields: {},
      on: {
        get: [],
        set: [],
        init: [],
        loaded: [],
        presave: [],
        saved: [],
        pretrash: [],
        trashed: [],
        prerestore: [],
        restored: [],
        predelete: [],
        deleted: []
      },
      plugins: [],
      methods: {}
    });

    queue.push(function (next) {
      _entities.registered(function (err, registered) {
        if (err) {
          return next(err);
        } else if (registered) {
          return next(new EAlreadyRegistered(type));
        }

        next();
      }, type);
    });

    queue.push(function (next) {
      for (var event in schemaClone.on) {
        for (var i = 0, len = schemaClone.on[event].length; i < len; i++) {
          schemaClone.on[event][i] = fncToString(schemaClone.on[event][i]);
        }
      }

      for (var method in schemaClone.methods) {
        schemaClone.methods[method] = fncToString(schemaClone.methods[method]);
      }

      next();
    });

    queue.push(function (next) {
      schemasCollection().insert({
        type: type,
        schema: schemaClone
      }, next);
    });

    async.series(queue, function (err) {
      done(err ? err : null);
    });
  },

  /**
   * Updates an existing entity schema type.
   *
   * @method update
   * @param {Function} done The done callback.
   *   @param {Error} done.err Any raised errors.
   * @param {String} type The entity type name.
   * @param {Object} schema The entities schema object.
   * @async
   */
  update: function (done, type, schema) {
    'use strict';

    var _id = null,
        schemaClone = {},
        queue = [];

    merge(schemaClone, schema);
    merge(schemaClone, {
      collection: 'entities_' + type,
      fields: {},
      on: {
        get: [],
        set: [],
        init: [],
        loaded: [],
        presave: [],
        saved: [],
        pretrash: [],
        trashed: [],
        prerestore: [],
        restored: [],
        predelete: [],
        deleted: []
      },
      plugins: [],
      methods: {}
    });

    queue.push(function (next) {
      _entities._collection.findOne({
        type: type
      }, {
        _id: 1
      }, function (err, doc) {
        if (err) {
          return next(err);
        }

        if (doc) {
          _id = doc._id;
        }

        next();
      });
    });

    queue.push(function (next) {
      for (var event in schemaClone.on) {
        for (var i = 0, len = schemaClone.on[event].length; i < len; i++) {
          schemaClone.on[event][i] = fncToString(schemaClone.on[event][i]);
        }
      }

      for (var method in schemaClone.methods) {
        schemaClone.methods[method] = fncToString(schemaClone.methods[method]);
      }

      next();
    });

    queue.push(function (next) {
      schemasCollection().save({
        _id: _id,
        type: type,
        schema: schema
      }, next);
    });

    async.series(queue, function (err) {
      done(err ? err : null);
    });
  },

  /**
   * Determines if a schema has been registered.
   *
   * @method registered
   * @param {Function} done The done callback.
   *   @param {Error} done.err Any raised errors.
   *   @param {Boolean} done.registered True if the schema has been registered.
   * @param {String} type The entity schema type name.
   * @async
   */
  registered: function (done, type) {
    'use strict';

    schemasCollection().count({
      type: type
    }, function (err, count) {
      done(err ? err : null, count > 0);
    });
  },

  /**
   * Unregisteres an unregistered entity type.
   *
   * @method unregister
   * @param {Function} done The done callback.
   *   @param {Error} done.err Any raised errors.
   * @param {String} type The entity type name to unregister.
   * @async
   */
  unregister: function (done, type) {
    'use strict';

    schemasCollection().remove({
      type: type
    }, function (err) {
      done(err ? err : null);
    });
  },

  /**
   * Registers a new plugin.
   *
   * @method registerPlugin
   * @param {String} name The name of the plugin to register.
   * @param {String} title An admin title to give the plugin.
   * @param {String} description An admin description to give the plugin.
   * @param {Function} cb The plugin callback.
   * @return {Object} Returns self.
   * @chainable
   */
  registerPlugin: function (name, title, description, cb) {
    'use strict';

    _static._plugins[name] = {
      title: title || '',
      description: description || '',
      callback: cb
    };

    return _entities;
  },

  /**
   * Determines if the specified plugin has been registered.
   *
   * @method registeredPlugin
   * @param {String} name The name of the plugin to register.
   * @return {Boolean} Returns true if the plugin has been defined.
   */
  registeredPlugin: function (name) {
    'use strict';

    return _static._plugins[name] !== undefined;
  },

  /**
   * Unregisters a defined plugin.
   *
   * @method unregisterPlugin
   * @param {String} name The name of the plugin to register.
   * @return {Object} Returns self.
   * @throws {EUndefinedPlugin} Thrown if the plugin is not yet defined.
   * @chainable
   */
  unregisterPlugin: function (name) {
    'use strict';

    if (_static._plugins[name] === undefined) {
      throw new EUndefinedPlugin(name);
    }

    delete _static._plugins[name];
    return _entities;
  },

  /**
   * Get the plugin callback.
   *
   * @method plugin
   * @param {String} name The name of the plugin.
   * @return {Function} The plugin callback.
   * @throws {EUndefinedPlugin} Thrown if the plugin has yet to be defined.
   */
  plugin: function (name) {
    'use strict';

    if (_static._plugins[name] === undefined) {
      throw new EUndefinedPlugin(name);
    }

    return _static._plugins[name].callback;
  },

  /**
   * Get all the defined plugins.
   *
   * @method plugins
   * @return {Object} An object containing all the details of the defined
   *   plugins.
   */
  plugins: function () {
    'use strict';

    return _static._plugins;
  },

  /**
   * Attempts to get a registered schema.
   *
   * @method schema
   * @param {Function} done The done callback.
   *   @param {Error} done.err Any raised errors.
   *   @param {Object} done.schema The registered schema object.
   * @param {String} type The entity schema type name.
   * @async
   */
  schema: function (done, type) {
    'use strict';

    schemasCollection().findOne({
      type: type
    }, function (err, doc) {
      if (err) {
        return done(err);
      } else if (!doc) {
        return done(new EUndefinedEntityType(type));
      }

      for (var event in doc.schema.on) {
        for (var i = 0, len = doc.schema.on[event].length; i < len; i++) {
          doc.schema.on[event][i] = stringToFnc(doc.schema.on[event][i]);
        }
      }

      for (var method in doc.schema.methods) {
        doc.schema.methods[method] = stringToFnc(doc.schema.methods[method]);
      }

      done(null, doc.schema);
    });
  },

  /**
   * Creates a new entity of the specified type and bundle.
   *
   * @method create
   * @param {Function} done The done callback.
   *   @param {Error} done.err Any raised errors.
   *   @param {Entity} done.entity The newly created entity.
   * @param {String} type The entity type name to create.
   * @param {String} [bundle] The bundle to apply to the new entity.
   * @async
   *
   * @throws {EUndefinedEntityType} Raised if the entity type hasnt been
   *   registered.
   */
  create: function (done, type, bundle) {
    'use strict';

    var entity = null,
        queue = [];

    queue.push(function (next) {
      _entities.schema(function (err, schema) {
        if (err) {
          return next(err);
        }

        entity = new Entity(type, schema);
        next();
      }, type);
    });

    queue.push(function (next) {
      entity.initialize(function (err) {
        if (err) {
          return next(err);
        }

        if (bundle) {
          entity.setBundle(bundle);
        }

        next();
      });
    });

    async.series(queue, function (err) {
      done(err ? err : null, err ? null : entity);
    });
  },

  /**
   * Checks if an entity type with the specified name already exists.
   *
   * @method exists
   * @param {Function} done The done callback.
   *   @param {Error} done.err Any raised errors.
   *   @param {Boolean} done.exists True if the entity does exist.
   * @param {String} type The entity type name to look for.
   * @param {String} name The entity name.
   * @async
   *
   * @throws {EUndefinedEntityType} Raised if the entity type hasnt been
   *   registered.
   */
  exists: function (done, type, name) {
    'use strict';

    var collection = null,
        count = 0,
        queue = [];

    queue.push(function (next) {
      _entities.schema(function (err, schema) {
        if (err) {
          return next(err);
        }

        if (!schema || !schema.collection) {
          return next(new EUnknownSchema(type));
        }

        collection = schema.collection;
        next();
      }, type);
    });

    queue.push(function (next) {
      databases.collection(collection).count({
        name: name
      }, function (err, no) {
        if (err) {
          return next(err);
        }

        count = no;
        next();
      });
    });

    async.series(queue, function (err) {
      done(err ? err : null, err ? null : count > 0);
    });
  },

  /**
   * Loads an entity by a provided name and type.
   *
   * @method load
   * @param {Function} done The done callback.
   *   @param {Error} done.err Any raised errors.
   *   @param {Entity} done.entity The loaded entity.
   * @param {String} type The entity type name to load.
   * @param {String} name The entity name.
   * @async
   *
   * @throws {EUndefinedEntityType} Raised if the entity type hasnt been
   *   registered.
   */
  load: function (done, type, name) {
    'use strict';

    var entity = null,
        queue = [];

    queue.push(function (next) {
      _entities.schema(function (err, schema) {
        if (err) {
          return next(err);
        }

        entity = new Entity(type, schema);
        entity.load(next, name);
      }, type);
    });

    async.series(queue, function (err) {
      done(err ? err : null, err ? null : entity);
    });
  }
};
