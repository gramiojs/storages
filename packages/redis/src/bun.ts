import type { Storage } from "@gramio/storage";
import { RedisClient, type RedisOptions } from "bun";

export interface RedisStorageOptions extends RedisOptions {
	url?: string;
	/** time to live in seconds */
	$ttl?: number;
}

export function redisStorage(
	optionsRaw: RedisStorageOptions | RedisClient = {},
): Storage {
	const isInstance = optionsRaw instanceof RedisClient;
	const options = isInstance ? {} : optionsRaw;
	const storage = isInstance
		? optionsRaw
		: new RedisClient(options.url, options);

	return {
		async get(key) {
			const data = await storage.get(key);

			return data ? JSON.parse(data) : undefined;
		},
		async has(key) {
			return !!(await storage.get(key));
		},
		async set(key, value) {
			const data = JSON.stringify(value);

			if (options.$ttl) await storage.set(key, data, "EX", options.$ttl);
			else await storage.set(key, data);
		},
		async delete(key) {
			const result = await storage.del(key);

			return result === 1;
		},
	};
}
