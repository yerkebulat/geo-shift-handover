import { openDB } from 'idb';

const DB_NAME = 'GeoHandoverDB';
const DB_VERSION = 1;
const STORE_NAME = 'handovers';

let dbInstance = null;

export async function initDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create handovers store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });

        // Create indexes for querying
        store.createIndex('date', 'date');
        store.createIndex('holeId', 'holeId');
        store.createIndex('swingStartDate', 'swingStartDate');
        store.createIndex('timestamp', 'timestamp');
      }
    }
  });

  return dbInstance;
}

export async function saveHandover(data) {
  const db = await initDB();

  // Prepare handover object
  const handover = {
    ...data,
    lastModified: Date.now()
  };

  // Add timestamp only for new records
  if (!data.id) {
    handover.timestamp = Date.now();
  }

  if (data.id && typeof data.id === 'number') {
    // Update existing record
    await db.put(STORE_NAME, handover);
    return data.id;
  } else {
    // Create new record - remove id field if it's null/undefined
    const { id, ...newHandover } = handover;
    newHandover.timestamp = Date.now();
    const newId = await db.add(STORE_NAME, newHandover);
    return newId;
  }
}

export async function getHandover(id) {
  const db = await initDB();
  return await db.get(STORE_NAME, id);
}

export async function getAllHandovers() {
  const db = await initDB();
  const handovers = await db.getAll(STORE_NAME);
  // Sort by timestamp descending (newest first)
  return handovers.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteHandover(id) {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}

export async function getHandoversBySwing(swingStartDate) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const index = tx.store.index('swingStartDate');
  const handovers = await index.getAll(swingStartDate);
  await tx.done;

  // Sort by date
  return handovers.sort((a, b) => new Date(a.date) - new Date(b.date));
}

export async function getRecentHandovers(days = 7) {
  const db = await initDB();
  const allHandovers = await db.getAll(STORE_NAME);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return allHandovers
    .filter(h => new Date(h.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
