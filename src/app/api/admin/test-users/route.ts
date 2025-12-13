import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get 3 random users from the database
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        email: true,
        name: true,
      },
      orderBy: {
        createdAt: "asc", // Get first 3 users (consistent)
      },
    });

    // All seed users have password: password123
    const testUsers = users.map((user) => ({
      email: user.email,
      name: user.name,
      password: "password123",
    }));

    return NextResponse.json({ users: testUsers });
  } catch (error) {
    console.error("Error fetching test users:", error);
    return NextResponse.json({ error: "Failed to fetch test users" }, { status: 500 });
  }
}

