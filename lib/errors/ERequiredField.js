/**
 *  ______   __   __   ______  __   ______  __  __
 * /\  ___\ /\ "-.\ \ /\__  _\/\ \ /\__  _\/\ \_\ \
 * \ \  __\ \ \ \-.  \\/_/\ \/\ \ \\/_/\ \/\ \____ \
 *  \ \_____\\ \_\\"\_\  \ \_\ \ \_\  \ \_\ \/\_____\
 *   \/_____/ \/_/ \/_/   \/_/  \/_/   \/_/  \/_____/
 *                          ______   __    __   ______
 *                         /\  ___\ /\ "-./  \ /\  ___\
 *                         \ \ \____\ \ \-./\ \\ \___  \
 *                          \ \_____\\ \_\ \ \_\\/\_____\
 *                           \/_____/ \/_/  \/_/ \/_____/
 */

/**
 * Provides the ERequiredField error which is throw when validating a required
 * field with an undefined or null value.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when validating a required field with an undefined or null value.
 *
 * @param {String} field The name of the field.
 *
 * @class ERequiredField
 * @constructor
 * @extends Error
 */
function ERequiredField(field) {
  'use strict';

  ERequiredField.super_.call(this);
  Error.captureStackTrace(this, ERequiredField);

  this.message = t.t(
    'The entity field ":field" is required, null or undefined provided.',
    {':field': field}
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(ERequiredField, Error);

/**
 * Export the error constructor.
 */
module.exports = ERequiredField;
