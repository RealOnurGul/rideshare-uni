import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/bookings/pending-confirmation - Get bookings that need confirmation
export async function GET() {
 try {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const now = new Date();

 // Get accepted bookings where:
 // 1. Ride time has passed
 // 2. Not yet confirmed
 // 3. Within confirmation deadline
 const pendingConfirmations = await prisma.booking.findMany({
 where: {
 passengerId: session.user.id,
 status: "accepted",
 confirmedAt: null,
 ride: {
 dateTime: { lt: now },
 status: { not: "cancelled" },
 },
 },
 include: {
 ride: {
 select: {
 id: true,
 origin: true,
 destination: true,
 dateTime: true,
 pricePerSeat: true,
 driver: {
 select: { id: true, name: true, image: true },
 },
 },
 },
 },
 orderBy: { ride: { dateTime: "desc" } },
 });

 return NextResponse.json(pendingConfirmations);
 } catch (error) {
 console.error("Error fetching pending confirmations:", error);
 return NextResponse.json(
 { error: "Failed to fetch pending confirmations" },
 { status: 500 }
 );
 }
}




