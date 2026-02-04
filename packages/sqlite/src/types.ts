import type { Database } from "bun:sqlite";

export interface Entry {
	key: string;
	value: string;
	expires_at: number | null;
}

type SqliteConstructor = Exclude<
	ConstructorParameters<typeof Database>[1],
	number
> & { filename: string };

type SqliteInstance = { db: Database };

export type SqliteStorageOptions = (SqliteConstructor | SqliteInstance) & {
	$ttl?: number;
	tableName?: string;
};
