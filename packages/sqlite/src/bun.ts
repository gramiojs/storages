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

export function sqliteStorage(options: SqliteStorageOptions): Storage {
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
		get(key) {
			const data = getQuery.get(key);
			if (!data) return undefined;

			if (data.expires_at && data.expires_at <= time()) {
				this.delete(key);
				return undefined;
			}

			return JSON.parse(data.value);
		},

		has(key) {
			return Boolean(this.get(key));
		},

		set(key, value) {
			const ttl = options.$ttl;
			const exp = ttl ? time() + ttl : null;

			const data = JSON.stringify(value);
			setQuery.run(key, data, exp);
		},

		delete(key) {
			const result = delQuery.get(key);
			return result !== null;
		},
	};
}
