import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/bookings/[id] - Update booking status (accept/decline)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["accepted", "declined"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'accepted' or 'declined'" },
        { status: 400 }
      );
    }

    // Get the booking with ride info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only the driver can accept/decline bookings
    if (booking.ride.driverId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the driver can update booking status" },
        { status: 403 }
      );
    }

    // Check if booking is already processed
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Booking has already been processed" },
        { status: 400 }
      );
    }

    // If accepting, check seats availability
    if (status === "accepted" && booking.ride.seatsAvailable <= 0) {
      return NextResponse.json(
        { error: "No seats available" },
        { status: 400 }
      );
    }

    // Update booking and seat count in a transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status },
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

      // If accepted, decrement available seats
      if (status === "accepted") {
        await tx.ride.update({
          where: { id: booking.rideId },
          data: {
            seatsAvailable: {
              decrement: 1,
            },
          },
        });
      }

      return updated;
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

