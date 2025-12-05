import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/rides - List rides with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const date = searchParams.get("date");
    const university = searchParams.get("university");

    const where: Record<string, unknown> = {
      dateTime: {
        gte: new Date(),
      },
      seatsAvailable: {
        gt: 0,
      },
    };

    if (origin) {
      where.origin = {
        contains: origin,
      };
    }

    if (destination) {
      where.destination = {
        contains: destination,
      };
    }

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);

      where.dateTime = {
        gte: startOfDay,
        lt: endOfDay,
      };
    }

    if (university) {
      where.driver = {
        university: {
          contains: university,
        },
      };
    }

    const rides = await prisma.ride.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            university: true,
          },
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: "accepted",
              },
            },
          },
        },
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    return NextResponse.json(rides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    return NextResponse.json(
      { error: "Failed to fetch rides" },
      { status: 500 }
    );
  }
}

// POST /api/rides - Create a new ride
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { origin, destination, dateTime, pricePerSeat, seatsTotal, notes } =
      body;

    // Validation
    if (!origin || !destination || !dateTime || !pricePerSeat || !seatsTotal) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (pricePerSeat < 0) {
      return NextResponse.json(
        { error: "Price must be positive" },
        { status: 400 }
      );
    }

    if (seatsTotal < 1) {
      return NextResponse.json(
        { error: "Must have at least 1 seat" },
        { status: 400 }
      );
    }

    const rideDate = new Date(dateTime);
    if (rideDate < new Date()) {
      return NextResponse.json(
        { error: "Ride date must be in the future" },
        { status: 400 }
      );
    }

    const ride = await prisma.ride.create({
      data: {
        driverId: session.user.id,
        origin,
        destination,
        dateTime: rideDate,
        pricePerSeat: parseFloat(pricePerSeat),
        seatsTotal: parseInt(seatsTotal),
        seatsAvailable: parseInt(seatsTotal),
        notes: notes || null,
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            university: true,
          },
        },
      },
    });

    return NextResponse.json(ride, { status: 201 });
  } catch (error) {
    console.error("Error creating ride:", error);
    return NextResponse.json(
      { error: "Failed to create ride" },
      { status: 500 }
    );
  }
}

