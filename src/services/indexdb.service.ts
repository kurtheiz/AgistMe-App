import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'agistme-db';
const STORE_NAME = 'postcodes';
const DB_VERSION = 1;

export class IndexDBService {
  private db: IDBPDatabase | null = null;

  async initDB() {
    if (this.db) return;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }

  async storePostcodes(postcodes: any) {
    await this.initDB();
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    await tx.store.put(postcodes, 'optimized_postcodes');
    await tx.done;
  }

  async getPostcodes(): Promise<any> {
    await this.initDB();
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.get(STORE_NAME, 'optimized_postcodes');
  }

  async hasPostcodes(): Promise<boolean> {
    await this.initDB();
    if (!this.db) throw new Error('Database not initialized');
    
    const data = await this.db.get(STORE_NAME, 'optimized_postcodes');
    return !!data;
  }
}

export const indexDBService = new IndexDBService();
