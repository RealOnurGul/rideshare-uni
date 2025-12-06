import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const university = searchParams.get("university");
    const status = searchParams.get("status"); // "upcoming", "completed", "cancelled", or "all"
    const includeHistory = searchParams.get("history") === "true";

    const where: Record<string, unknown> = {};

    // Default: only show upcoming rides with available seats
    if (!includeHistory) {
      where.status = status || "upcoming";
      where.seatsAvailable = { gt: 0 };
      where.dateTime = { gte: new Date() };
    } else {
      // When including history, only filter by status if explicitly provided and not "all"
      if (status && status !== "all") {
        where.status = status;
      }
      // Otherwise, return all rides regardless of status
    }

    if (origin) {
      where.origin = { contains: origin };
    }

    if (destination) {
      where.destination = { contains: destination };
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      const dateFilter: { gte?: Date; lte?: Date } = {};
      
      if (dateFrom) {
        dateFilter.gte = new Date(dateFrom);
      } else if (!includeHistory) {
        dateFilter.gte = new Date();
      }
      
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        dateFilter.lte = endDate;
      }
      
      where.dateTime = dateFilter;
    }

    if (university) {
      where.driver = { university: { contains: university } };
    }

    const rides = await prisma.ride.findMany({
      where,
      include: {
        driver: {
          select: { id: true, name: true, university: true, image: true },
        },
        vehicle: {
          select: { id: true, make: true, model: true, year: true, color: true },
        },
        _count: {
          select: { bookings: { where: { status: "accepted" } } },
        },
      },
      orderBy: { dateTime: includeHistory ? "desc" : "asc" },
    });

    return NextResponse.json(rides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    return NextResponse.json({ error: "Failed to fetch rides" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has verified their university email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { university: true },
    });

    if (!user?.university) {
      return NextResponse.json(
        { error: "Please verify your university email before offering a ride. Go to your profile to complete verification." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      origin,
      originLat,
      originLng,
      destination,
      destinationLat,
      destinationLng,
      dateTime,
      pricePerSeat,
      seatsTotal,
      notes,
      vehicleId,
      luggageSpace,
      petsAllowed,
      smokingAllowed,
      musicAllowed,
    } = body;

    // Validation
    if (!origin || !destination || !dateTime || pricePerSeat === undefined || !seatsTotal) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!vehicleId) {
      return NextResponse.json({ error: "You must select a vehicle to offer a ride" }, { status: 400 });
    }

    // Verify vehicle ownership
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle || vehicle.userId !== session.user.id) {
      return NextResponse.json({ error: "Invalid vehicle selected" }, { status: 400 });
    }

    if (pricePerSeat < 0) {
      return NextResponse.json({ error: "Price must be positive" }, { status: 400 });
    }

    if (seatsTotal < 1) {
      return NextResponse.json({ error: "Must have at least 1 seat" }, { status: 400 });
    }

    const rideDate = new Date(dateTime);
    if (rideDate < new Date()) {
      return NextResponse.json({ error: "Ride date must be in the future" }, { status: 400 });
    }

    const ride = await prisma.ride.create({
      data: {
        driverId: session.user.id,
        vehicleId,
        origin,
        originLat: originLat || null,
        originLng: originLng || null,
        destination,
        destinationLat: destinationLat || null,
        destinationLng: destinationLng || null,
        dateTime: rideDate,
        pricePerSeat: parseFloat(pricePerSeat),
        seatsTotal: parseInt(seatsTotal),
        seatsAvailable: parseInt(seatsTotal),
        notes: notes || null,
        luggageSpace: luggageSpace || "medium",
        petsAllowed: petsAllowed || false,
        smokingAllowed: smokingAllowed || false,
        musicAllowed: musicAllowed !== false,
      },
      include: {
        driver: {
          select: { id: true, name: true, university: true, image: true },
        },
        vehicle: {
          select: { id: true, make: true, model: true, year: true, color: true, licensePlate: true },
        },
      },
    });

    return NextResponse.json(ride, { status: 201 });
  } catch (error) {
    console.error("Error creating ride:", error);
    return NextResponse.json({ error: "Failed to create ride" }, { status: 500 });
  }
}
