const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://api.data.go.kr',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '' // /api를 지우고 뒷부분만 타겟 서버로 보냅니다.
      }
    })
  );
};