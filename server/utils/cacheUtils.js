//utils/cacheUtils.js - Improved Version
const redis = require("../config/redisConfig");

class CacheUtils {
  static async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  static async set(key, data, ttl = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  static async del(key) {
    try {
      const result = await redis.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  static async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        const result = await redis.del(...keys);
        return result > 0;
      }
      return true;
    } catch (error) {
      console.error(
        `Cache delete pattern error for pattern ${pattern}:`,
        error
      );
      return false;
    }
  }

  static async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  static async getTTL(key) {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
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

  static getPendingRequestsKey(userId) {
    return `pending-requests:${userId}`;
  }

  static getSentRequestsKey(userId) {
    return `sent-requests:${userId}`;
  }

  static getRequestKey(requestId) {
    return `request:${requestId}`;
  }

  static getQRCodeKey(userId) {
    return `qr:${userId}`;
  }

  // Cache invalidation helpers
  static async invalidateUserCache(userId) {
    const keys = [
      this.getUserKey(userId),
      this.getAllUsersKey(),
      this.getUserTransactionsKey(userId),
      this.getUserRequestsKey(userId),
      this.getPendingRequestsKey(userId),
      this.getSentRequestsKey(userId),
    ];

    const promises = keys.map((key) => this.del(key));
    await Promise.all(promises);
  }

  static async invalidateTransactionCache(userId) {
    await this.del(this.getUserTransactionsKey(userId));
  }

  static async invalidateRequestCache(userId) {
    const keys = [
      this.getUserRequestsKey(userId),
      this.getPendingRequestsKey(userId),
      this.getSentRequestsKey(userId),
    ];

    const promises = keys.map((key) => this.del(key));
    await Promise.all(promises);
  }

  static async invalidateAllRequestCaches(userId) {
    // Use pattern matching to delete all request-related caches for a user
    const patterns = [`*requests*:${userId}`, `request:*`];

    for (const pattern of patterns) {
      await this.delPattern(pattern);
    }
  }

  // Utility method for cache warming
  static async warmCache(key, dataFetcher, ttl = 3600) {
    try {
      const exists = await this.exists(key);
      if (!exists) {
        const data = await dataFetcher();
        if (data) {
          await this.set(key, data, ttl);
        }
      }
    } catch (error) {
      console.error(`Cache warming error for key ${key}:`, error);
    }
  }

  // Health check method
  static async healthCheck() {
    try {
      const testKey = "health:check";
      await this.set(testKey, { timestamp: Date.now() }, 10);
      const result = await this.get(testKey);
      await this.del(testKey);
      return !!result;
    } catch (error) {
      console.error("Cache health check failed:", error);
      return false;
    }
  }
}

module.exports = CacheUtils;
