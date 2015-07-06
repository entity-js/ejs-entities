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
 * Provides the revisions entity plugin which can will extended the entity to
 * store field revisions.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var types = require('../types');

/**
 * Export the revisions plugin.
 *
 * @method revisions
 */
module.exports = function revisions (entity, options) {
  'use strict';

  entity._revision = null;

  /**
   * Revisions data.
   *
   * @property {Object} revisions
   *   @property {Date} revisions[revision].createdOn
   *   @property {Object} revisions[revision].createdBy
   *   @property {Date} revisions[revision].updatedOn
   *   @property {Object} revisions[revision].updatedBy
   *   @property {String} revisions[revision].description
   *   @property {Boolean} revisions[revision].active
   *   @property {Boolean} revisions[revision].locked
   *   @property {Array} revisions[revision].conditions
   *   @property {Object} revisions[revision].fields
   */
  entity._schema.fields.revisions = {
    type: types.FIELD_TYPE_OBJECT,
    'default': {}
  };

  /**
   * @todo
   */
  entity.hasRevision = function (revision) {
    return this._raw.revisions[revision] !== undefined;
  };

  /**
   * @todo
   */
  entity.setRevision = function (revision) {
    if (this._raw.revisions[revision] === undefined) {
      throw new Error(); // @todo
    }

    // @todo
    return this;
  };

  /**
   * @todo
   */
  entity.getRevision = function (revision) {
    if (this._raw.revisions[revision] === undefined) {
      throw new Error(); // @todo
    }

    return this._raw.revisions[revision];
  };

  entity._schema.on.presave.push(function (next) {
    if (this._revision && this._raw.revisions[this._revision].locked) {
      return next(new Error()); // @todo
    }

    // @todo - createdOn/By
    // @todo - updatedOn/By

    next();
  });
};
