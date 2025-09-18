// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

// ضع هنا مسار الويب آب تبع Apps Script (جزء /exec)
const EXEC_PATH = "https://script.google.com/macros/s/AKfycbxJpt4o2rHt1cgdFRP1nxhPEpDyLOQW7k-rjlicRMPp9PMLwUsflqM4qTt2XuuUSpWc/exec";

module.exports = function (app) {
  app.use(
    "/api/feedback",
    createProxyMiddleware({
      target: "https://script.google.com",
      changeOrigin: true,
      pathRewrite: { "^/api/feedback": EXEC_PATH },
    })
  );
};
