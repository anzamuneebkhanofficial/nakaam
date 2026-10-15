export function createMongoRateLimitStorage(collection) {
  async function consume(key, rule) {
    const now = Date.now();
    const windowMs = rule.window * 1000;
    const expiresAt = new Date(now + windowMs);
    const current = await collection.findOne({ key });

    if (!current) {
      try {
        await collection.insertOne({
          key,
          count: 1,
          lastRequest: now,
          expiresAt,
        });
        return { allowed: true, retryAfter: null };
      } catch (error) {
        if (error.code !== 11000) throw error;
        return consume(key, rule);
      }
    }

    const windowElapsed = now - Number(current.lastRequest) >= windowMs;
    if (!windowElapsed && current.count >= rule.max) {
      return {
        allowed: false,
        retryAfter: Math.ceil((Number(current.lastRequest) + windowMs - now) / 1000),
      };
    }

    const update = windowElapsed
      ? { $set: { count: 1, lastRequest: now, expiresAt } }
      : { $inc: { count: 1 }, $set: { lastRequest: now, expiresAt } };
    const updated = await collection.findOneAndUpdate(
      {
        _id: current._id,
        lastRequest: current.lastRequest,
        ...(windowElapsed ? {} : { count: { $lt: rule.max } }),
      },
      update,
      { returnDocument: 'after', includeResultMetadata: false }
    );

    if (updated) return { allowed: true, retryAfter: null };
    return consume(key, rule);
  }

  return { consume };
}
