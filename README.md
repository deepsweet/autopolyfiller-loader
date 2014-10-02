## [Autopolyfiller](https://github.com/azproduction/autopolyfiller) loader for [webpack](https://webpack.github.io/)

[![travis](http://img.shields.io/travis/deepsweet/autopolyfiller-loader.svg?style=flat-square)](https://travis-ci.org/deepsweet/autopolyfiller-loader)
[![npm](http://img.shields.io/npm/v/autopolyfiller-loader.svg?style=flat-square)](https://www.npmjs.org/package/autopolyfiller-loader)
[![peer deps](http://img.shields.io/david/peer/deepsweet/autopolyfiller-loader.svg?style=flat-square)](https://david-dm.org/deepsweet/autopolyfiller-loader#info=peerDependencies)
[![dev deps](http://img.shields.io/david/dev/deepsweet/autopolyfiller-loader.svg?style=flat-square)](https://david-dm.org/deepsweet/autopolyfiller-loader#info=devDependencies)
![unicorn approved](http://img.shields.io/badge/unicorn-approved-ff69b4.svg?style=flat-square)

> This is like [Autoprefixer](https://github.com/ai/autoprefixer), but for JavaScript polyfills. It scans your code and applies only required polyfills.

### Install

```sh
npm i -S autopolyfiller-loader
```

### Usage

```javascript
postLoaders: [ {
    test: /\.js$/,
    exclude: /\/(node_modules|bower_components)\//,
    loader: 'autopolyfiller'
} ]
```

[Documentation: Using loaders](https://webpack.github.io/docs/using-loaders.html).

### License
[WTFPL](http://www.wtfpl.net/wp-content/uploads/2012/12/wtfpl-strip.jpg)
