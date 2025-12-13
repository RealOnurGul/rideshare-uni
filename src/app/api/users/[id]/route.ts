import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/[id] - Get public user profile
export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const { id } = await params;

 const user = await prisma.user.findUnique({
 where: { id },
 select: {
 id: true,
 name: true,
 image: true,
 university: true,
 bio: true,
 createdAt: true,
 // Get reviews received (where this user is the reviewee)
 reviewsReceived: {
 select: {
 id: true,
 rating: true,
 comment: true,
 createdAt: true,
 reviewer: {
 select: { id: true, name: true, image: true },
 },
 },
 orderBy: { createdAt: "desc" },
 },
 // Get reviews given (where this user is the reviewer)
 reviewsGiven: {
 select: {
 id: true,
 rating: true,
 comment: true,
 createdAt: true,
 reviewee: {
 select: { id: true, name: true, image: true },
 },
 },
 orderBy: { createdAt: "desc" },
 },
 // Count completed rides as driver
 rides: {
 where: { status: "completed" },
 select: { id: true },
 },
 // Count completed bookings as passenger
 bookings: {
 where: { status: "completed" },
 select: { id: true },
 },
 },
 });

 if (!user) {
 return NextResponse.json({ error: "User not found" }, { status: 404 });
 }

 // Calculate average rating
 const ratings = user.reviewsReceived.map((r) => r.rating);
 const averageRating = ratings.length > 0
 ? ratings.reduce((a, b) => a + b, 0) / ratings.length
 : null;

 return NextResponse.json({
 id: user.id,
 name: user.name,
 image: user.image,
 university: user.university,
 bio: user.bio,
 memberSince: user.createdAt,
 stats: {
 ridesAsDriver: user.rides.length,
 ridesAsPassenger: user.bookings.length,
 totalReviews: user.reviewsReceived.length,
 averageRating,
 },
 reviews: user.reviewsReceived,
 reviewsGiven: user.reviewsGiven,
 });
 } catch (error) {
 console.error("Error fetching user profile:", error);
 return NextResponse.json(
 { error: "Failed to fetch user profile" },
 { status: 500 }
 );
 }
}

