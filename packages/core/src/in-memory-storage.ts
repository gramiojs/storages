import type { InMemoryStorageMap, Storage } from "./types.ts";

/** in memory storage. Can be used by **default** in plugins */
export function inMemoryStorage<Data = any>(
	map?: InMemoryStorageMap,
): Storage<Data> {
	const storage: InMemoryStorageMap = map ?? new Map();

	return {
		get(key) {
			return storage.get(String(key))?.data;
		},
		has(key) {
			return storage.has(String(key));
		},
		set(key, value) {
			storage.set(String(key), { data: value });
		},
		delete(key) {
			return storage.delete(String(key));
		},
	};
}
