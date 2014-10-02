'use strict';

var loaderUtils = require('loader-utils');
var autopolyfiller = require('autopolyfiller');
var SourceMap = require('source-map');

module.exports = function(source, sourceMap) {
    var query = loaderUtils.parseQuery(this.query);
    // array of browsers
    var browsers = query.browsers || [];
    // array of polyfills names
    var polyfills = autopolyfiller.apply(autopolyfiller, browsers).add(source).polyfills;

    if (this.cacheable) {
        this.cacheable();
    }

    if (polyfills.length) {
        var inject = '\n/* injects from autopolyfiller-loader */\n';

        // append require()s with absoluted paths to neccessary polyfills
        polyfills.forEach(function(polyfill) {
            inject += 'require("' + require.resolve('polyfill/source/' + polyfill) + '");';
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

            this.callback(null, result.code, result.map.toJSON());
            return;
        }

        // prepend collected inject at the top of file
        return inject + source;
    }

    // return the original source and sourceMap
    if (sourceMap) {
        this.callback(null, source, sourceMap);
        return;
    }

    // return the original source
    return source;
};
