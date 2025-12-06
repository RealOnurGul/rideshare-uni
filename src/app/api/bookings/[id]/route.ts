import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  notifyBookingAccepted,
  notifyBookingDeclined,
  notifyBookingCancelled,
} from "@/lib/notifications";

// GET /api/bookings/[id] - Get booking details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: {
          select: {
            id: true,
            origin: true,
            destination: true,
            dateTime: true,
            pricePerSeat: true,
            status: true,
            driver: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only passenger or driver can view booking details
    if (booking.passengerId !== session.user.id && booking.ride.driver.id !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

// PATCH /api/bookings/[id] - Update booking status (accept/decline/cancel)
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

    if (!status || !["accepted", "declined", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'accepted', 'declined', or 'cancelled'" },
        { status: 400 }
      );
    }

    // Get the booking with ride and user info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: {
          include: {
            driver: { select: { id: true, name: true } },
          },
        },
        passenger: { select: { id: true, name: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isDriver = booking.ride.driverId === session.user.id;
    const isPassenger = booking.passengerId === session.user.id;

    // Permission checks
    if (status === "cancelled") {
      // Only the passenger can cancel their own booking
      if (!isPassenger) {
        return NextResponse.json(
          { error: "Only the passenger can cancel their booking" },
          { status: 403 }
        );
      }
    } else {
      // Only the driver can accept/decline
      if (!isDriver) {
        return NextResponse.json(
          { error: "Only the driver can accept or decline bookings" },
          { status: 403 }
        );
      }
    }

    // Check if booking can be updated
    if (status === "cancelled" && booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    if ((status === "accepted" || status === "declined") && booking.status !== "pending") {
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
            select: { id: true, name: true, university: true },
          },
          ride: {
            select: { id: true, origin: true, destination: true, dateTime: true },
          },
        },
      });

      // Handle seat count changes
      if (status === "accepted") {
        await tx.ride.update({
          where: { id: booking.rideId },
          data: { seatsAvailable: { decrement: 1 } },
        });
      } else if (status === "cancelled" && booking.status === "accepted") {
        // If cancelling an accepted booking, restore the seat
        await tx.ride.update({
          where: { id: booking.rideId },
          data: { seatsAvailable: { increment: 1 } },
        });
      }

      return updated;
    });

    // Send notifications
    const driverName = booking.ride.driver.name || "Driver";
    const passengerName = booking.passenger.name || "Passenger";

    if (status === "accepted") {
      // Create system message for joining
      await prisma.message.create({
        data: {
          rideId: booking.rideId,
          senderId: null,
          content: `🎉 ${passengerName} has joined the ride!`,
          isSystem: true,
        },
      });

      await notifyBookingAccepted(
        booking.passengerId,
        driverName,
        booking.rideId,
        bookingId,
        booking.ride.origin,
        booking.ride.destination
      );
    } else if (status === "declined") {
      await notifyBookingDeclined(
        booking.passengerId,
        driverName,
        booking.rideId,
        bookingId,
        booking.ride.origin,
        booking.ride.destination
      );
    } else if (status === "cancelled") {
      // Create system message for leaving (only if was accepted)
      if (booking.status === "accepted") {
        await prisma.message.create({
          data: {
            rideId: booking.rideId,
            senderId: null,
            content: `👋 ${passengerName} has left the ride.`,
            isSystem: true,
          },
        });
      }

      await notifyBookingCancelled(
        booking.ride.driverId,
        passengerName,
        booking.rideId,
        bookingId,
        booking.ride.origin,
        booking.ride.destination
      );
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
