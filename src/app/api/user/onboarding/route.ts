import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ALLOWED_DOMAINS, getUniversityName } from "@/lib/allowed-domains";

export async function POST(request: Request) {
 try {
 const session = await getServerSession(authOptions);
 
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized - please sign in again" }, { status: 401 });
 }

 // Check if user exists in database
 const existingUser = await prisma.user.findUnique({
 where: { id: session.user.id },
 });

 if (!existingUser) {
 return NextResponse.json(
 { error: "User not found. Please sign out and sign in again." },
 { status: 404 }
 );
 }

 const body = await request.json();
 const { universityEmail, phone } = body;

 // Validate university email
 if (!universityEmail) {
 return NextResponse.json({ error: "University email is required" }, { status: 400 });
 }

 const domain = universityEmail.split("@")[1]?.toLowerCase();
 if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
 return NextResponse.json(
 { error: "Invalid university email. Use @mcgill.ca, @concordia.ca, or @umontreal.ca" },
 { status: 400 }
 );
 }

 // Get university name from domain
 const university = getUniversityName(domain);
 
 if (!university) {
 return NextResponse.json(
 { error: "Could not determine university from email" },
 { status: 400 }
 );
 }

 // Update user profile
 const updatedUser = await prisma.user.update({
 where: { id: session.user.id },
 data: {
 university,
 phone: phone || null,
 },
 });

 return NextResponse.json({
 success: true,
 user: {
 id: updatedUser.id,
 university: updatedUser.university,
 },
 });
 } catch (error) {
 console.error("Error completing onboarding:", error);
 return NextResponse.json(
 { error: "Failed to complete profile. Please try signing out and back in." },
 { status: 500 }
 );
 }
}
