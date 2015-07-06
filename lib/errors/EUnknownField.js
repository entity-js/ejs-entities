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
 * Provides the EUnknownField error which is throw when attempting to use an
 * undefined entity field.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when tryng to use an undefined entity field.
 *
 * @param {String} field The name of the field.
 *
 * @class EUnknownField
 * @constructor
 * @extends Error
 */
function EUnknownField(field) {
  'use strict';

  EUnknownField.super_.call(this);
  Error.captureStackTrace(this, EUnknownField);

  this.message = t.t(
    'The entity field ":field" hasnt been defined.',
    {':field': field}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(EUnknownField, Error);

/**
 * Export the error constructor.
 */
module.exports = EUnknownField;
