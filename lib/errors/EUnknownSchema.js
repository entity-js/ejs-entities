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
 * Provides the EUnknownSchema error which is throw when attempting to use an
 * undefined entity schema.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when tryng to use an undefined entity schema.
 *
 * @param {String} type The entity type.
 *
 * @class EUnknownSchema
 * @constructor
 * @extends Error
 */
function EUnknownSchema(type) {
  'use strict';

  EUnknownSchema.super_.call(this);
  Error.captureStackTrace(this, EUnknownSchema);

  this.message = t.t(
    'The schema for entity type ":type" hasnt been defined.',
    {':type': type}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(EUnknownSchema, Error);

/**
 * Export the error constructor.
 */
module.exports = EUnknownSchema;
