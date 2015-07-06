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
 * Provides the EUndefinedEntityType error which is throw when attempting to use
 * an unregistered entity type.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when trying to use an unregistered entity type.
 *
 * @param {String} type The entity type.
 *
 * @class EUndefinedEntityType
 * @constructor
 * @extends Error
 */
function EUndefinedEntityType(type) {
  'use strict';

  EUndefinedEntityType.super_.call(this);
  Error.captureStackTrace(this, EUndefinedEntityType);

  this.message = t.t(
    'The entity type ":type" has not been registered.',
    {':type': type}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(EUndefinedEntityType, Error);

/**
 * Export the error constructor.
 */
module.exports = EUndefinedEntityType;
