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
 * The entity field types.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

var entityTypes = {
  FIELD_TYPE_MIXED: 0,
  FIELD_TYPE_STRING: 1,
  FIELD_TYPE_INTEGER: 2,
  FIELD_TYPE_DECIMAL: 3,
  FIELD_TYPE_BOOLEAN: 4,
  FIELD_TYPE_ARRAY: 5,
  FIELD_TYPE_OBJECT: 6,
  FIELD_TYPE_FUNCTION: 7
};

/**
 * Validate a value against a specified type.
 *
 * @method validateFieldType
 * @param {Mixed} value The value to validate.
 * @param {Int} type The value type.
 * @returns {Boolean} Returns true if the type validates.
 */
entityTypes.validateFieldType = function (value, type) {
  'use strict';

  switch (type) {
    case entityTypes.FIELD_TYPE_STRING:
      return value instanceof String || typeof value === 'string';

    case entityTypes.FIELD_TYPE_INTEGER:
      return (
        value instanceof Number ||
        typeof value === 'number' ||
        !isNaN(parseInt(value, 10))
      ) && (Number(value) === value && value % 1 === 0);

    case entityTypes.FIELD_TYPE_DECIMAL:
      return value instanceof Number ||
        typeof value === 'number' ||
        !isNaN(parseInt(value, 10));

    case entityTypes.FIELD_TYPE_BOOLEAN:
      return value instanceof Boolean || typeof value === 'boolean';

    case entityTypes.FIELD_TYPE_ARRAY:
      return Array.isArray(value);

    case entityTypes.FIELD_TYPE_OBJECT:
      return value instanceof Object || typeof value === 'object';

    case entityTypes.FIELD_TYPE_FUNCTION:
      return typeof value === 'function';

    default:
      return true;
  }
};

module.exports = entityTypes;
