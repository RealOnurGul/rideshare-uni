import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/vehicles/[id] - Delete a vehicle
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle || vehicle.userId !== session.user.id) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}

// PATCH /api/vehicles/[id] - Update a vehicle
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle || vehicle.userId !== session.user.id) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (body.isDefault) {
      await prisma.vehicle.updateMany({
        where: { userId: session.user.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        make: body.make,
        model: body.model,
        year: body.year ? parseInt(body.year) : undefined,
        color: body.color,
        licensePlate: body.licensePlate?.toUpperCase(),
        isDefault: body.isDefault,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

