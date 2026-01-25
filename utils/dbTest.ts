import prisma, { drizzleDb } from "@/db/prismaDrizzle";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test Prisma
    const prismaCount = await prisma.user.count();

    // Test Drizzle (assuming you have a 'users' table in schema)
    // const drizzleData = await drizzleDb.select().from(users).limit(1);

    return NextResponse.json({
      status: "Connected",
      prismaCount,
      poolSize: 20,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "Error", message: error },
      { status: 500 },
    );
  }
}
