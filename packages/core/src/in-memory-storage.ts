import type { Storage } from "types";

export function inMemoryStorage(): Storage {
	const storage = new Map<string, { data: any }>();

	return {
		get(key) {
			return storage.get(key)?.data;
		},
		has(key) {
			return storage.has(key);
		},
		set(key, value) {
			storage.set(key, value);
		},
		delete(key) {
			return storage.delete(key);
		},
	};
}
