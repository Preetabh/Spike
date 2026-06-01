import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL Database Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    process.exit(1);
  }
};

export default prisma;
