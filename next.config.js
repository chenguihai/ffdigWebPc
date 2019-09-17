/* eslint-disable */
// const withLess = require('@zeit/next-less');
//
// // fix: prevents error when .css files are required by node
// module.exports = withLess({
//     // cssModules: true,
//     lessLoaderOptions: {
//         javascriptEnabled: true,
//         importLoaders: 1,
//         localIdentName: "[local]___[hash:base64:5]",
//
//     },
// });


/* eslint-disable */
const withLess = require('@zeit/next-less');
const lessToJS = require('less-vars-to-js');
const fs = require('fs');
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const withPlugins = require('next-compose-plugins');
const optimizedImages = require('next-optimized-images');
// Where your antd-custom.less file lives
const themeVariables = lessToJS(
    fs.readFileSync(path.resolve(__dirname, './assets/antd-custom.less'), 'utf8')
);

// fix: prevents error when .less files are required by node
if (typeof require !== 'undefined') {
    require.extensions['.less'] = file => {
    }
}
module.exports = withPlugins([
    [optimizedImages, {
        /* config for next-optimized-images */
        inlineImageLimit: 8192,
        imagesFolder: 'images',
        imagesName: '[name]-[hash].[ext]',
        handleImages: ['jpeg', 'png', 'svg', 'webp', 'gif'],
        optimizeImages: true,
        optimizeImagesInDev: false,
        mozjpeg: {
            quality: 80,
        },
        optipng: {
            optimizationLevel: 3,
        },
        pngquant: false,
        gifsicle: {
            interlaced: true,
            optimizationLevel: 3,
        },
        svgo: {
            // enable/disable svgo plugins here
        },
        webp: {
            preset: 'default',
            quality: 75,
        },
    }],

    // your other plugins here

]);
module.exports = withLess({
    lessLoaderOptions: {
        javascriptEnabled: true,
        modifyVars: themeVariables, // make your antd custom effective
    },
    webpack: function (cfg) {
        const originalEntry = cfg.entry;
        cfg.entry = async () => {
            const entries = await originalEntry();

            if (
                entries['main.js'] &&
                !entries['main.js'].includes('./client/polyfills.js')
            ) {
                entries['main.js'].unshift('./client/polyfills.js')
            }

            return entries
        };
        cfg.plugins.push(new CompressionPlugin());
        return cfg
    }
});
