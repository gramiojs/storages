import { Database } from "bun:sqlite";
import type { Storage } from "@gramio/storage";
import type { Entry, SqliteStorageBaseOptions } from "./types";
import { time } from "./utils";

type SqliteConstructor = Exclude<
	ConstructorParameters<typeof Database>[1],
	number
> & { filename: string };

type SqliteInstance = { db: Database };

export type SqliteStorageOptions = (SqliteConstructor | SqliteInstance) &
	SqliteStorageBaseOptions;

export function sqliteStorage<Data extends Record<string, any>>(
	options: SqliteStorageOptions,
): Storage<Data> {
	let storage: Database;
	if ("db" in options) {
		storage = options.db;
	} else {
		options.create ??= true;
		options.strict ??= true;

		storage = new Database(options.filename, options);
	}

	const tableName = options.tableName ?? "gramio_storage";

	// TODO: Think about migrations
	storage.exec("PRAGMA journal_mode = WAL");
	// https://en.wikipedia.org/wiki/Year_2038_problem?useskin=vector
	storage.exec(
		`CREATE TABLE IF NOT EXISTS ${tableName} (key TEXT PRIMARY KEY, value JSONB NOT NULL, expires_at BIGINT)`,
	);

	setTimeout(() => {
		storage.exec(`DELETE FROM ${tableName} WHERE expires_at <= ${time()}`);
	});

	const getQuery = storage.query<Entry, [string]>(
		`SELECT * FROM ${tableName} WHERE key = ?`,
	);
	const setQuery = storage.query<unknown, [string, string, number | null]>(
		`INSERT OR REPLACE INTO ${tableName} VALUES (?, ?, ?)`,
	);
	const delQuery = storage.query<unknown, [string]>(
		`DELETE FROM ${tableName} WHERE key = ? RETURNING key`,
	);

	return {
		get<K extends keyof Data>(key: K) {
			const stringKey = String(key);
			const data = getQuery.get(stringKey);
			if (!data) return undefined;

			if (data.expires_at && data.expires_at <= time()) {
				delQuery.get(stringKey);
				return undefined;
			}

			return JSON.parse(data.value);
		},

		has<K extends keyof Data>(key: K) {
			const stringKey = String(key);
			const data = getQuery.get(stringKey);
			if (!data) return false;

			if (data.expires_at && data.expires_at <= time()) {
				delQuery.get(stringKey);
				return false;
			}

			return true;
		},

		set<K extends keyof Data>(key: K, value: Data[K]) {
			const ttl = options.$ttl;
			const exp = ttl ? time() + ttl : null;

			const data = JSON.stringify(value);
			setQuery.run(String(key), data, exp);
		},

		delete<K extends keyof Data>(key: K) {
			const result = delQuery.get(String(key));
			return result !== null;
		},
	};
}
