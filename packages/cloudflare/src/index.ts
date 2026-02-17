/**
 * Cloudflare KV Storage Adapter
 * @module @gramio/storage-cloudflare
 */

import type { KVNamespace } from "@cloudflare/workers-types";
import type { Storage } from "@gramio/storage";

/**
 * Create a storage adapter for Cloudflare KV
 * @param kv - The Cloudflare KV namespace
 * @returns A storage adapter for Cloudflare KV
 */
export function cloudflareStorage<Data extends Record<string, any>>(
	kv: KVNamespace,
): Storage<Data> {
	return {
		async get<K extends keyof Data>(key: K): Promise<Data[K] | undefined> {
			const value = await kv.get<Data[K]>(String(key), "json");

			return value ?? undefined;
		},
		async set<K extends keyof Data>(key: K, value: Data[K]): Promise<void> {
			await kv.put(String(key), JSON.stringify(value));
		},
		async has<K extends keyof Data>(key: K): Promise<boolean> {
			const value = await kv.get(String(key));

			return value !== null;
		},
		async delete<K extends keyof Data>(key: K): Promise<boolean> {
			try {
				await kv.delete(String(key));

				return true;
			} catch {
				return false;
			}
		},
	};
}
