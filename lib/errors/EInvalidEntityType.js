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
 * Provides the EInvalidEntityType error which is throw when attempting to
 * create an entity which has been registered with an invalid entity
 * constructor.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when trying to create an invalid entity.
 *
 * @param {String} type The entity type.
 *
 * @class EInvalidEntityType
 * @constructor
 * @extends Error
 */
function EInvalidEntityType(type) {
  'use strict';

  EInvalidEntityType.super_.call(this);
  Error.captureStackTrace(this, EInvalidEntityType);

  this.message = t.t(
    'The entity type ":type" has been registered with an invalid constructor.',
    {':type': type}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(EInvalidEntityType, Error);

/**
 * Export the error constructor.
 */
module.exports = EInvalidEntityType;
