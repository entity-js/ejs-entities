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
 * Provides the EAlreadyRegistered error which is throw when attempting to
 * register analready registered entity.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when trying to use register an already registered entity type.
 *
 * @param {String} type The entity type.
 *
 * @class EAlreadyRegistered
 * @constructor
 * @extends Error
 */
function EAlreadyRegistered(type) {
  'use strict';

  EAlreadyRegistered.super_.call(this);
  Error.captureStackTrace(this, EAlreadyRegistered);

  this.message = t.t(
    'The entity type ":type" has already been registered.',
    {':type': type}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(EAlreadyRegistered, Error);

/**
 * Export the error constructor.
 */
module.exports = EAlreadyRegistered;
