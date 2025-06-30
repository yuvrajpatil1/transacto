//utils/cacheUtils.js
const redis = require("../config/redis");

class CacheUtils {
  static async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  static async set(key, data, ttl = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  static async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  static async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error("Cache delete pattern error:", error);
      return false;
    }
  }

  // Cache keys generators
  static getUserKey(userId) {
    return `user:${userId}`;
  }

  static getAllUsersKey() {
    return "users:all";
  }

  static getUserTransactionsKey(userId) {
    return `transactions:user:${userId}`;
  }

  static getUserRequestsKey(userId) {
    return `requests:user:${userId}`;
  }

  static getQRCodeKey(userId) {
    return `qr:${userId}`;
  }

  // Cache invalidation helpers
  static async invalidateUserCache(userId) {
    await this.del(this.getUserKey(userId));
    await this.del(this.getAllUsersKey());
    await this.del(this.getUserTransactionsKey(userId));
    await this.del(this.getUserRequestsKey(userId));
  }

  static async invalidateTransactionCache(userId) {
    await this.del(this.getUserTransactionsKey(userId));
  }

  static async invalidateRequestCache(userId) {
    await this.del(this.getUserRequestsKey(userId));
  }
}

module.exports = CacheUtils;
