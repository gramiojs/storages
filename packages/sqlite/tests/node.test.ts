import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { describe, it } from "node:test";
import { type SqliteStorageOptions, sqliteStorage } from "../src/node";

const db = new DatabaseSync(":memory:");

describe("sqliteStorage (node)", () => {
	it("should set and get a value", async () => {
		const storage = sqliteStorage({ db });
		await storage.set("key1", "value1");
		const value = await storage.get("key1");
		assert.strictEqual(value, "value1");
	});

	it("should return undefined for a non-existent key", async () => {
		const storage = sqliteStorage({ db });
		const value = await storage.get("nonExistentKey");
		assert.strictEqual(value, undefined);
	});

	it("should check if a key exists", async () => {
		const storage = sqliteStorage({ db });
		await storage.set("key2", "value2");
		const exists = await storage.has("key2");
		assert.strictEqual(exists, true);
		const nonExistent = await storage.has("nonExistentKey");
		assert.strictEqual(nonExistent, false);
	});

	it("should delete a key", async () => {
		const storage = sqliteStorage({ db });
		await storage.set("key3", "value3");
		const existsBeforeDelete = await storage.has("key3");
		assert.strictEqual(existsBeforeDelete, true);
		await storage.delete("key3");
		const existsAfterDelete = await storage.has("key3");
		assert.strictEqual(existsAfterDelete, false);
	});

	it("should return true when deleting an existing key", async () => {
		const storage = sqliteStorage({ db });
		await storage.set("key4", "value4");
		const result = await storage.delete("key4");
		assert.strictEqual(result, true);
	});

	it("should return false when deleting a non-existent key", async () => {
		const storage = sqliteStorage({ db });
		const result = await storage.delete("nonExistentKey");
		assert.strictEqual(result, false);
	});

	it("should set and get a complex object", async () => {
		const storage = sqliteStorage({ db });
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
		assert.deepStrictEqual(retrievedObject, complexObject);
	});

	it("should respect the TTL option", async () => {
		const ttlOptions: SqliteStorageOptions = {
			$ttl: 1,
			db,
		};
		const storage = sqliteStorage(ttlOptions);

		await storage.set("ttlKey", "ttlValue");
		const existsBeforeTTL = await storage.has("ttlKey");
		assert.strictEqual(existsBeforeTTL, true);

		// Wait for TTL to expire
		await new Promise((resolve) => setTimeout(resolve, 1100));

		const existsAfterTTL = await storage.has("ttlKey");
		assert.strictEqual(existsAfterTTL, false);
	});
});
