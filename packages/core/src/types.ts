/** Util helper to set that the value can be Promise or not */
type MaybePromise<T> = Promise<T> | T;

/** Type of in memory storage map */
export type InMemoryStorageMap<T = any> = Map<string, { data: T }>;

/**
 * Type of base storage which should implement all of storages
 *
 * @example
 * ```ts
 * import type { Storage } from "@gramio/storage";
 * import ThirdPartyStorage, { type ThirdPartyStorageOptions } from "some-library";
 *
 * export interface MyOwnStorageOptions extends ThirdPartyStorageOptions {
 *     some?: number;
 * }
 *
 * export function myOwnStorage(options: MyOwnStorageOptions = {}): Storage {
 *     const storage = new ThirdPartyStorage(options);
 *
 *     return {
 *         async get(key) {
 *             const data = await storage.get(key);
 *
 *             return data ? JSON.parse(data) : undefined;
 *         },
 *         async has(key) {
 *             return storage.has(key);
 *         },
 *         async set(key, value) {
 *             await storage.set(key, JSON.stringify(value));
 *         },
 *         async delete(key) {
 *             return storage.delete(key);
 *         },
 *     };
 * }
 * ```
 *
 * @example
 * ```ts
 * type T = Record<`Test${number}`, number> & Record<`Something${number}`, string>;
 * const storage = inMemoryStorage<T>();
 * const v1 = storage.get("Test1");   // v1: number | undefined
 * const v2 = storage.get("Something1");  // v2: string | undefined
 * ```
 * */
export interface Storage<Data = any> {
	/**
	 * `get` value from a storage.
	 * @example
	 * ```ts
	 * const data = await storage.get("key");
	 * ```
	 * */
	get<K extends keyof Data>(key: K): MaybePromise<Data[K] | undefined>;
	/**
	 * `set` value to a storage by the key.
	 * @example
	 * ```ts
	 * await storage.set("key", { value: true });
	 * ```
	 * */
	set<K extends keyof Data>(key: K, value: Data[K]): MaybePromise<void>;
	/**
	 * `has` storage value by the key?
	 * @example
	 * ```ts
	 * const isKeyExists = await storage.has("key");
	 * ```
	 * */
	has<K extends keyof Data>(key: K): MaybePromise<boolean>;
	/**
	 * `delete` value from storage by the key.
	 * @example
	 * ```ts
	 * await storage.delete("key");
	 * ```
	 * */
	delete<K extends keyof Data>(key: K): MaybePromise<boolean>;
}
