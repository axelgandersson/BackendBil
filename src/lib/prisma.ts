import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

// Parse mysql://user:password@host:port/database
const parsed = new URL(url);
const adapter = new PrismaMariaDb({
  host: parsed.hostname,
  port: Number(parsed.port) || 3306,
  user: parsed.username,
  password: parsed.password,
  database: parsed.pathname.slice(1),
});

const prisma = new PrismaClient({ adapter });

export default prisma;
