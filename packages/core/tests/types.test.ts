import { describe, expect, test } from "bun:test";
import { inMemoryStorage } from "../src/in-memory-storage.ts";

describe("Storage typed keys", () => {
	test("should support Record with template literal types", () => {
		type T = Record<`Test${number}`, number> &
			Record<`Something${number}`, string>;

		const storage = inMemoryStorage<T>();

		storage.set("Test1", 42);
		storage.set("Something1", "hello");

		const v1 = storage.get("Test1");
		const v2 = storage.get("Something1");

		expect(v1).toBe(42);
		expect(v2).toBe("hello");
	});

	test("should handle has() with typed keys", () => {
		type T = Record<`Key${number}`, boolean>;
		const storage = inMemoryStorage<T>();


		const a = storage.get("Key1");

		storage.set("Key1", true);

		expect(storage.has("Key1")).toBe(true);
		expect(storage.has("Key2")).toBe(false);
	});

	test("should handle delete() with typed keys", () => {
		type T = Record<`Item${number}`, string>;
		const storage = inMemoryStorage<T>();

		storage.set("Item1", "value");
		expect(storage.has("Item1")).toBe(true);

		const deleted = storage.delete("Item1");
		expect(deleted).toBe(true);
		expect(storage.has("Item1")).toBe(false);
	});

	test("should return undefined for non-existent keys", () => {
		type T = Record<`Data${number}`, number>;
		const storage = inMemoryStorage<T>();

		const value = storage.get("Data999");
		expect(value).toBeUndefined();
	});

	test("should support complex type unions", () => {
		type T = Record<`user:${number}`, { name: string; age: number }> &
			Record<`session:${string}`, { token: string; expires: number }>;

		const storage = inMemoryStorage<T>();

		storage.set("user:1", { name: "Alice", age: 30 });
		storage.set("session:abc123", { token: "xyz", expires: 1234567890 });

		const user = storage.get("user:1");
		const session = storage.get("session:abc123");

		expect(user).toEqual({ name: "Alice", age: 30 });
		expect(session).toEqual({ token: "xyz", expires: 1234567890 });
	});

	test("should work with simple Record types", () => {
		type T = Record<string, number>;
		const storage = inMemoryStorage<T>();

		storage.set("count", 100);
		expect(storage.get("count")).toBe(100);
	});

	test("should support interface-based types", () => {
		interface UserData {
			username: string;
			email: string;
		}

		const storage = inMemoryStorage<UserData>();

		storage.set("username", "john_doe");
		storage.set("email", "john@example.com");

		expect(storage.get("username")).toBe("john_doe");
		expect(storage.get("email")).toBe("john@example.com");
	});
});
