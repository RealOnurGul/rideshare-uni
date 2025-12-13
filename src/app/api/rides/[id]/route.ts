import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyRideCancelled } from "@/lib/notifications";

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const { id } = await params;

 const ride = await prisma.ride.findUnique({
 where: { id },
 include: {
 driver: {
 select: { id: true, name: true, university: true, image: true },
 },
 vehicle: {
 select: { id: true, make: true, model: true, year: true, color: true, licensePlate: true },
 },
 bookings: {
 orderBy: { createdAt: "desc" },
 include: {
 passenger: {
 select: { id: true, name: true, university: true, image: true },
 },
 reviews: {
 select: { id: true, reviewerId: true, revieweeId: true },
 },
 },
 },
 },
 });

 if (!ride) {
 return NextResponse.json({ error: "Ride not found" }, { status: 404 });
 }

 return NextResponse.json(ride);
 } catch (error) {
 console.error("Error fetching ride:", error);
 return NextResponse.json({ error: "Failed to fetch ride" }, { status: 500 });
 }
}

// PATCH /api/rides/[id] - Update ride (cancel, complete, etc.)
export async function PATCH(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const { id } = await params;
 const body = await request.json();
 const { status } = body;

 const ride = await prisma.ride.findUnique({
 where: { id },
 include: {
 driver: { select: { name: true } },
 bookings: {
 where: { status: "accepted" },
 include: { passenger: { select: { id: true } } },
 },
 },
 });

 if (!ride) {
 return NextResponse.json({ error: "Ride not found" }, { status: 404 });
 }

 if (ride.driverId !== session.user.id) {
 return NextResponse.json({ error: "Only the driver can update this ride" }, { status: 403 });
 }

 if (status === "cancelled") {
 if (ride.status === "cancelled") {
 return NextResponse.json({ error: "Ride is already cancelled" }, { status: 400 });
 }

 // Cancel ride and all bookings
 await prisma.$transaction(async (tx) => {
 await tx.ride.update({
 where: { id },
 data: { status: "cancelled" },
 });

 await tx.booking.updateMany({
 where: { rideId: id, status: { in: ["pending", "accepted"] } },
 data: { status: "cancelled" },
 });
 });

 // Notify all accepted passengers
 const driverName = ride.driver.name || "Driver";
 for (const booking of ride.bookings) {
 await notifyRideCancelled(
 booking.passenger.id,
 driverName,
 id,
 ride.origin,
 ride.destination
 );
 }

 return NextResponse.json({ success: true, status: "cancelled" });
 }

 if (status === "completed") {
 if (ride.status !== "upcoming" && ride.status !== "in_progress") {
 return NextResponse.json({ error: "Can only complete upcoming or in-progress rides" }, { status: 400 });
 }

 const driverName = ride.driver.name || "Driver";

 // Update ride status and create notifications for passengers
 await prisma.$transaction(async (tx) => {
 await tx.ride.update({
 where: { id },
 data: { status: "completed" },
 });

 // Add system message to chat
 await tx.message.create({
 data: {
 rideId: id,
 content: `🏁 ${driverName} has marked this ride as complete. Please confirm and leave a review!`,
 isSystem: true,
 },
 });

 // Notify all accepted passengers to confirm and review
 for (const booking of ride.bookings) {
 // Set confirmation deadline (24 hours from now)
 const confirmDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
 
 await tx.booking.update({
 where: { id: booking.id },
 data: { confirmDeadline },
 });

 await tx.notification.create({
 data: {
 userId: booking.passenger.id,
 type: "ride_completed",
 title: "Ride Completed - Please Confirm",
 message: `${driverName} has marked your ride from ${ride.origin.split(",")[0]} to ${ride.destination.split(",")[0]} as complete. Please confirm and leave a review.`,
 rideId: id,
 bookingId: booking.id,
 },
 });
 }
 });

 return NextResponse.json({ success: true, status: "completed" });
 }

 return NextResponse.json({ error: "Invalid status" }, { status: 400 });
 } catch (error) {
 console.error("Error updating ride:", error);
 return NextResponse.json({ error: "Failed to update ride" }, { status: 500 });
 }
}
