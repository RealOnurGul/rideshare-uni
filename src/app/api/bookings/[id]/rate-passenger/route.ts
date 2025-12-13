import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/bookings/[id]/rate-passenger - Driver rates a passenger
export async function POST(
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
 const { rating, comment } = body;

 // Get booking with ride info
 const booking = await prisma.booking.findUnique({
 where: { id: bookingId },
 include: {
 ride: {
 select: { driverId: true },
 },
 passenger: {
 select: { id: true, name: true },
 },
 },
 });

 if (!booking) {
 return NextResponse.json({ error: "Booking not found" }, { status: 404 });
 }

 // Check if user is the driver
 if (booking.ride.driverId !== session.user.id) {
 return NextResponse.json(
 { error: "Only the driver can rate passengers" },
 { status: 403 }
 );
 }

 // Validate rating
 if (!rating || rating < 1 || rating > 5) {
 return NextResponse.json(
 { error: "Rating must be between 1 and 5" },
 { status: 400 }
 );
 }

 // Check if driver already rated this passenger for this booking
 const existingReview = await prisma.review.findUnique({
 where: {
 bookingId_reviewerId: {
 bookingId,
 reviewerId: session.user.id, // Driver
 },
 },
 });

 if (existingReview) {
 return NextResponse.json(
 { error: "You have already rated this passenger" },
 { status: 400 }
 );
 }

 // Create review (driver rating passenger)
 await prisma.review.create({
 data: {
 bookingId,
 reviewerId: session.user.id, // Driver
 revieweeId: booking.passengerId, // Passenger
 rating,
 comment: comment || null,
 },
 });

 return NextResponse.json({ success: true });
 } catch (error) {
 console.error("Error rating passenger:", error);
 return NextResponse.json(
 { error: "Failed to submit rating" },
 { status: 500 }
 );
 }
}

