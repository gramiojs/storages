import { DatabaseSync } from "node:sqlite";
import type { Storage } from "@gramio/storage";
import type { Entry, SqliteStorageBaseOptions } from "./types";
import { time } from "./utils";

type SqliteConstructor = {
	filename: string;
	open?: boolean;
	readOnly?: boolean;
	enableForeignKeyConstraints?: boolean;
};

type SqliteInstance = { db: DatabaseSync };

export type SqliteStorageOptions = (SqliteConstructor | SqliteInstance) &
	SqliteStorageBaseOptions;

export function sqliteStorage(options: SqliteStorageOptions): Storage {
	let storage: DatabaseSync;
	if ("db" in options) {
		storage = options.db;
	} else {
		storage = new DatabaseSync(options.filename, options);
	}

	const tableName = options.tableName ?? "gramio_storage";

	storage.exec("PRAGMA journal_mode = WAL");
	storage.exec(
		`CREATE TABLE IF NOT EXISTS ${tableName} (key TEXT PRIMARY KEY, value JSONB NOT NULL, expires_at BIGINT)`,
	);

	setTimeout(() => {
		storage.exec(`DELETE FROM ${tableName} WHERE expires_at <= ${time()}`);
	});

	const getQuery = storage.prepare(`SELECT * FROM ${tableName} WHERE key = ?`);
	const setQuery = storage.prepare(
		`INSERT OR REPLACE INTO ${tableName} VALUES (?, ?, ?)`,
	);
	const delQuery = storage.prepare(
		`DELETE FROM ${tableName} WHERE key = ? RETURNING key`,
	);

	return {
		get(key) {
			const data = getQuery.get(key) as Entry | undefined;
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
			return result !== undefined;
		},
	};
}
