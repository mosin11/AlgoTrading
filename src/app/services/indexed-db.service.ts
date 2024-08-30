import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {

  private dbName = 'ScriptDataBase';
  private dbVersion = 1;
  private db!: IDBDatabase;
  private dbPromise: Promise<IDBDatabase>;
  private count = 20; // Number of numbers before and after the target number
  private step = 100; // Step size
  private centerNumber = 50000; // Center number provided
  private stepSize = 100;
  private numbersBefore = 20;
  private numbersAfter = 20;

  constructor() {
    this.dbPromise = this.openDatabase();
  }

  openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;

        // Check if the object store exists, if not create it
        if (!this.db.objectStoreNames.contains('scriptData')) {
          // const dStrikePrice = "dStrikePrice"
          //this.db.createObjectStore('scriptData', { keyPath: "dStrikePrice" });
          const store = this.db.createObjectStore('scriptData', { keyPath: ['dStrikePrice', 'pSymbol'] });
          store.createIndex('dStrikePriceIndex', 'dStrikePrice');

        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('Database opened successfully');
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('Error opening database:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }


  private getDb(): Promise<IDBDatabase> {
    return this.dbPromise;
  }

  public addData(dataObject: any): void {
    this.getDb().then(db => {
      const transaction = db.transaction('scriptData', 'readwrite');
      const store = transaction.objectStore('scriptData');
      // Convert the object to an array of key-value pairs and rename "dStrikePrice;" to "dStrikePrice"
      const dataArray = Object.entries(dataObject).map(([key, value]) => {
        if (key === "dStrikePrice;") {
          key = "dStrikePrice"; // Rename the key
        }
        return [key, value];
      });
      const updatedObject = Object.fromEntries(dataArray);
      if (!updatedObject.dStrikePrice) {
        console.error('dStrikePrice is missing from the data object.');
        return;
      }
      const request = store.put(updatedObject);
      request.onsuccess = () => {
        console.log(`Data with dStrikePrice ${updatedObject} added/updated successfully`);
      };
      request.onerror = (event) => {
        console.error(`Error adding/updating data with dStrikePrice ${updatedObject}:`, (event.target as IDBRequest).error);
      };


      transaction.oncomplete = () => {
        //console.log('All data added/updated successfully');
      };

      transaction.onerror = (event) => {
        console.error('Transaction error:', (event.target as IDBTransaction).error);
      };
    }).catch(error => {
      console.error('Error accessing database:', error);
    });
  }

  public getAllData(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.getDb().then(db => {
        const transaction = db.transaction('scriptData', 'readonly');
        const store = transaction.objectStore('scriptData');

        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      }).catch(error => {
        reject(error);
      });
    });
  }
  public closeDatabase(): void {
    if (this.db) {
      this.db.close(); // Close the database connection
      this.db = undefined as any;
    }
  }


  public getDataByStrikePrice(dStrikePrice: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.getDb().then(db => {
        const transaction = db.transaction('scriptData', 'readonly');
        const store = transaction.objectStore('scriptData');
        const index = store.index('dStrikePriceIndex'); // Use the index for querying

        const request = index.getAll(dStrikePrice); // Use getAll to retrieve all matching records

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      }).catch(error => {
        reject(error);
      });
    });
  }

  // Helper function to get the current timestamp in milliseconds
  getCurrentTimestamp(): number {
    return new Date().getTime();
  }

  // Helper function to get the last deletion timestamp from localStorage
  getLastDeletionTimestamp(): number | null {
    const lastDeletion = localStorage.getItem('lastDeletionTimestamp');
    return lastDeletion ? parseInt(lastDeletion, 10) : null;
  }

  // Helper function to set the last deletion timestamp in localStorage
  private setLastDeletionTimestamp(timestamp: number): void {
    localStorage.setItem('lastDeletionTimestamp', timestamp.toString());
  }

  // Function to delete all indexedDB databases
  private async deleteAllIndexedDB(): Promise<void> {
    try {
      const databases = await indexedDB.databases();
      if (databases.length > 0) {
        for (const db of databases) {
          // Ensure db.name is a string
          if (typeof db.name === 'string') {
            const deleteRequest = indexedDB.deleteDatabase(db.name);

            deleteRequest.onsuccess = () => {
              console.log(`IndexedDB database '${db.name}' deleted successfully`);
            };

            deleteRequest.onerror = (e) => {
              console.error(`Error deleting IndexedDB database '${db.name}':`, e);
            };

            deleteRequest.onblocked = () => {
              console.warn(`IndexedDB deletion of '${db.name}' blocked`);
            };
          } else {
            console.error('Database name is not a string:', db);
          }
        }
      } else {
        console.log('No indexedDB databases found');
      }
    } catch (e) {
      console.error('Error retrieving indexedDB databases:', e);
    }
  }


  // Function to perform the daily indexedDB deletion
  public performDailyDeletion(): void {
    const currentTimestamp = this.getCurrentTimestamp();
    const lastDeletionTimestamp = this.getLastDeletionTimestamp();

    // Check if 24 hours (86400000 milliseconds) have passed
    if (!lastDeletionTimestamp || (currentTimestamp - lastDeletionTimestamp) >= 86400000) {
      this.deleteAllIndexedDB();
      this.setLastDeletionTimestamp(currentTimestamp);
    } else {
      console.log('Not enough time has passed since the last deletion');
    }
  }

  getRangeExtremes(center: string | number, step: number, countBefore: number, countAfter: number): { lowest: number, highest: number } {
    // Convert center to a number if it's a string
    const centerNumber = typeof center === 'string' ? parseFloat(center) : center;

    // Validate the conversion
    if (isNaN(centerNumber)) {
      console.error('Invalid center value: Must be a number or a numeric string.');
      return { lowest: NaN, highest: NaN };
    }

    const lowest = centerNumber - countBefore * step;
    const highest = centerNumber + countAfter * step;

    return { lowest, highest };
  }

  // New method to get data within a specific range
  public getStrinkePriceRangeData(pSymbolName:string ,center: number, stepSize: number, countBefore: number,countAfter: number): Promise<any[]> {
    const { lowest, highest } = this.getRangeExtremes(center, stepSize, countBefore, countAfter);
    const low = lowest + "";
    const high = highest + "";
    
    console.log(`Fetching data from range: ${low} to ${high}`);
    return new Promise((resolve, reject) => {
      this.getDb().then(db => {
        const transaction = db.transaction('scriptData', 'readonly');
        const store = transaction.objectStore('scriptData');
        const index = store.index('dStrikePriceIndex');
        const range = IDBKeyRange.bound(low, high, false, false);
        // const range = IDBKeyRange.only('48100');
        const request = index.openCursor(range);

        const results: any[] = [];
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            if(pSymbolName){
              const filteredResults = results.filter(item => item.pSymbolName === pSymbolName);
            console.log('Filtered Results:', filteredResults);
            resolve(filteredResults);
            }else{
              resolve(results);
            }
            
          }
        };
        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      }).catch(error => {
        reject(error);
      });
    });
  }


}
