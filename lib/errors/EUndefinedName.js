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
 * Provides the EUndefinedName error which is throw when attempting to load an
 * entity without providing a name.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when trying to load an entity without providing a name.
 *
 * @param {String} type The entity type.
 *
 * @class EUndefinedName
 * @constructor
 * @extends Error
 */
function EUndefinedName(type) {
  'use strict';

  EUndefinedName.super_.call(this);
  Error.captureStackTrace(this, EUndefinedName);

  this.message = t.t(
    'An entity name for type ":type" was undefined.',
    {':type': type}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(EUndefinedName, Error);

/**
 * Export the error constructor.
 */
module.exports = EUndefinedName;
