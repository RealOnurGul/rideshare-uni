import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Only allow in development or with admin check
    // For production, you should add proper admin authentication
    if (process.env.NODE_ENV === "production") {
      // In production, require authentication and check if user is admin
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // TODO: Add admin role check here when you implement admin system
      // For now, blocking in production for security
      return NextResponse.json({ error: "Not available in production" }, { status: 403 });
    }

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

