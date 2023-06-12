
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
    app.use( '/proof',
        createProxyMiddleware({
            target: 'http://localhost:1224/',
            changeOrigin: true,
        })
    );
};
