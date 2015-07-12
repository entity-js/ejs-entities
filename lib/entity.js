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
 * The entity class.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    events = require('events'),
    async = require('async'),
    merge = require('ejs-merge'),
    databases = require('ejs-databases'),
    validators = require('ejs-validators'),
    listener = require('ejs-listener'),
    types = require('./types'),
    EUnknownField = require('./errors/EUnknownField'),
    EInvalidType = require('./errors/EInvalidType'),
    ERequiredField = require('./errors/ERequiredField'),
    ENoFields = require('./errors/ENoFields'),
    EEntityNotFound = require('./errors/EEntityNotFound'),
    EUndefinedName = require('./errors/EUndefinedName'),
    ECantSaveTrashed = require('./errors/ECantSaveTrashed'),
    ECantTrashTrashed = require('./errors/ECantTrashTrashed'),
    EEntityNotTrashed = require('./errors/EEntityNotTrashed'),
    EMissingID = require('./errors/EMissingID'),
    EUndefinedBundle = require('./errors/EUndefinedBundle'),
    EUndefinedPlugin = require('./errors/EUndefinedPlugin');

/**
 * The Entity class.
 *
 * @class Entity
 * @constructor
 * @param {String} type The entity type.
 * @param {Object} schema The entity schema object defining the fields, bundles,
 *   etc.
 */
function Entity (type, schema) {
  'use strict';

  merge(schema, {
    collection: 'entities_' + type,
    fields: {
      name: {
        type: types.FIELD_TYPE_STRING,
        required: true,
        validate: ['machine-name']
      },
      bundle: {
        type: types.FIELD_TYPE_STRING,
        'default': ''
      }
    }
  });

  Object.defineProperty(this, '_type', {value: type});
  Object.defineProperty(this, '_schema', {value: schema});

  this._id = null;
  this._new = true;
  this._trash = false;
  this._updated = false;
  this._raw = {};
  this._bundle = null;
}

util.inherits(Entity, events.EventEmitter);

/**
 * Returns the database collection for this entity.
 *
 * @method collection
 * @return {Collection} Returns a mongo collection.
 */
Entity.prototype.collection = function () {
  'use strict';

  return databases.collection(this._schema.collection);
};

/**
 *Execute an on event and hook.
 *
 * @method on
 * @param {Function} done The done callback.
 *   @param {Error} done.err Any raised errors.
 * @param {String} event The event to trigger.
 * @param {Object} [data] The data being saved/loaded.
 * @async
 */
Entity.prototype.on = function (done, event, data) {
  'use strict';

  var me = this,
      queue = [];

  function callOn(cb) {
    return function (next) {
      cb.call(me, next, data);
    };
  }

  if (this._schema.on && this._schema.on[event]) {
    for (var i = 0, len = this._schema.on[event].length; i < len; i++) {
      queue.push(callOn(this._schema.on[event][i]));
    }
  }

  async.series(queue, function (err) {
    if (err) {
      return done(err);
    }

    me.emit(event, me);

    listener.invoke(done, [
      'entities[' + me._type + '].' + event,
      'entities.' + event
    ], me, data);
  });
};

/**
 * Initializes the entity, this will setup the entities plugins and bundle.
 *
 * @method initialize
 * @param {Function} done The done callback.
 *   @param {Error} done.err Any raised errors.
 * @async
 */
Entity.prototype.initialize = function (done) {
  'use strict';

  var Entities = require('./');

  var me = this,
      queue = [];

  function plugin (cb) {
    return function (next) {
      if (typeof cb === 'string') {
        var plg = Entities.plugin(cb);
        if (!plg) {
          return next(new EUndefinedPlugin(cb));
        }

        cb = plg;
      }

      cb.call(me, next, me);
    };
  }

  function index(fld, unique) {
    return function (next) {
      var fields = {},
          options = {};

      fields[fld] = -1;
      options.unique = unique === true;

      me.collection().createIndex(fields, options, next);
    };
  }

  if (this._schema.plugins) {
    for (var i = 0, len = this._schema.plugins.length; i < len; i++) {
      queue.push(plugin(this._schema.plugins[i]));
    }
  }

  queue.push(function (next) {
    for (var method in me._schema.methods) {
      me[method] = me._schema.methods[method];
    }

    next();
  });

  queue.push(function (next) {
    me.collection().createIndex({
      name: -1
    }, {
      unique: true
    }, next);
  });

  if (this._schema.fields) {
    for (var field in this._schema.fields) {
      if (!this._schema.fields[field].index) {
        continue;
      }

      queue.push(index(field, this._schema.fields[field].unique === true));
    }
  }

  async.series(queue, function (err) {
    if (err) {
      return done(err);
    }

    me._raw = me.raw();
    me.on(done, 'init');
  });
};

