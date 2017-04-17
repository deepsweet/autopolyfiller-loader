## [Autopolyfiller](https://github.com/azproduction/autopolyfiller) loader for [webpack](https://webpack.github.io/)

[![npm](http://img.shields.io/npm/v/autopolyfiller-loader.svg?style=flat-square)](https://www.npmjs.org/package/autopolyfiller-loader)
[![travis](http://img.shields.io/travis/deepsweet/autopolyfiller-loader.svg?style=flat-square)](https://travis-ci.org/deepsweet/autopolyfiller-loader)
[![climate](http://img.shields.io/codeclimate/github/deepsweet/autopolyfiller-loader.svg?style=flat-square)](https://codeclimate.com/github/deepsweet/autopolyfiller-loader/code)
[![deps](http://img.shields.io/david/deepsweet/autopolyfiller-loader.svg?style=flat-square)](https://david-dm.org/deepsweet/autopolyfiller-loader)
[![gratipay](http://img.shields.io/gratipay/deepsweet.svg?style=flat-square)](https://gratipay.com/deepsweet/)

> This is like [Autoprefixer](https://github.com/ai/autoprefixer), but for JavaScript polyfills. It scans your code and applies only required polyfills.

### Install

```sh
$ npm i -S autopolyfiller-loader
```

### Usage

```js
module: {
    rules: [ {
        enforce: 'post',
        test: /\.js$/,
        exclude: /\/(node_modules|bower_components)\//,
        loader: 'autopolyfiller-loader',
        query: {
          browsers: [ 'last 2 versions', 'ie >= 9' ], //list of browsers to polyfill
          withParser: ['acorn@0.11.0', {ecmaVersion: 6}], //allow use custom parser
          parserOptions: {ecmaVersion: 6}, // only if no #withParser specified,
                                           // allow to use custom options with acorn v4 parser 
          exclude: ['Promise'], //exclude some polyfills
          include: ['Object.create'], //force include some polifills
          use: [{
                    // AST tree pattern matching
                    // It may "grep" multiply polyfills
                    test: function (ast) {
                        return query('Object.newFeature(_$)', ast).length > 0 ? ['Object.newFeature'] : [];
                    },

                    // Your polyfills code
                    polyfill: {
                        'Object.newFeature': 'Object.newFeature = function () {};'
                    },

                    // This list means "apply this feature to the <list of browsers>"
                    // For more examples see https://github.com/jonathantneal/polyfill/blob/master/agent.js.json
                    support: {
                        // For chrome 29 only apply Object.newFeature polyfill
                        'Chrome': [{
                            only: '29',
                            fill: 'Object.newFeature'
                        }]
                    },

                    // This is optional. By default autopolyfiller will use
                    // polyfill's name to generate condition's code:
                    wrapper: {
                        'Object.newFeature': {
                            'before': 'if (!("newFeature" in Object)) {',
                            'after': '}'
                        }
                    }
                }] //add custom polyfills
        }
    } ]
}
```

[Documentation: Using loaders](https://webpack.github.io/docs/using-loaders.html).

### License
[WTFPL](http://www.wtfpl.net/wp-content/uploads/2012/12/wtfpl-strip.jpg)
