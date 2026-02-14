export interface Entry {
	key: string;
	value: string;
	expires_at: number | null;
}

export interface SqliteStorageBaseOptions {
	$ttl?: number;
	tableName?: string;
}
