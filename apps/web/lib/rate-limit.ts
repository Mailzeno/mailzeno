import { Redis } from "@upstash/redis";
import { PLAN_CONFIG, PlanType } from "@/lib/plans";

const redis = Redis.fromEnv();

type Scope = "api" | "user";

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  remaining: number;
  limit: number;
  reset: number;
}

export async function checkRateLimit(
  identifier: string,
  plan: PlanType,
  scope: Scope
): Promise<RateLimitResult> {
  try {
    const config = PLAN_CONFIG[plan];
    const now = Date.now();

    const minuteBucket = Math.floor(now / 60000);
    const dayBucket = new Date(now).toISOString().slice(0, 10);

    const minuteKey = `rl:${scope}:${identifier}:m:${minuteBucket}`;
    const dayKey = `rl:${scope}:${identifier}:d:${dayBucket}`;

    const secondsLeftInMinute = 60 - Math.floor((now / 1000) % 60);

    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);

    const secondsLeftInDay = Math.max(
      1,
      Math.floor((midnight.getTime() - now) / 1000)
    );

    const pipeline = redis.pipeline();

    pipeline.incr(minuteKey);
    pipeline.ttl(minuteKey);
    pipeline.incr(dayKey);
    pipeline.ttl(dayKey);

    const results = await pipeline.exec();

    const minuteCount = results[0] as number;
    const minuteTtl = results[1] as number;
    const dayCount = results[2] as number;
    const dayTtl = results[3] as number;

    // Set expiry if first hit
    if (minuteCount === 1 || minuteTtl === -1) {
      await redis.expire(minuteKey, secondsLeftInMinute);
    }

    if (dayCount === 1 || dayTtl === -1) {
      await redis.expire(dayKey, secondsLeftInDay);
    }

    // Minute limit check
    if (minuteCount > config.perMinuteLimit) {
      return {
        allowed: false,
        retryAfter: secondsLeftInMinute,
        remaining: 0,
        limit: config.perMinuteLimit,
        reset: Math.floor(now / 1000) + secondsLeftInMinute,
      };
    }

    // Daily limit check
    if (dayCount > config.dailyLimit) {
      return {
        allowed: false,
        retryAfter: secondsLeftInDay,
        remaining: 0,
        limit: config.dailyLimit,
        reset: Math.floor(midnight.getTime() / 1000),
      };
    }

    return {
      allowed: true,
      remaining: Math.min(
        config.perMinuteLimit - minuteCount,
        config.dailyLimit - dayCount
      ),
      limit: config.perMinuteLimit,
      reset: Math.floor(now / 1000) + secondsLeftInMinute,
    };

  } catch (error) {
    console.error("[Rate Limit Error]", error);

    // Fail-open (don’t block users if Redis fails)
    return {
      allowed: true,
      remaining: 0,
      limit: 0,
      reset: Math.floor(Date.now() / 1000),
    };
  }
}