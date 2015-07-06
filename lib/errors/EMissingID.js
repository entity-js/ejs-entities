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
 * Provides the EMissingID error which is throw when attempting to delete or
 * trash an entity without an ID.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when tryng to trash or delete an entity without an ID.
 *
 * @class EMissingID
 * @constructor
 * @extends Error
 */
function EMissingID() {
  'use strict';

  EMissingID.super_.call(this);
  Error.captureStackTrace(this, EMissingID);

  this.message = t.t(
    'Unable to perform this action as the entity doesnt have an ID assigned.'
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(EMissingID, Error);

/**
 * Export the error constructor.
 */
module.exports = EMissingID;
