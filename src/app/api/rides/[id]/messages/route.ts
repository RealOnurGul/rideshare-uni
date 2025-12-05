import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper to check if user can access ride chat
async function canAccessChat(rideId: string, userId: string): Promise<boolean> {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: {
      bookings: {
        where: { status: "accepted" },
        select: { passengerId: true },
      },
    },
  });

  if (!ride) return false;

  // User is the driver
  if (ride.driverId === userId) return true;

  // User is an accepted passenger
  const isAcceptedPassenger = ride.bookings.some(
    (booking) => booking.passengerId === userId
  );

  return isAcceptedPassenger;
}

// GET /api/rides/[id]/messages - Get messages for a ride
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: rideId } = await params;

    // Check access
    const hasAccess = await canAccessChat(rideId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this chat" },
        { status: 403 }
      );
    }

    // Get query params for pagination
    const { searchParams } = new URL(request.url);
    const after = searchParams.get("after"); // Get messages after this timestamp
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const where: { rideId: string; createdAt?: { gt: Date } } = { rideId };
    if (after) {
      where.createdAt = { gt: new Date(after) };
    }

    const messages = await prisma.message.findMany({
      where,
      select: {
        id: true,
        content: true,
        isSystem: true,
        createdAt: true,
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    // Get ride info for chat header
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      select: {
        id: true,
        origin: true,
        destination: true,
        dateTime: true,
        status: true,
        driverId: true,
        driver: {
          select: { id: true, name: true, image: true },
        },
        bookings: {
          where: { status: "accepted" },
          include: {
            passenger: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      messages,
      ride,
      participants: ride
        ? [
            ride.driver,
            ...ride.bookings.map((b) => b.passenger),
          ]
        : [],
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/rides/[id]/messages - Send a message
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
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Message too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    // Check access
    const hasAccess = await canAccessChat(rideId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this chat" },
        { status: 403 }
      );
    }

    // Get ride to check status and get participants for notifications
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        driver: { select: { id: true, name: true } },
        bookings: {
          where: { status: "accepted" },
          select: { passengerId: true },
        },
      },
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    if (ride.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot send messages to a cancelled ride" },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        rideId,
        senderId: session.user.id,
        content: content.trim(),
        isSystem: false,
      },
      select: {
        id: true,
        content: true,
        isSystem: true,
        createdAt: true,
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Create notifications for other participants
    const senderName = session.user.name || "Someone";
    const allParticipantIds = [
      ride.driverId,
      ...ride.bookings.map((b) => b.passengerId),
    ];
    const otherParticipantIds = allParticipantIds.filter(
      (id) => id !== session.user.id
    );

    // Create notifications in bulk
    if (otherParticipantIds.length > 0) {
      await prisma.notification.createMany({
        data: otherParticipantIds.map((userId) => ({
          userId,
          type: "new_message",
          title: "New Message",
          message: `${senderName}: ${content.slice(0, 50)}${content.length > 50 ? "..." : ""}`,
          rideId,
        })),
      });
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

