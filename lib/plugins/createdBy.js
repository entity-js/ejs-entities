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
 * Provides the created and updated by entity plugin which can will extended the
 * entity to store created by/who and updated by/who.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var types = require('../types');

/**
 * Export the createdBy plugin.
 *
 * @method createdBy
 */
module.exports = function createdBy (done, entity) {
  'use strict';

  /**
   * An object containing information on who and when this entity was created.
   *
   * @property {Object} createdOn
   *   @property {Date} createdOn.when
   *   @property {ObjectId} createdOn.who
   */
  entity._schema.fields.createdOn = {
    type: types.FIELD_TYPE_OBJECT,
    required: true
  };

  /**
   * An object containing information on who and when this entity was updated.
   *
   * @property {Object} createdOn
   *   @property {Date} createdOn.when
   *   @property {ObjectId} createdOn.who
   */
  entity._schema.fields.updatedOn = {
    type: types.FIELD_TYPE_OBJECT,
    required: true
  };

  /**
   * Get the date when this entity was created.
   *
   * @method getCreatedOn
   * @return {Date} Returns the date of which this entity was created.
   */
  entity.getCreatedOn = function () {
    var v = this.get('createdOn');
    return v ? v.when : null;
  };

  /**
   * Get the entity that was responsible for creating this entity.
   *
   * @method getCreatedBy
   * @return {Object} Returns the type and name of the entity responsible for
   *   creating this entity.
   */
  entity.getCreatedBy = function () {
    var v = this.get('createdOn');
    return v ? v.who : null;
  };

  /**
   * Get the date when this entity was last updated.
   *
   * @method getUpdatedOn
   * @return {Date} Returns the date of which this entity was last updated.
   */
  entity.getUpdatedOn = function () {
    var v = this.get('UpdatedOn');
    return v ? v.when : null;
  };

  /**
   * Get the entity that was responsible for updating this entity.
   *
   * @method getUpdatedBy
   * @return {Object} Returns the type and name of the entity responsible for
   *   updating this entity.
   */
  entity.getUpdatedBy = function () {
    var v = this.get('UpdatedOn');
    return v ? v.who : null;
  };

  entity._schema.on.presave.push(function (next, whoAmI) {
    var d = new Date();

    if (!this._raw.createdOn) {
      this._raw.createdOn = {
        when: d,
        who: whoAmI
      };
    }

    this._raw.updatedOn = {
      when: d,
      who: whoAmI
    };

    next();
  });

  done();
};
