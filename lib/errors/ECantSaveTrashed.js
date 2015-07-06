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
 * Provides the ECantSaveTrashed error which is throw when attempting to save a
 * trashed entity.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when tryng to save a trashed entity.
 *
 * @param {String} type The entity type.
 * @param {String} name The name of the entity.
 *
 * @class ECantSaveTrashed
 * @constructor
 * @extends Error
 */
function ECantSaveTrashed(type, name) {
  'use strict';

  ECantSaveTrashed.super_.call(this);
  Error.captureStackTrace(this, ECantSaveTrashed);

  this.message = t.t(
    'Unable to save entity ":name" of type ":type" as it has been trashed.',
    {':type': type, ':name': name}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(ECantSaveTrashed, Error);

/**
 * Export the error constructor.
 */
module.exports = ECantSaveTrashed;
