import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/bookings/[id]/confirm - Confirm ride completion and optionally leave a review
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

 // Get the booking with ride info
 const booking = await prisma.booking.findUnique({
 where: { id: bookingId },
 include: {
 ride: {
 include: {
 driver: { select: { id: true, name: true } },
 },
 },
 },
 });

 if (!booking) {
 return NextResponse.json({ error: "Booking not found" }, { status: 404 });
 }

 // Check if user is the passenger
 if (booking.passengerId !== session.user.id) {
 return NextResponse.json(
 { error: "Only the passenger can confirm this booking" },
 { status: 403 }
 );
 }

 // Check if booking is accepted
 if (booking.status !== "accepted") {
 return NextResponse.json(
 { error: "Only accepted bookings can be confirmed" },
 { status: 400 }
 );
 }

 // Check if ride is completed (driver marked it) OR ride time has passed
 const rideTime = new Date(booking.ride.dateTime);
 if (booking.ride.status !== "completed" && new Date() < rideTime) {
 return NextResponse.json(
 { error: "Cannot confirm before the driver marks the ride as complete or before the ride has started" },
 { status: 400 }
 );
 }

 // Check if already confirmed
 if (booking.confirmedAt) {
 return NextResponse.json(
 { error: "This ride has already been confirmed" },
 { status: 400 }
 );
 }

 // Validate rating if provided
 if (rating !== undefined && (rating < 1 || rating > 5)) {
 return NextResponse.json(
 { error: "Rating must be between 1 and 5" },
 { status: 400 }
 );
 }

 // Use transaction to update booking and create review
 const result = await prisma.$transaction(async (tx) => {
 // Update booking status and confirmation
 const updatedBooking = await tx.booking.update({
 where: { id: bookingId },
 data: {
 status: "completed",
 confirmedAt: new Date(),
 paymentStatus: "released",
 },
 });

 // Create review if rating provided (passenger reviewing driver)
 let review = null;
 if (rating) {
 // Check if passenger already reviewed this driver for this booking
 const existingReview = await tx.review.findUnique({
 where: {
 bookingId_reviewerId: {
 bookingId,
 reviewerId: session.user.id,
 },
 },
 });

 if (!existingReview) {
 review = await tx.review.create({
 data: {
 bookingId,
 reviewerId: session.user.id, // Passenger
 revieweeId: booking.ride.driverId, // Driver
 rating,
 comment: comment || null,
 },
 });
 }
 }

 // Check if all bookings for this ride are confirmed
 const pendingBookings = await tx.booking.count({
 where: {
 rideId: booking.rideId,
 status: "accepted",
 },
 });

 // If no more pending/accepted bookings, mark ride as completed
 if (pendingBookings === 0) {
 await tx.ride.update({
 where: { id: booking.rideId },
 data: { status: "completed" },
 });
 }

 return { booking: updatedBooking, review };
 });

 return NextResponse.json({
 message: "Ride confirmed successfully",
 ...result,
 });
 } catch (error) {
 console.error("Error confirming booking:", error);
 return NextResponse.json(
 { error: "Failed to confirm booking" },
 { status: 500 }
 );
 }
}

