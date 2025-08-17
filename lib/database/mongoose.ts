// lib/mongodb.ts
import "server-only";
import mongoose, { Mongoose } from "mongoose";
import dns from "dns";

dns.setDefaultResultOrder?.("ipv4first");

const MONGODB_URI = process.env.MONGODB_URL; // make sure this is the SRV URI

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: MongooseConnection | undefined;
}

const cached: MongooseConnection = global.__mongoose ?? {
  conn: null,
  promise: null,
};

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URL");

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "imaginify",
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
  }
  cached.conn = await cached.promise;
  global.__mongoose = cached;
  return cached.conn;
}