/**
 * Sets the bundle this entity is to use.
 *
 * @method setBundle
 * @param {String} bundle The bundle to use.
 * @returns {Entity} Returns self.
 * @chainable
 *
 * @throws {Error} Thrown if the bundle is not defined.
 */
Entity.prototype.setBundle = function (bundle) {
  'use strict';

  if (bundle && (
    this._schema.bundles === undefined ||
    this._schema.bundles[bundle] === undefined
  )) {
    throw new EUndefinedBundle(this._type, bundle);
  }

  this._bundle = bundle;
  return this;
};

/**
 * Get the defined bundle.
 *
 * @method getBundle
 * @returns {String} The defined bundle.
 */
Entity.prototype.getBundle = function () {
  'use strict';

  return this._bundle;
};

/**
 * Returns all applicable fields available, incl the standard fields and any
 * bundle fields.
 *
 * @method getFields
 * @returns {Object} An object containing all the available fields.
 */
Entity.prototype.getFields = function () {
  'use strict';

  var fields = {};

  merge(fields, this._schema.fields || {});
  merge(fields, this._bundle ? this._schema.bundles[this._bundle] : {});

  return fields;
};

/**
 * Validates the given field.
 *
 * @method validateField
 * @param {Function} done The done callback.
 *   @param {Error} done.err Any raised errors.
 * @param {String} name The name of the field to validate.
 * @param {Mixed} [value] The value to validate against.
 *
 * @throws {EUnknownField} If the field hasn't been defined.
 * @throws {EInvalidType} If the value is an invalid type.
 * @throws {ERequiredField} If the field is required but the value is not null
 *   or undefined.
 */
Entity.prototype.validateField = function (done, name, value) {
  'use strict';

  var queue = [],
      fld = this.getField(name);

  function validate(validator) {
    return function (next) {
      validators.validate(next, validator, value);
    };
  }

  queue.push(function (next) {
    if (fld === null) {
      return next(new EUnknownField(name));
    }

    next();
  });

  queue.push(function (next) {
    if (
      value !== undefined && value !== null &&
      fld.type &&
      types.validateFieldType(value, fld.type) === false
    ) {
      return next(new EInvalidType(name, fld.type));
    }

    next();
  });

  queue.push(function (next) {
    if (fld.required && (value === undefined || value === null)) {
      return next(new ERequiredField(name));
    }

    next();
  });

  if (fld && fld.validate) {
    if (typeof fld.validate === 'string') {
      fld.validate = [fld.validate];
    }

    for (var i = 0, len = fld.validate.length; i < len; i++) {
      queue.push(validate(fld.validate[i]));
    }
  }

  async.series(queue, function (err) {
    done(err ? err : null);
  });
};

/**
 * Determines if this is a new entity, i.e. it hasnt been loaded or saved.
 *
 * @method isNew
 * @returns {Boolean} Returns true or false.
 */
Entity.prototype.isNew = function () {
  'use strict';

  return this._new === true;
};

/**
 * Determines if this is a entity has been updated/changed.
 *
 * @method isUpdated
 * @returns {Boolean} Returns true or false.
 */
Entity.prototype.isUpdated = function () {
  'use strict';

  return this._updated === true;
};

/**
 * Determines if the entityhas been trashed.
 *
 * @method isTrashed
 * @returns {Boolean} Returns true or false.
 */
Entity.prototype.isTrashed = function () {
  'use strict';

  return this._trash === true;
};

/**
 * Attempts to get the field definition from the schema and/or bundle.
 *
 * @method getField
 * @param {String} name The name of the field.
 * @returns {Object} Returns the field definition, or null.
 */
Entity.prototype.getField = function (name) {
  'use strict';

  var fld = null;

  if (
    this._bundle !== null &&
    this._schema.bundles[this._bundle][name] !== undefined
  ) {
    fld = this._schema.bundles[this._bundle][name];
  } else if (
    this._schema.fields !== undefined &&
    this._schema.fields[name] !== undefined
  ) {
    fld = this._schema.fields[name];
  }

  return fld;
};

/**
 * Attempts to get the entity field value.
 *
 * @method get
 * @parma {String} name The field name to get.
 * @returns {Mixed} The value of the field, otherwise a default value.
 *
 * @throws {EUnknownField} Thrown if the field hasn't been defined.
 */
Entity.prototype.get = function (name) {
  'use strict';

  var fld = this.getField(name);
  if (fld === null) {
    throw new EUnknownField(name);
  }

  var val;

  if (this._schema.fields[name]) {
    val = this._raw[name] !== undefined ?
      this._raw[name] :
      this._schema.fields[name].default || null;
  } else if (this._bundle && this._schema.bundles[this._bundle][name]) {
    val = this._raw[name] !== undefined ?
      this._raw[name] :
      this._schema.bundles[this._bundle][name].default || null;
  }

  return val;
};

