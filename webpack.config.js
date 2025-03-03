const Dotenv = require('dotenv-webpack');
const packageJson = require('./package.json');
const extensionConfig = require('./extension.js');
const { webpackConfigBuilder } = require('@ellucian/experience-extension');
module.exports = async (env, options) => {
    require('dotenv').config();
    const webpackConfig = await webpackConfigBuilder({
        extensionConfig,
        extensionVersion: packageJson.version,
        mode: options.mode || 'production',
        verbose: env.verbose || process.env.EXPERIENCE_EXTENSION_VERBOSE || false,
        upload: env.upload || process.env.EXPERIENCE_EXTENSION_UPLOAD || false,
        forceUpload: env.forceUpload || process.env.EXPERIENCE_EXTENSION_FORCE_UPLOAD || false,
        uploadToken: process.env.EXPERIENCE_EXTENSION_UPLOAD_TOKEN,
        liveReload: env.liveReload || false,
        port: process.env.PORT || 8082
    });
    // Add dotenv-webpack plugin
    webpackConfig.plugins.push(new Dotenv());
    return webpackConfig;
};