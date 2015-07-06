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
 * Provides the EUndefinedPlugin error which is throw when attempting to use an
 * undefined plugin.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when trying to use an undefined plugin.
 *
 * @param {String} name The name of the plugin.
 *
 * @class EUndefinedPlugin
 * @constructor
 * @extends Error
 */
function EUndefinedPlugin(name) {
  'use strict';

  EUndefinedPlugin.super_.call(this);
  Error.captureStackTrace(this, EUndefinedPlugin);

  this.message = t.t(
    'The entity plugin ":name" has not been defined.',
    {':name': name}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(EUndefinedPlugin, Error);

/**
 * Export the error constructor.
 */
module.exports = EUndefinedPlugin;
