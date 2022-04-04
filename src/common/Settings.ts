import Store from "electron-store";

export class Settings {
  store: Store;

  constructor() {
    this.store = new Store();
  }

  save(key: string, value: any) {
    return this.store.set(key, value);
  }

  load(key: string, defaultValue: any) {
    return this.store.get(key, defaultValue);
  }

  has(key: string) {
    return this.store.has(key);
  }

  del(key: string) {
    return this.store.delete(key);
  }
}

export const settings = new Settings();
