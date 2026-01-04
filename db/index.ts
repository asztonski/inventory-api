import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { Database } from "./types.js";

const dbPath = process.env.DB_PATH || "./db.json";

// Default data structure
const defaultData: Database = {
  products: [],
  orders: [],
  customers: [
    {
      id: "customer-us-1",
      name: "John Smith",
      location: "US",
      createdAt: new Date().toISOString(),
    },
    {
      id: "customer-eu-1",
      name: "Anna Kowalska",
      location: "Europe",
      createdAt: new Date().toISOString(),
    },
    {
      id: "customer-asia-1",
      name: "Yuki Tanaka",
      location: "Asia",
      createdAt: new Date().toISOString(),
    },
    {
      id: "customer-us-2",
      name: "Sarah Johnson",
      location: "US",
      createdAt: new Date().toISOString(),
    },
    {
      id: "customer-eu-2",
      name: "Hans Mueller",
      location: "Europe",
      createdAt: new Date().toISOString(),
    },
  ],
};

let db: Low<Database>;

export async function initDatabase(): Promise<Low<Database>> {
  if (db) {
    return db;
  }

  const adapter = new JSONFile<Database>(dbPath);
  db = new Low<Database>(adapter, defaultData);

  await db.read();

  // Always write to ensure file exists with seed data
  await db.write();

  return db;
}

export function getDatabase(): Low<Database> {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

export * from "./types.js";
