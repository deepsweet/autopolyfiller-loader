'use strict';

var loaderUtils = require('loader-utils');
var autopolyfiller = require('autopolyfiller');
var SourceMap = require('source-map');
var fs = require('fs');
var loadedDetects = {};

var formatMessage = function(name, message) {
    return (name ? name + ': ' : '') + message + '\n';
};

var AutopolyfillerLoaderError = function(name, message,  error) {
    Error.call(this);
    Error.captureStackTrace(this, AutopolyfillerLoaderError);

    this.name = 'AutopolyfillerLoaderError';
    this.message = formatMessage(name, message);
    this.error = error;
};

AutopolyfillerLoaderError.prototype = Object.create(Error.prototype);
AutopolyfillerLoaderError.prototype.constructor = AutopolyfillerLoaderError;

var getPolyfillPath = function(polyfill) {
    polyfill = polyfill
        .replace(/^Window\.prototype\./, '')
        .replace(/^base64$/, 'atob'); // fix #15
    if (!/^document\..+/.test(polyfill)) {
        polyfill = polyfill.replace(/\./g, '/');
    }

    return require.resolve('polyfill-service/polyfills/' + polyfill + '/polyfill');
};

var getPolyfillDetectPath = function(polyfill) {
    polyfill = polyfill
        .replace(/^Window\.prototype\./, '')
        .replace(/^base64$/, 'atob'); // fix #15
    if (!/^document\..+/.test(polyfill)) {
        polyfill = polyfill.replace(/\./g, '/');
    }

    return require.resolve('polyfill-service/polyfills/' + polyfill + '/detect');
};

var getPolyfillDetect = function(polyfill) {
    if (!loadedDetects[polyfill]) {
        var path = getPolyfillDetectPath(polyfill);
        loadedDetects[polyfill] = fs.readFileSync(path, { encoding: 'utf8' });
    }
    return loadedDetects[polyfill];
};

module.exports = function(source, sourceMap) {
    var polyfills;

    try {
        var query = loaderUtils.parseQuery(this.query);
        // array of browsers
        var browsers = query.browsers || [];
        // array of excluded polyfills
        var exclude = query.exclude || [];
        // array of included polyfills
        var include = query.include || [];
        // use custom parser
        var customParse = query.withParser || [
                require('acorn'),
                query.parserOptions || {}
            ];
        // use custom polyfills
        var uses = query.use || [];

        // array of polyfills names
        var prePolyfills = autopolyfiller(browsers);

        if (customParse.length) {
            prePolyfills = prePolyfills.withParser.apply(prePolyfills, customParse);
        }
        uses.forEach(function(use) {
            prePolyfills.use(use);
        });

        polyfills = prePolyfills.exclude(exclude).include(include).add(source).polyfills;

        if (this.cacheable) {
            this.cacheable();
        }

    }
    catch (err) {
        throw new AutopolyfillerLoaderError(err.name, 'Can\'t get polyfills list (' + err.message + ')', err);
    }
    if (polyfills.length) {
        var inject = '\n/* injects from autopolyfiller-loader */\n';

        try {
            // append require()s with absoluted paths to neccessary polyfills
            polyfills.forEach(function(polyfill) {
                var path = getPolyfillPath(polyfill);
                var test = getPolyfillDetect(polyfill);
                inject += 'if (!(' + test + ')) require(' + JSON.stringify(path) + ');';
                inject += '\n';
            });

            inject += '\n';
        }
        catch (err) {
            throw new AutopolyfillerLoaderError(err.name, 'Can\'t get polyfill\'s source (' + err.message + ')', err);
        }

        // support existing SourceMap
        // https://github.com/mozilla/source-map#sourcenode
        // https://github.com/webpack/imports-loader/blob/master/index.js#L34-L44
        // https://webpack.github.io/docs/loaders.html#writing-a-loader
        if (sourceMap) {
            var currentRequest = loaderUtils.getCurrentRequest(this);
            var SourceNode = SourceMap.SourceNode;
            var SourceMapConsumer = SourceMap.SourceMapConsumer;
            var sourceMapConsumer = new SourceMapConsumer(sourceMap);
            var node = SourceNode.fromStringWithSourceMap(source, sourceMapConsumer);

            node.prepend(inject);

            var result = node.toStringWithSourceMap({
                file: currentRequest
            });

            return void this.callback(null, result.code, result.map.toJSON());
        }

        // prepend collected inject at the top of file
        return inject + source;
    }

    // return the original source and sourceMap
    if (sourceMap) {
        return void this.callback(null, source, sourceMap);
    }

    // return the original source
    return source;
};
