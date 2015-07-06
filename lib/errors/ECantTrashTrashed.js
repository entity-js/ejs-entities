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
 * Provides the ECantTrashTrashed error which is throw when attempting to trash
 * an entity thats marked as trashed.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var util = require('util'),
    t = require('ejs-t');

/**
 * Thrown when trying to trash a trashed entity.
 *
 * @class ECantTrashTrashed
 * @constructor
 * @extends Error
 */
function ECantTrashTrashed() {
  'use strict';

  ECantTrashTrashed.super_.call(this);
  Error.captureStackTrace(this, ECantTrashTrashed);

  this.message = t.t(
    'Unable to trash this entity as its marked as already trashed.'
  );
}

/**
 * Inherit from the {Error} class.
 */
util.inherits(ECantTrashTrashed, Error);

/**
 * Export the error constructor.
 */
module.exports = ECantTrashTrashed;
