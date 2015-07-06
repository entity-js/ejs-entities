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
 * Provides the EInvalidType error which is used when setting an entity field
 * value to an invalid type.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when tryng to set an entity field to the wrong type.
 *
 * @param {String} field The name of the field.
 * @param {String} type The field value type.
 *
 * @class EInvalidType
 * @constructor
 * @extends Error
 */
function EInvalidType(field, type) {
  'use strict';

  EInvalidType.super_.call(this);
  Error.captureStackTrace(this, EInvalidType);

  this.message = t.t(
    'The entity field ":field" expects type ":type".',
    {':field': field, ':type': type}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(EInvalidType, Error);

/**
 * Export the error constructor.
 */
module.exports = EInvalidType;
