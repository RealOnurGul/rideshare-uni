import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
 try {
 // Get all unique origins and destinations from rides
 const rides = await prisma.ride.findMany({
 select: {
 origin: true,
 destination: true,
 },
 });

 // Collect unique locations
 const locationsSet = new Set<string>();
 rides.forEach((ride) => {
 locationsSet.add(ride.origin);
 locationsSet.add(ride.destination);
 });

 const locations = Array.from(locationsSet).sort();

 return NextResponse.json({ locations });
 } catch (error) {
 console.error("Error fetching locations:", error);
 return NextResponse.json(
 { error: "Failed to fetch locations" },
 { status: 500 }
 );
 }
}






