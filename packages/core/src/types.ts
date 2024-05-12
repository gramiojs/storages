/** Util helper to set that the value can be Promise or not */
type MaybePromise<T> = Promise<T> | T;

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
 * */
export interface Storage {
	/**
	 * `get` value from a storage.
	 * @example
	 * ```ts
	 * const data = await storage.get<string>("key");
	 * ```
	 * */
	get<T = any>(key: string): MaybePromise<T | undefined>;
	/**
	 * `set` value to a storage by the key.
	 * @example
	 * ```ts
	 * await storage.set("key", { value: true });
	 * ```
	 * */
	set(key: string, value: any): MaybePromise<void>;
	/**
	 * `has` storage value by the key?
	 * @example
	 * ```ts
	 * const isKeyExists = await storage.has("key");
	 * ```
	 * */
	has(key: string): MaybePromise<boolean>;
	/**
	 * `delete` value from storage by the key.
	 * @example
	 * ```ts
	 * await storage.delete("key");
	 * ```
	 * */
	delete(key: string): MaybePromise<boolean>;
}
