'use strict';

var loaderUtils = require('loader-utils');
var autopolyfiller = require('autopolyfiller');

module.exports = function(source) {
    var query = loaderUtils.parseQuery(this.query);
    var browsers = query.browsers || [];
    var polyfills = autopolyfiller.apply(autopolyfiller, browsers).add(source).polyfills;
    var inject = '';

    if (this.cacheable) {
        this.cacheable();
    }

    // append require()s with absoluted paths to neccessary polyfills
    polyfills.forEach(function(polyfill) {
        inject += '\nrequire("' + require.resolve('polyfill/source/' + polyfill) + '");\n';
    });

    // inject collected string at the top of file
    if (inject) {
        return inject + '\n' + source;
    }

    return source;
};
