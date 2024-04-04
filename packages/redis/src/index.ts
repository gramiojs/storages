import type { Storage } from "@gramio/storage";
import Redis, { type RedisOptions } from "ioredis";

export interface RedisStorageOptions extends RedisOptions {
	/** time to live in seconds */
	ttl?: number;
}

export function redisStorage(options: RedisStorageOptions = {}): Storage {
	options.keyPrefix = options.keyPrefix ?? "@gramio/storage:";
	const storage = new Redis(options);

	return {
		async get(key) {
			const data = await storage.get(key);

			return data ? JSON.parse(data) : undefined;
		},
		async has(key) {
			return !!(await storage.get(key));
		},
		async set(key, value) {
			await storage.set(key, JSON.stringify(value));
			if (options.ttl) await storage.expire(key, options.ttl);
		},
		async delete(key) {
			const result = await storage.del(key);

			return result === 1;
		},
	};
}
