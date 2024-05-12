# @gramio/storage

[![npm](https://img.shields.io/npm/v/@gramio/storage?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/@gramio/storage)
[![JSR](https://jsr.io/badges/@gramio/storage)](https://jsr.io/@gramio/storage)
[![JSR Score](https://jsr.io/badges/@gramio/storage/score)](https://jsr.io/@gramio/storage)

Core of storage adapters.

Read more in [documentation](https://gramio.netlify.app/storages/).

## How to write my own storage adapters

It is very simple to write your adapter!

It is enough to return the object with the required methods and use the methods of the solution you have chosen for the adapter. (for example, `ioredis`)

```ts
import type { Storage } from "@gramio/storage";
import ThirdPartyStorage, { type ThirdPartyStorageOptions } from "some-library";

export interface MyOwnStorageOptions extends ThirdPartyStorageOptions {
    /** add new property to options */
    some?: number;
}

export function myOwnStorage(options: MyOwnStorageOptions = {}): Storage {
    const storage = new ThirdPartyStorage(options);

    return {
        async get(key) {
            const data = await storage.get(key);

            return data ? JSON.parse(data) : undefined;
        },
        async has(key) {
            return storage.has(key);
        },
        async set(key, value) {
            await storage.set(key, JSON.stringify(value));
        },
        async delete(key) {
            return storage.delete(key);
        },
    };
}
```

> [!IMPORTANT]
> If you want to publish your adapter, we recommend that you follow the **convention** and name it starting with `gramio-storage` and add `gramio` + `gramio-storage` keywords in your **package.json**

## How to use storage adapters in my own plugin

It is also very easy to work with storage adapters in your plugin!

Everything we need is already in `@gramio/storage`.

```ts
import { Plugin } from "gramio";
import { type Storage, inMemoryStorage } from "@gramio/storage";

export interface MyOwnPluginOptions {
    storage?: Storage;
}

export function myOwnPlugin(options: MyOwnPluginOptions = {}) {
    // use in memory storage by default
    const storage = options.storage ?? inMemoryStorage();

    return new Plugin("gramio-example");
}
```

> [!IMPORTANT]
> You can scaffold this example by [create-gramio-plugin](/plugins/how-to-write.html#scaffolding-the-plugin)
