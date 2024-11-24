import { describe, it, expect } from "bun:test";
import { inMemoryStorage } from "../src";

describe("inMemoryStorage", () => {
  it("should set and get a value", () => {
    const storage = inMemoryStorage();
    storage.set("key1", "value1");
    expect(storage.get("key1")).toBe("value1");
  });

  it("should return undefined for a non-existent key", () => {
    const storage = inMemoryStorage();
    expect(storage.get("nonExistentKey")).toBeUndefined();
  });

  it("should check if a key exists", () => {
    const storage = inMemoryStorage();
    storage.set("key2", "value2");
    expect(storage.has("key2")).toBeTrue();
    expect(storage.has("nonExistentKey")).toBeFalse();
  });

  it("should delete a key", () => {
    const storage = inMemoryStorage();
    storage.set("key3", "value3");
    expect(storage.has("key3")).toBeTrue();
    storage.delete("key3");
    expect(storage.has("key3")).toBeFalse();
  });

  it("should return true when deleting an existing key", () => {
    const storage = inMemoryStorage();
    storage.set("key4", "value4");
    expect(storage.delete("key4")).toBeTrue();
  });

  it("should return false when deleting a non-existent key", () => {
    const storage = inMemoryStorage();
    expect(storage.delete("nonExistentKey")).toBeFalse();
  });

  it("should set, get, compare, and delete a object", () => {
    const storage = inMemoryStorage();
    const complexObject = {
      id: 1,
      name: "Test Object",
      details: {
        description: "This is a test object",
        active: true,
      },
    };

    storage.set("key", complexObject);

    const retrievedObject = storage.get("key");

    expect(retrievedObject).toEqual(complexObject);

    storage.delete("key");

    expect(storage.has("key")).toBeFalse();
  });
});
