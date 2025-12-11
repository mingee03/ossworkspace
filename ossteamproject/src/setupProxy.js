const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://api.data.go.kr',
      changeOrigin: true,
      pathRewrite: {
        '^/api': ''
      }
    })
  );
};