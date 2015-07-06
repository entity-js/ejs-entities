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
 * Helper to convert a string to a function.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 *
 * @module ejs
 * @submodule Entities
 */

module.exports = function stringToFnc (str) {
  'use strict';

  if (str.indexOf('@action{') === 0) {
    return str.substring(8, str.length - 1);
  }

  if (str.indexOf('@fnc{') === 0) {
    /* jshint -W061 */
    /* eslint-disable */
    return eval('(' + str.substring(5, str.length - 1) + ')');
    /* eslint-enable */
  }

  return str;
};
