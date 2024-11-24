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
export interface Storage<Data = any> {
	/**
	 * `get` value from a storage.
	 * @example
	 * ```ts
	 * const data = await storage.get<string>("key");
	 * ```
	 * */
	// TODO: allow override return type
	get<T = Data>(key: string): MaybePromise<Data | undefined>;
	/**
	 * `set` value to a storage by the key.
	 * @example
	 * ```ts
	 * await storage.set("key", { value: true });
	 * ```
	 * */
	set(key: string, value: Data): MaybePromise<void>;
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
