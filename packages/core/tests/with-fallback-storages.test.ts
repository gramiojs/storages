import { describe, expect, it } from "bun:test";
import { inMemoryStorage } from "../src";
import { withFallbackStorages } from "../src/with-fallback-storages";

describe("withFallbackStorages", () => {
	it("should get value from first available storage", async () => {
		const primary = inMemoryStorage();
		const secondary = inMemoryStorage();
		const fallback = withFallbackStorages([primary, secondary]);

		await secondary.set("testKey", "fallbackValue");
		expect(await fallback.get("testKey")).toBe("fallbackValue");

		await primary.set("testKey", "primaryValue");
		expect(await fallback.get("testKey")).toBe("primaryValue");
	});

	it("should return undefined when no storages have key", async () => {
		const storage = withFallbackStorages([inMemoryStorage()]);
		expect(await storage.get("nonExistent")).toBeUndefined();
	});

	it("should set value to all storages", async () => {
		const storages = [inMemoryStorage(), inMemoryStorage()];
		const fallback = withFallbackStorages(storages);

		await fallback.set("sharedKey", "value");

		for (const s of storages) {
			expect(await s.get("sharedKey")).toBe("value");
		}
	});

	it("should return true if any storage has key", async () => {
		const [s1, s2] = [inMemoryStorage(), inMemoryStorage()];
		const fallback = withFallbackStorages([s1, s2]);

		await s2.set("testKey", "value");
		expect(await fallback.has("testKey")).toBeTrue();
	});

	it("should delete key from all storages", async () => {
		const [s1, s2] = [inMemoryStorage(), inMemoryStorage()];
		const fallback = withFallbackStorages([s1, s2]);

		await s1.set("testKey", "v1");
		await s2.set("testKey", "v2");

		await fallback.delete("testKey");

		expect(await s1.has("testKey")).toBeFalse();
		expect(await s2.has("testKey")).toBeFalse();
	});

	it("should handle empty storages array", async () => {
		const storage = withFallbackStorages([]);
		expect(await storage.get("anyKey")).toBeUndefined();
		expect(await storage.has("anyKey")).toBeFalse();
	});
});
