type MaybePromise<T> = Promise<T> | T;

export interface Storage {
	get<T = any>(key: string): MaybePromise<T | undefined>;
	set(key: string, value: any): MaybePromise<void>;
	has(key: string): MaybePromise<boolean>;
	delete(key: string): MaybePromise<boolean>;
}
