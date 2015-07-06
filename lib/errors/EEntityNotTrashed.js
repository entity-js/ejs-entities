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
 * Provides the EEntityNotTrashed error which is throw when attempting to
 * restore an entity which isnt in the waste collection.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when trying to restore an entity which doesnt exist in the waste
 * collection.
 *
 * @param {String} type The entity type.
 * @param {String} name The name of the entity.
 *
 * @class EEntityNotTrashed
 * @constructor
 * @extends Error
 */
function EEntityNotTrashed(type, name) {
  'use strict';

  EEntityNotTrashed.super_.call(this);
  Error.captureStackTrace(this, EEntityNotTrashed);

  this.message = t.t(
    'Unable to find entity type ":type" with name ":name" in the waste bin.',
    {':type': type, ':name': name}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(EEntityNotTrashed, Error);

/**
 * Export the error constructor.
 */
module.exports = EEntityNotTrashed;
