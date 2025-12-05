import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chats - Get all chats the user has access to
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Find ALL rides where user is driver (chat exists immediately for drivers)
    const driverRides = await prisma.ride.findMany({
      where: {
        driverId: userId,
      },
      include: {
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            isSystem: true,
            sender: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { dateTime: "desc" },
    });

    // Find all rides where user has an accepted booking
    const passengerRides = await prisma.ride.findMany({
      where: {
        bookings: {
          some: {
            passengerId: userId,
            status: "accepted",
          },
        },
      },
      include: {
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            isSystem: true,
            sender: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { dateTime: "desc" },
    });

    // Merge and dedupe
    const allRides = [...driverRides, ...passengerRides];
    const uniqueRides = allRides.filter(
      (ride, index, self) => index === self.findIndex((r) => r.id === ride.id)
    );

    // Format the response
    const chats = uniqueRides.map((ride) => {
      const participants = [
        ride.driver,
        ...ride.bookings.map((b) => b.passenger),
      ];
      const lastMessage = ride.messages[0] || null;
      const isDriver = ride.driverId === userId;

      return {
        rideId: ride.id,
        origin: ride.origin,
        destination: ride.destination,
        dateTime: ride.dateTime,
        status: ride.status,
        isDriver,
        participants,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              senderName: lastMessage.sender?.name || (lastMessage.isSystem ? "System" : "Someone"),
              createdAt: lastMessage.createdAt,
              isSystem: lastMessage.isSystem,
            }
          : null,
        messageCount: ride._count.messages,
      };
    });

    // Sort by last message date or ride date
    chats.sort((a, b) => {
      const aDate = a.lastMessage?.createdAt || a.dateTime;
      const bDate = b.lastMessage?.createdAt || b.dateTime;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

