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
 * Provides the EUndefinedBundle error which is throw when attempting to assign
 * an undefined bundle to an entity.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when trying to use an undefined bundle.
 *
 * @param {String} type The entity type.
 * @param {String} bundle The bundle attempting to assign.
 *
 * @class EUndefinedBundle
 * @constructor
 * @extends Error
 */
function EUndefinedBundle(type, bundle) {
  'use strict';

  EUndefinedBundle.super_.call(this);
  Error.captureStackTrace(this, EUndefinedBundle);

  this.message = t.t(
    'The entity type ":type" does not have the bundle ":bundle".',
    {':type': type, ':bundle': bundle}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(EUndefinedBundle, Error);

/**
 * Export the error constructor.
 */
module.exports = EUndefinedBundle;
