import type { InMemoryStorageMap, Storage } from "./types.ts";

/** in memory storage. Can be used by **default** in plugins */
export function inMemoryStorage<Data>(map?: InMemoryStorageMap<Data>): Storage<Data> {
    const storage: InMemoryStorageMap<Data> = map ?? new Map();
    
    return {
        get<T = Data>(key: string): T | undefined {
            return storage.get(key)?.data as T;
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