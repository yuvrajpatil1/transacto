const CacheUtils = require("../utils/cacheUtils");

const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      const cacheKey =
        typeof keyGenerator === "function" ? keyGenerator(req) : keyGenerator;

      const cachedData = await CacheUtils.get(cacheKey);

      if (cachedData) {
        return res.send(cachedData);
      }

      const originalSend = res.send;

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
