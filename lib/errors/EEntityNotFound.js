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
 * Provides the EEntityNotFound error which is throw when attempting to load an
 * entity which doesnt exist in the database.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when tryng to load an entity which doesnt exist.
 *
 * @param {String} type The entity type.
 * @param {String} field The field of the entity being searched.
 * @param {String} value The value provided to search for.
 *
 * @class EEntityNotFound
 * @constructor
 * @extends Error
 */
function EEntityNotFound(type, field, value) {
  'use strict';

  EEntityNotFound.super_.call(this);
  Error.captureStackTrace(this, EEntityNotFound);

  this.message = t.t(
    'Unable to find entity type ":type" where ":field" is ":value".',
    {':type': type, ':field': field, ':value': value}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(EEntityNotFound, Error);

/**
 * Export the error constructor.
 */
module.exports = EEntityNotFound;