/**
 * Attempts to get the entity field value.
 *
 * @method get
 * @parma {Function} done The done callback.
 *   @param {Error} done.err Any raised errors.
 * @parma {String} name The field name to get.
 * @param {Mixed} value The value to assign to the field.
 * @async
 *
 * @throws {EUnknownField} Thrown if the field hasn't been defined.
 */
Entity.prototype.set = function (done, name, value) {
  'use strict';

  var me = this,
      fields = {},
      queue = [];

  function validateField(fieldName, fieldValue) {
    return function (next) {
      if (
        me._schema.fields === undefined ||
        me._schema.fields[fieldName] === undefined
      ) {
        return next(new EUnknownField(fieldName));
      }

      me.validateField(function (err) {
        if (err) {
          return next();
        }

        var ctx = {
          field: fieldName,
          orig: value,
          value: fieldValue
        };

        me.on(function (err2) {
          if (!err2) {
            me._updated = true;
            me._raw[fieldName] = ctx.value;
          }

          next(err2);
        }, 'set', ctx);
      }, fieldName, fieldValue);
    };
  }

  if (typeof name === 'string') {
    fields[name] = value;
  } else {
    fields = name;
  }

  for (var field in fields) {
    queue.push(validateField(field, fields[field]));
  }

  async.series(queue, function (err) {
    done(err ? err : null);
  });
};

/**
 * Determines if the field has been defined, this will be true if the field
 * is both in the schema and the data has a value assigned or the field has a
 * default value assigned.
 *
 * @method has
 * @param {String} name The name of the field.
 * @returns {Boolean} Returns true or false.
 */
Entity.prototype.has = function (name) {
  'use strict';

  var fld = this.getField(name);

  return fld !== null && (
    this._raw[name] !== undefined ||
    fld.default !== undefined
  );
};

/**
 * Returns the raw data object, unlike direct access to the _raw object this
 * will set any undefined fields to their default value if available.
 *
 * @method raw
 * @return {Object} The parsed raw object.
 */
Entity.prototype.raw = function () {
  'use strict';

  var raw = {};

  if (this._id) {
    raw._id = this._id;
  }

  var fields = this.getFields();
  for (var field in fields) {
    raw[field] = this.get(field);
  }

  return raw;
};

/**
 * Validates all fields of the entity.
 *
 * @method validate
 * @param {Function} done The done callback.
 *   @param {Error} done.err Any raised errors.
 * @async
 */
Entity.prototype.validate = function (done) {
  'use strict';

  var me = this,
      queue = [];

  function validate(field, value) {
    return function (next) {
      me.validateField(next, field, value);
    };
  }

  var fields = this.getFields();
  for (var name in fields) {
    queue.push(validate(name, this._raw[name]));
  }

  if (queue.length === 0) {
    return done(new ENoFields());
  }

  async.series(queue, function (err) {
    if (err) {
      return done(err);
    }

    me.on(done, 'validate');
  });
};

/**
 * Load this entity from the database.
 *
 * @method load
 * @param {Function} done The done callback.
 *   @param {Error} done.err Any raised errors.
 * @param {String} [name] The machine name to load, if not provided the machine
 *   name of the entity is used.
 * @async
 *
 * @throws {EUndefinedName} Raised if a machine name has not been provided and
 *   this entity hasnt provided a machine name.
 * @throws {EEntityNotFound} Raised if an entity wasnt found.
 */
Entity.prototype.load = function (done, name) {
  'use strict';

  if (name === undefined && !(name = this.get('name'))) {
    return done(new EUndefinedName(this._type));
  }

  var me = this;

  this.collection().findOne({name: name}, function (err, doc) {
    if (err) {
      return done(err);
    }

    var queue = [];

    queue.push(function (next) {
      if (doc) {
        return next();
      }

      databases.collection('waste').findOne({
        type: me._type,
        name: name
      }, function (err2, d) {
        if (err2) {
          return next(err2);
        }

        if (d) {
          doc = d.data;
          doc.name = name;
          me._trash = true;
        }

        next();
      });
    });

    queue.push(function (next) {
      next(doc ? null : new EEntityNotFound(me._type, 'name', name));
    });

    queue.push(function (next) {
      me._raw = {};
      me._id = doc._id;
      me._new = false;

      for (var field in me._schema.fields) {
        if (doc[field] === undefined) {
          continue;
        }

        me._raw[field] = doc[field];
      }

      next(null);
    });

    queue.push(function (next) {
      me.initialize(next);
    });

    queue.push(function (next) {
      me.on(next, 'loaded', me._raw);
    });

    async.series(queue, function (err2) {
      done(err2 ? err2 : null);
    });
  });
};

