import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/rides/[id]/book - Create a booking for the current user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: rideId } = await params;

    // Get the ride
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        bookings: true,
      },
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    // Check if user is the driver
    if (ride.driverId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot book your own ride" },
        { status: 400 }
      );
    }

    // Check if user already has a booking for this ride
    const existingBooking = ride.bookings.find(
      (b) => b.passengerId === session.user.id
    );
    if (existingBooking) {
      return NextResponse.json(
        { error: "You have already requested a seat for this ride" },
        { status: 400 }
      );
    }

    // Check if there are available seats
    if (ride.seatsAvailable <= 0) {
      return NextResponse.json(
        { error: "No seats available" },
        { status: 400 }
      );
    }

    // Check if ride is in the past
    if (new Date(ride.dateTime) < new Date()) {
      return NextResponse.json(
        { error: "This ride has already departed" },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        rideId,
        passengerId: session.user.id,
        status: "pending",
      },
      include: {
        passenger: {
          select: {
            id: true,
            name: true,
            email: true,
            university: true,
          },
        },
        ride: {
          select: {
            id: true,
            origin: true,
            destination: true,
            dateTime: true,
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

