import type { Storage } from "@gramio/storage";
import type { RedisOptions } from "bun";
import { RedisClient } from "bun";

export interface RedisStorageOptions extends RedisOptions {
	url?: string;
	/** time to live in seconds */
	$ttl?: number;
}

export function redisStorage<Data extends Record<string, any>>(
	optionsRaw: RedisStorageOptions | RedisClient = {},
): Storage<Data> {
	const isInstance = optionsRaw instanceof RedisClient;
	const options = isInstance ? {} : optionsRaw;
	const storage = isInstance
		? optionsRaw
		: new RedisClient(options.url, options);

	return {
		async get<K extends keyof Data>(key: K) {
			const data = await storage.get(String(key));

			return data ? (JSON.parse(data) as Data[K]) : undefined;
		},
		async has<K extends keyof Data>(key: K) {
			return !!(await storage.get(String(key)));
		},
		async set<K extends keyof Data>(key: K, value: Data[K]) {
			const data = JSON.stringify(value);

			if (options.$ttl)
				await storage.set(String(key), data, "EX", options.$ttl);
			else await storage.set(String(key), data);
		},
		async delete<K extends keyof Data>(key: K) {
			const result = await storage.del(String(key));

			return result === 1;
		},
	};
}
