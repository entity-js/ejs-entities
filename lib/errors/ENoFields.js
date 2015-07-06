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
 * Provides the ENoFields error which is throw when validating an entity with no
 * fields defined.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when tryng to validate an entity without any fields defined.
 *
 * @class ENoFields
 * @constructor
 * @extends Error
 */
function ENoFields(field) {
  'use strict';

  ENoFields.super_.call(this);
  Error.captureStackTrace(this, ENoFields);

  this.message = t.t('Cannot validate the entity as it has no defined fields.');
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(ENoFields, Error);

/**
 * Export the error constructor.
 */
module.exports = ENoFields;
