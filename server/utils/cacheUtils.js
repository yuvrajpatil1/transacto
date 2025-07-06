const redis = require("../config/redisConfig");

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

  static async getFromCache(key) {
    return this.get(key);
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

  static async setCache(key, data, ttl = 3600) {
    return this.set(key, data, ttl);
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

  static async deleteFromCache(key) {
    return this.del(key);
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

  static getQRCodeKey(userId) {
    return `qr:${userId}`;
  }

  static getRequestKey(requestId) {
    return `request:${requestId}`;
  }

  static async invalidateUserCache(userId) {
    try {
      const keysToDelete = [
        this.getUserKey(userId),
        this.getAllUsersKey(),
        this.getUserTransactionsKey(userId),
        this.getUserRequestsKey(userId),
        this.getPendingRequestsKey(userId),
        this.getSentRequestsKey(userId),
      ];

      for (const key of keysToDelete) {
        await this.del(key);
      }

      console.log(`Invalidated user cache for user: ${userId}`);
      return true;
    } catch (error) {
      console.error("Error invalidating user cache:", error);
      return false;
    }
  }

  static async invalidateTransactionCache(userId) {
    try {
      await this.del(this.getUserTransactionsKey(userId));
      console.log(`Invalidated transaction cache for user: ${userId}`);
      return true;
    } catch (error) {
      console.error("Error invalidating transaction cache:", error);
      return false;
    }
  }

  static async invalidateRequestCache(userId) {
    try {
      const keysToDelete = [
        this.getUserRequestsKey(userId),
        this.getPendingRequestsKey(userId),
        this.getSentRequestsKey(userId),
      ];

      for (const key of keysToDelete) {
        await this.del(key);
      }

      console.log(`Invalidated request cache for user: ${userId}`);
      return true;
    } catch (error) {
      console.error("Error invalidating request cache:", error);
      return false;
    }
  }

  static async clearAllCache() {
    try {
      await redis.flushall();
      console.log("All cache cleared");
      return true;
    } catch (error) {
      console.error("Error clearing all cache:", error);
      return false;
    }
  }

  static async getCacheInfo() {
    try {
      const info = await redis.info("memory");
      console.log("Cache info:", info);
      return info;
    } catch (error) {
      console.error("Error getting cache info:", error);
      return null;
    }
  }
}

module.exports = CacheUtils;
