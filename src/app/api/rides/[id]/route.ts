import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ride = await prisma.ride.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            university: true,
            image: true,
          },
        },
        bookings: {
          include: {
            passenger: {
              select: {
                id: true,
                name: true,
                email: true,
                university: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    return NextResponse.json(ride);
  } catch (error) {
    console.error("Error fetching ride:", error);
    return NextResponse.json(
      { error: "Failed to fetch ride" },
      { status: 500 }
    );
  }
}
