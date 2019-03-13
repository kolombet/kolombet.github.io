(function(global) {
  'use strict';
  var QUERY_STRING_TPL = '?op={operation}&app={app}&net={network}&cluster={cluster}&urlParams={params}&referrer={referrer}',
    POSSIBLE_EVENT_TAGS = [
      {
        tag: 'adCampaign',
        uri: 'https://tracker.x-plarium.com/tracker/canvas.ashx'
      },
      {
        tag: 'plid',
        uri: 'https://tracker.x-plarium.com/tracker/canvas.ashx'
      }
    ],
    POSSIBLE_PIXEL_TAGS = ['adPixel', 'pxl'];

  var customQueryString = null;

  //<editor-fold desc="PixelTracker Class">
  var PixelTracker = function(networkId, gameId, clusterNumber) {
    this._pixels = {};

    this._network = parseInt(networkId, 10) || null;

    if (!isPositiveInt(this._network)) {
      throw new Error('Network ID must be in a positive integer');
    }

    this._game = parseInt(gameId, 10) || null;

    if (!isPositiveInt(this._game)) {
      throw new Error('Game ID must be in a positive integer');
    }

    this._cluster = parseInt(clusterNumber, 10) || 0;

    if (!isPositiveInt(this._cluster)) {
      throw new Error('ClusterNumber must be in a positive integer');
    }
  };

  // constants
  PixelTracker.EVENT_CLICK   = 'click';
  PixelTracker.EVENT_AUTH    = 'auth';
  PixelTracker.EVENT_INSTALL = 'install';
  PixelTracker.EVENT_LOAD    = 'load';

  PixelTracker.prototype.constructor = PixelTracker;

  /**
   * Sets tracking condition condition
   *
   * @param {Function} condition
   * @throws {Error}
   * @returns {PixelTracker}
   */
  PixelTracker.prototype.if = function(condition) {
    if (!isFunction(condition)) {
      throw new Error('Condition must be in a function');
    }

    this._condition = condition;

    return this;
  };

  /**
   * Conditionally execute given action
   *
   * @returns {PixelTracker}
   */
  PixelTracker.prototype.maybe = function() {
    var args = Array.prototype.slice.call(arguments);

    // nothing given
    if (isEmpty(args)) {
      return null;
    }

    var action = args.shift();

    if (!isFunction(action)) {
      throw new Error('Unsure action must be in a function');
    }

    // execute action only if given condition is met
    if (this._condition()) {
      action.apply(this, args);
    }

    return this;
  };

  /**
   * Sets custom query string (vk, ok, mr networks).
   * @param query
   * @returns {PixelTracker}
   */
  PixelTracker.prototype.setQueryString = function(query) {
    if (query) {
      customQueryString = query;
    }

    return this;
  };

  /**
   * Sets custom query string obtained from object (mr network).
   * @param obj
   * @returns {PixelTracker}
   */
  PixelTracker.prototype.setQueryObject = function(obj) {
    var pairs = [];

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        pairs.push(key + '=' + obj[key]);
      }
    }

    this.setQueryString(pairs.join('&'));

    return this;
  };

  /**
   * User comes to the application
   *
   * @return {PixelTracker}
   */
  PixelTracker.prototype.click = function() {
    return this.maybe(this._insertPixel, PixelTracker.EVENT_CLICK);
  };

  /**
   * User is a new player. Need to show Login Dialog
   *
   * @return {PixelTracker}
   */
  PixelTracker.prototype.auth = function() {
    return this.maybe(this._insertPixel, PixelTracker.EVENT_AUTH);
  };

  /**
   * User is a new player. Login Dialog is shown.
   * User approved requested permissions and installed the game.
   *
   * @return {PixelTracker}
   */
  PixelTracker.prototype.install = function() {
    return this.maybe(this._insertPixel, PixelTracker.EVENT_INSTALL);
  };

  /**
   * Game is loading. Means that user is going to play.
   *
   * @return {PixelTracker}
   */
  PixelTracker.prototype.load = function() {
    return this.maybe(this._insertPixel, PixelTracker.EVENT_LOAD);
  };

  /**
   * Adds new pixel into insertion queue
   * If pixel with given name is already exist, it will be overwritten
   *
   * @param {String} pixelName
   * @param {Function} inserter
   * @param {String} tag
   * @returns {PixelTracker}
   */
  PixelTracker.prototype.addPixel = function(pixelName, inserter, tag) {
    if (!isNotEmptyString(pixelName)) {
      throw new Error('Pixel name must be in a string and must not be empty');
    }

    if (!isFunction(inserter)) {
      throw new Error('Pixel inserter must be in a function');
    }

    if (!isNotEmptyString(tag)) {
      throw new Error('Tag value must be in a string and must not be empty');
    }

    this._pixels[pixelName] = {
      action: inserter,
      tag: tag
    };

    return this;
  };

  PixelTracker.prototype.pixel = function(pixelName) {
    if (!hasNotEmptyProperty(this._pixels, pixelName)) {
      return null;
    }

    var pixel = this._pixels[pixelName];

    if (hasPixelTag(pixel.tag)) {
      this.maybe(pixel.action);
    }
  };

  /**
   * Inserts pixel element into the DOM
   *
   * @param  {String} eventType
   * @returns {PixelTracker}
   * @throws {Error}
   * @private
   */
  PixelTracker.prototype._insertPixel = function(eventType) {
    if (!isNotEmptyString(eventType)) {
      throw new Error('Event type must be in a not empty string');
    }

    var knownEvents = [
      PixelTracker.EVENT_CLICK,
      PixelTracker.EVENT_AUTH,
      PixelTracker.EVENT_INSTALL,
      PixelTracker.EVENT_LOAD
    ];

    if (!contains(eventType, knownEvents)) {
      throw new Error('Event type must be one of known events: ' + knownEvents.join(', '));
    }

    var trackingUri = this._getTrackingUri(eventType);

    if (isEmpty(trackingUri)) {
      // silently abort tracking
      return this;
    }

    var image = document.createElement('img');
    image.style.height = '1px';
    image.style.width = '1px';
    image.style.visibility = 'hidden';
    image.src = trackingUri;

    document.body.appendChild(image);

    return this;
  };

  /**
   * Builds tracking url for specified event
   *
   * @param {String} event
   * @returns {Null|String}
   * @private
   */
  PixelTracker.prototype._getTrackingUri = function(event) {
    var baseUri = getTrackingBaseUri();

    if (isEmpty(baseUri)) {
      return null;
    }

    return baseUri + QUERY_STRING_TPL.replace('{operation}', event)
      .replace('{app}',      encodeURIComponent(this._game))
      .replace('{network}',  encodeURIComponent(this._network))
      .replace('{cluster}',  encodeURIComponent(this._cluster))
      .replace('{params}',   encodeURIComponent(getDocumentQueryString()))
      .replace('{referrer}', encodeURIComponent(getDocumentReferrer()));
  };
  //</editor-fold>

  //<editor-fold desc="Helpers">
  /**
   * Checks that given value is in an integer and equal or more that 0
   *
   * @param {*} number
   * @returns {Boolean}
   */
  function isPositiveInt(number) {
    return (Number(number) === number) && (number % 1 === 0) && (-1 < number);
  }

  /**
   * Checks that given values is in a string and not empty
   *
   * @param {String} string
   * @returns {Boolean}
   */
  function isNotEmptyString(string) {
    return ('string' == typeof string) && string.length;
  }

  /**
   * Checks that given value is in a function
   *
   * @param {*} func
   * @returns {Boolean}
   */
  function isFunction(func) {
    return ('function' === typeof func);
  }

  /**
   * Checks that given value is in array
   *
   * @param {*} object
   * @param {Array} variants
   * @returns {Boolean}
   */
  function contains(object, variants) {
    return (-1 < variants.indexOf(object));
  }

  /**
   * Returns tracking base URI according to pixel presented in document URI
   *
   * @returns {Null|String}
   */
  function getTrackingBaseUri() {
    var queryParams = decodeQueryString(getDocumentQueryString()),
      pixelsCount = POSSIBLE_EVENT_TAGS.length,
      i = 0, current = null, pixel;

    for (; i < pixelsCount; i++) {
      pixel = POSSIBLE_EVENT_TAGS[i];

      if (hasNotEmptyProperty(queryParams, pixel.tag)) {
        current = pixel;
      }
    }

    if (isEmpty(current)) {
      return null;
    }

    return current.uri;
  }

  /**
   * Returns document query string
   *
   * @returns {String}
   */
  function getDocumentQueryString() {
    return customQueryString || document.location.search.substr(1);
  }

  /**
   * Returns document referrer
   *
   * @returns {String}
   */
  function getDocumentReferrer() {
    return document.referrer;
  }

  /**
   * Converts document query string to object
   *
   * @param {String} queryString
   * @returns {Object}
   */
  function decodeQueryString(queryString) {
    queryString = decodeURI(queryString);

    var queries = queryString.split('&'),
      queriesCount = queries.length,
      i = 0, params,
      queryObject = {};

    for (; i < queriesCount; i++) {
      params = queries[i].split('=');
      queryObject[params[0]] = decodeURIComponent(params[1]) || null;
    }

    return queryObject;
  }

  /**
   * Checks that given value is not empty
   *
   * @param {*} object
   * @returns {Boolean}
   */
  function isEmpty(object) {
    if (!object) {
      return true;
    }

    if (0 < object.length) {
      return false;
    }

    if (0 === object.length) {
      return true;
    }

    for (var key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks that object has given property and property is not empty
   *
   * @param {Object} object
   * @param {String} prop
   * @returns {Boolean}
   */
  function hasNotEmptyProperty(object, prop) {
    return object.hasOwnProperty(prop) && !isEmpty(object[prop]);
  }

  /**
   * Does document query string contain given pixel tag
   *
   * @param {String} tag
   * @returns {Boolean}
   */
  function hasPixelTag(tag) {
    var queryParams = decodeQueryString(getDocumentQueryString()),
      possibleTagsCount = POSSIBLE_PIXEL_TAGS.length,
      i = 0;

    for (; i < possibleTagsCount; i++) {
      if (hasNotEmptyProperty(queryParams, POSSIBLE_PIXEL_TAGS[i])
        && (tag == queryParams[POSSIBLE_PIXEL_TAGS[i]])) {
        return true;
      }
    }

    return false;
  }
  //</editor-fold>

  global.Plarium = global.Plarium || {};
  global.Plarium.PixelTracker = PixelTracker;

})(window);