//middlewares/cacheMiddleware.js
const CacheUtils = require("../utils/cacheUtils");

// Generic cache middleware
const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      const cacheKey =
        typeof keyGenerator === "function" ? keyGenerator(req) : keyGenerator;

      const cachedData = await CacheUtils.get(cacheKey);

      if (cachedData) {
        return res.send(cachedData);
      }

      // Store original res.send
      const originalSend = res.send;

      // Override res.send to cache successful responses
      res.send = function (data) {
        if (data && data.success) {
          CacheUtils.set(cacheKey, data, ttl);
        }
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

module.exports = cacheMiddleware;
