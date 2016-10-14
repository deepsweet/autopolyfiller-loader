'use strict';

var loaderUtils = require('loader-utils');
var autopolyfiller = require('autopolyfiller');
var SourceMap = require('source-map');

var getPolyfillPath = function(polyfill) {
    polyfill = polyfill
        .replace(/^Window\.prototype\./, '')
        .replace(/^base64$/, 'atob'); // fix #15
    if (!/^document\..+/.test(polyfill)) {
        polyfill = polyfill.replace(/\./g, '/');
    }

    return require.resolve('polyfill-service/polyfills/' + polyfill + '/polyfill');
};

module.exports = function(source, sourceMap) {
    var query = loaderUtils.parseQuery(this.query);
    // array of browsers
    var browsers = query.browsers || [];
    // array of excluded polyfills
    var exclude = query.exclude || [];
    // array of included polyfills
    var include = query.include || [];
    // use custom parser
    var customParse = query.withParser || [];
    // use custom polyfills
    var uses = query.use || [];

    // array of polyfills names
    var prePolyfills = autopolyfiller(browsers);
    var polyfills;
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

    if (polyfills.length) {
        var inject = '\n/* injects from autopolyfiller-loader */\n';

        // append require()s with absoluted paths to neccessary polyfills
        polyfills.forEach(function(polyfill) {
            inject += 'require(' + JSON.stringify(getPolyfillPath(polyfill)) + ');';
            inject += '\n';
        });

        inject += '\n';

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
