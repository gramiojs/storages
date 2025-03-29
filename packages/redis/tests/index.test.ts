import { describe, expect, it } from "bun:test";

import { type RedisStorageOptions, redisStorage } from "../src";

import Redis from "ioredis";

describe("redisStorage", () => {
	it("should set and get a value", async () => {
		const storage = redisStorage();
		await storage.set("key1", "value1");
		const value = await storage.get("key1");
		expect(value).toBe("value1");
	});

	it("should return undefined for a non-existent key", async () => {
		const storage = redisStorage();
		const value = await storage.get("nonExistentKey");
		expect(value).toBeUndefined();
	});

	it("should check if a key exists", async () => {
		const storage = redisStorage();
		await storage.set("key2", "value2");
		const exists = await storage.has("key2");
		expect(exists).toBeTrue();
		const nonExistent = await storage.has("nonExistentKey");
		expect(nonExistent).toBeFalse();
	});

	it("should delete a key", async () => {
		const storage = redisStorage();
		await storage.set("key3", "value3");
		const existsBeforeDelete = await storage.has("key3");
		expect(existsBeforeDelete).toBeTrue();
		await storage.delete("key3");
		const existsAfterDelete = await storage.has("key3");
		expect(existsAfterDelete).toBeFalse();
	});

	it("should return true when deleting an existing key", async () => {
		const storage = redisStorage();
		await storage.set("key4", "value4");
		const result = await storage.delete("key4");
		expect(result).toBeTrue();
	});

	it("should return false when deleting a non-existent key", async () => {
		const storage = redisStorage();
		const result = await storage.delete("nonExistentKey");
		expect(result).toBeFalse();
	});

	it("should set and get a complex object", async () => {
		const storage = redisStorage();
		const complexObject = {
			id: 1,
			name: "Test Object",
			details: {
				description: "This is a test object",
				active: true,
			},
		};

		await storage.set("complexKey", complexObject);
		const retrievedObject = await storage.get("complexKey");
		expect(retrievedObject).toEqual(complexObject);
	});

	it("should respect the TTL option", async () => {
		const ttlOptions: RedisStorageOptions = {
			$ttl: 1,
		};
		const storage = redisStorage(ttlOptions);

		await storage.set("ttlKey", "ttlValue");
		const existsBeforeTTL = await storage.has("ttlKey");
		expect(existsBeforeTTL).toBeTrue();

		// Wait for TTL to expire
		await new Promise((resolve) => setTimeout(resolve, 1100));

		const existsAfterTTL = await storage.has("ttlKey");
		expect(existsAfterTTL).toBeFalse();
	});
	it("should use keyPrefix correctly", async () => {
		const prefix = "@custom/prefix:";

		const customPrefixOptions: RedisStorageOptions = {
			keyPrefix: prefix,
		};

		const storage = redisStorage(customPrefixOptions);

		await storage.set("key", "value");
		const value = await storage.get("key");
		expect(value).toBe("value");

		const redis = new Redis();
		const string = await redis.get(`${prefix}key`);

		if (!string) throw new Error("Key not found");

		expect(JSON.parse(string)).toBe("value");
	});
});