/**
 * Saves the entity to the database.
 *
 * @method save
 * @param {Function} done The done callback.
 *   @param {Error} done.err Any raised errors.
 * @param {Entity} whoAmI An entity that is responsible, usually a user entity,
 *   if not provided "system" will be set.
 * @async
 *
 * @throws {ECantSaveTrashed} Thrown if this entity was trashed.
 */
Entity.prototype.save = function (done, whoAmI) {
  'use strict';

  var me = this,
      data,
      queue = [],
      _whoAmI = whoAmI instanceof Entity ? {
        type: whoAmI._type,
        id: whoAmI._id
      } : 'system';

  queue.push(function (next) {
    next(
      me.isTrashed() ?
        new ECantSaveTrashed(me._type, me.get('name')) :
        null
    );
  });

  queue.push(function (next) {
    me.validate(next);
  });

  queue.push(function (next) {
    data = me.raw();
    me.on(next, 'presave', data, _whoAmI);
  });

  queue.push(function (next) {
    me.collection().save(data, function (err, entity) {
      if (!err && entity) {
        me._id = entity._id;
        me._new = false;
      }

      next(err);
    });
  });

  queue.push(function (next) {
    me.on(next, 'saved', _whoAmI);
  });

  async.series(queue, function (err) {
    done(err ? err : null);
  });
};

/**
 * Move the entity to the entity waste bin.
 *
 * @method trash
 * @param {Function} done The done callback.
 *   @param {Error} done.err Any raised errors.
 * @param {Entity} whoAmI An entity that is responsible, usually a user entity,
 *   if not provided "system" will be set.
 * @async
 *
 * @throws {Error} Thrown if the entity is new.
 * @throws {Error} Thrown if the entity has already been trashed.
 */
Entity.prototype.trash = function (done, whoAmI) {
  'use strict';

  if (!this._id) {
    return done(new EMissingID());
  }

  if (this.isTrashed()) {
    return done(new ECantTrashTrashed());
  }

  var me = this,
      queue = [],
      doc = {
        _id: me._id,
        name: me.get('name'),
        type: me._type,
        data: me.raw(),
        trashedOn: {
          when: new Date(),
          who: whoAmI instanceof Entity ? {
            type: whoAmI._type,
            id: whoAmI._id
          } : 'system'
        }
      };

  queue.push(function (next) {
    me.on(next, 'pretrash');
  });

  queue.push(function (next) {
    databases.collection('waste').insert(doc, next);
  });

  queue.push(function (next) {
    me.collection().remove({_id: me._id}, next);
  });

  queue.push(function (next) {
    me._trash = true;
    me.on(next, 'trashed');
  });

  async.series(queue, function (err) {
    done(err ? err : null);
  });
};

/**
 * Restore the entity from the entity waste bin.
 *
 * @method restore
 * @param {Function} done The done callback.
 *   @param {Error} done.err Any raised errors.
 * @param {Entity} whoAmI An entity that is responsible, usually a user entity,
 *   if not provided "system" will be set.
 * @async
 *
 * @throws {Error} Thrown if the entity has not been trashed.
 */
Entity.prototype.restore = function (done, whoAmI) {
  'use strict';

  var me = this,
      queue = [],
      doc = null;

  queue.push(function (next) {
    me.on(next, 'prerestore');
  });

  queue.push(function (next) {
    databases.collection('waste').findOne({
      name: me.get('name'),
      type: me._type
    }, function (err, d) {
      if (err) {
        return next(err);
      }

      if (!d) {
        return next(new EEntityNotTrashed(me._type, me.get('name')));
      }

      doc = d;
      next();
    });
  });

  queue.push(function (next) {
    me._id = doc._id;
    me._raw = doc.data;
    me._trash = false;
    me.save(next, whoAmI);
  });

  queue.push(function (next) {
    databases.collection('waste').remove({_id: me._id}, next);
  });

  queue.push(function (next) {
    me.on(next, 'restored', me._raw);
  });

  async.series(queue, function (err) {
    done(err ? err : null);
  });
};

/**
 * Deletes the entity, this will be from the entity waste bin as well as the
 * entity collection.
 *
 * @method delete
 * @param {Function} done The done callback.
 *   @param {Error} done.err Any raised errors.
 * @async
 */
Entity.prototype.delete = function (done) {
  'use strict';

  var me = this,
      queue = [];

  if (!this._id) {
    return done(new EMissingID());
  }

  queue.push(function (next) {
    me.on(next, 'predelete');
  });

  queue.push(function (next) {
    databases.collection('waste').remove({
      _id: me._id
    }, next);
  });

  queue.push(function (next) {
    me.collection().remove({
      _id: me._id
    }, next);
  });

  queue.push(function (next) {
    me._id = null;
    me._new = true;
    me._updated = false;
    me._trash = false;

    me.on(next, 'deleted');
  });

  async.series(queue, function (err) {
    done(err ? err : null);
  });
};

/**
 * Export the Entity constructor.
 */
module.exports = Entity;
