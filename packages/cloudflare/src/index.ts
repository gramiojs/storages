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
export function cloudflareStorage(kv: KVNamespace): Storage {
	return {
		get: async <T = any>(key: string): Promise<T | undefined> => {
			const value = await kv.get<T>(key, "json");

			return value ?? undefined;
		},
		set: async (key: string, value: any): Promise<void> => {
			await kv.put(key, JSON.stringify(value));
		},
		has: async (key: string): Promise<boolean> => {
			const value = await kv.get(key);

			return value !== null;
		},
		delete: async (key: string): Promise<boolean> => {
			try {
				await kv.delete(key);

				return true;
			} catch {
				return false;
			}
		},
	};
}
