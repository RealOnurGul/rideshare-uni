import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/vehicles - Get user's vehicles
export async function GET() {
 try {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const vehicles = await prisma.vehicle.findMany({
 where: { userId: session.user.id },
 orderBy: { createdAt: "desc" },
 });

 return NextResponse.json(vehicles);
 } catch (error) {
 console.error("Error fetching vehicles:", error);
 return NextResponse.json(
 { error: "Failed to fetch vehicles" },
 { status: 500 }
 );
 }
}

// POST /api/vehicles - Create a new vehicle
export async function POST(request: Request) {
 try {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const body = await request.json();
 const { make, model, year, color, licensePlate, isDefault } = body;

 // Validation
 if (!make || !model || !year || !color || !licensePlate) {
 return NextResponse.json(
 { error: "All fields are required" },
 { status: 400 }
 );
 }

 // If this is the first vehicle or marked as default, set as default
 const existingVehicles = await prisma.vehicle.count({
 where: { userId: session.user.id },
 });

 const shouldBeDefault = existingVehicles === 0 || isDefault;

 // If setting as default, unset other defaults
 if (shouldBeDefault) {
 await prisma.vehicle.updateMany({
 where: { userId: session.user.id },
 data: { isDefault: false },
 });
 }

 const vehicle = await prisma.vehicle.create({
 data: {
 userId: session.user.id,
 make,
 model,
 year: parseInt(year),
 color,
 licensePlate: licensePlate.toUpperCase(),
 isDefault: shouldBeDefault,
 },
 });

 return NextResponse.json(vehicle, { status: 201 });
 } catch (error) {
 console.error("Error creating vehicle:", error);
 return NextResponse.json(
 { error: "Failed to create vehicle" },
 { status: 500 }
 );
 }
}




