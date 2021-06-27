const isOnline = require('is-online');
const chalk = require('chalk');
const logger = require('./logger');

class Online {
  /**
   * @typedef {'connect'|'disconnect'} OnlineEventName
   */

  /**
   * @constructor
   * @param {number} interval
   * @param {timeout} timeout
   */
  constructor(interval = 5000, timeout = 5000) {
    this._connectListeners = [];
    this._disconnectListeners = [];
    // online status
    this._init = true;
    this._status = false;
    // net checker
    this._checkOnline(timeout);
    this._interval = setInterval(() => this._checkOnline(timeout), interval);
  }

  /**
   * @private
   * check online status
   * @param {timeout} timeout
   */
  async _checkOnline(timeout) {
    const online = await isOnline({ timeout });
    if (online) {
      logger.log(`Internet access: ${chalk.green('Online')}`);
      if (this._init || !this._status) {
        this._status = true;
        this._connectListeners.forEach((func) => func());
      }
    } else {
      logger.log(`Internet access: ${chalk.green('Offline')}`);
      if (this._init || this._status) {
        this._status = false;
        this._disconnectListeners.forEach((func) => func());
      }
    }
    // remove init mark
    this._init && (this._init = false);
  }

  /**
   * @public
   * @param {OnlineEventName} eventName
   * @param {Function} callback
   */
  addEventListener(eventName, callback) {
    if (typeof callback !== 'function') {
      return;
    }
    if (eventName === 'connect') {
      this._connectListeners.push(callback);
    } else if (eventName === 'disconnect') {
      this._disconnectListeners.push(callback);
    }
  }

  /**
   * @public
   * @param {OnlineEventName} eventName
   * @param {Function} callback
   */
  removeEventListener(eventName, callback) {
    if (typeof callback !== 'function') {
      return;
    }
    if (eventName === 'connect') {
      const idx = this._connectListeners.indexOf(callback);
      idx >= 0 && this._connectListeners.splice(idx, 1);
    } else if (eventName === 'disconnect') {
      const idx = this._disconnectListeners.indexOf(callback);
      idx >= 0 && this._disconnectListeners.splice(idx, 1);
    }
  }
}

module.exports = Online;
