import type { InMemoryStorageMap, Storage } from "./types.js";

/** in memory storage. Can be used by **default** in plugins */
export function inMemoryStorage(map?: InMemoryStorageMap): Storage {
	const storage: InMemoryStorageMap = map ?? new Map();

	return {
		get(key) {
			return storage.get(key)?.data;
		},
		has(key) {
			return storage.has(key);
		},
		set(key, value) {
			storage.set(key, { data: value });
		},
		delete(key) {
			return storage.delete(key);
		},
	};
}
