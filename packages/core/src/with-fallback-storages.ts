import type { Storage } from "./types.js";

export function withFallbackStorages(storages: Storage[]): Storage {
	return {
		get: async (key: string) => {
			for (const storage of storages) {
				const value = await storage.get(key);
				if (value) {
					return value;
				}
			}

			return undefined;
		},
		set: async (key: string, value: any): Promise<void> => {
			await Promise.any(storages.map((storage) => storage.set(key, value)));
		},
		has: async (key: string): Promise<boolean> => {
			for (const storage of storages) {
				if (await storage.has(key)) {
					return true;
				}
			}

			return false;
		},
		delete: async (key: string): Promise<boolean> => {
			return Promise.any(storages.map((storage) => storage.delete(key)));
		},
	};
}
