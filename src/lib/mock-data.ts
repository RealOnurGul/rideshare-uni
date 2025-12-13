// Mock data for demo/portfolio mode
// This file contains preseeded data that mimics your Prisma seed data
// Use this when deploying to Cloudflare Pages or other edge environments

export const DEMO_MODE = process.env.DEMO_MODE === "true";

// Mock users - based on your seed script
export const mockUsers = [
 {
 id: "user1",
 name: "Alex Smith",
 email: "alex.smith@mcgill.ca",
 university: "McGill University",
 image: null,
 bio: "Love road trips and meeting new people!",
 createdAt: new Date("2024-01-15"),
 },
 {
 id: "user2",
 name: "Jordan Johnson",
 email: "jordan.johnson@concordia.ca",
 university: "Concordia University",
 image: null,
 bio: null,
 createdAt: new Date("2024-02-01"),
 },
 {
 id: "user3",
 name: "Taylor Williams",
 email: "taylor.williams@umontreal.ca",
 university: "Université de Montréal",
 image: null,
 bio: "Love road trips and meeting new people!",
 createdAt: new Date("2024-02-10"),
 },
 {
 id: "user4",
 name: "Emma Brown",
 email: "emma.brown@mcgill.ca",
 university: "McGill University",
 image: null,
 bio: null,
 createdAt: new Date("2024-02-15"),
 },
 {
 id: "user5",
 name: "Noah Jones",
 email: "noah.jones@concordia.ca",
 university: "Concordia University",
 image: null,
 bio: null,
 createdAt: new Date("2024-02-20"),
 },
];

// Mock vehicles
export const mockVehicles = [
 {
 id: "vehicle1",
 userId: "user1",
 make: "Toyota",
 model: "Camry",
 year: 2020,
 color: "Black",
 licensePlate: "ABC 123",
 isDefault: true,
 },
 {
 id: "vehicle2",
 userId: "user2",
 make: "Honda",
 model: "Civic",
 year: 2019,
 color: "White",
 licensePlate: "XYZ 789",
 isDefault: true,
 },
 {
 id: "vehicle3",
 userId: "user3",
 make: "Ford",
 model: "Focus",
 year: 2021,
 color: "Silver",
 licensePlate: "DEF 456",
 isDefault: true,
 },
];

// Mock rides - mix of upcoming and past
const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

export const mockRides = [
 {
 id: "ride1",
 driverId: "user1",
 vehicleId: "vehicle1",
 origin: "Montreal, QC",
 originLat: 45.5017,
 originLng: -73.5673,
 destination: "Toronto, ON",
 destinationLat: 43.6532,
 destinationLng: -79.3832,
 dateTime: tomorrow,
 pricePerSeat: 35.0,
 seatsTotal: 4,
 seatsAvailable: 2,
 notes: "Flexible on pickup time. Text me when you arrive!",
 status: "upcoming",
 luggageSpace: "medium",
 petsAllowed: false,
 smokingAllowed: false,
 musicAllowed: true,
 createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
 updatedAt: now,
 },
 {
 id: "ride2",
 driverId: "user2",
 vehicleId: "vehicle2",
 origin: "Quebec City, QC",
 originLat: 46.8139,
 originLng: -71.2080,
 destination: "Montreal, QC",
 destinationLat: 45.5017,
 destinationLng: -73.5673,
 dateTime: nextWeek,
 pricePerSeat: 25.0,
 seatsTotal: 3,
 seatsAvailable: 1,
 notes: null,
 status: "upcoming",
 luggageSpace: "small",
 petsAllowed: false,
 smokingAllowed: false,
 musicAllowed: true,
 createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
 updatedAt: now,
 },
 {
 id: "ride3",
 driverId: "user3",
 vehicleId: "vehicle3",
 origin: "Ottawa, ON",
 originLat: 45.4215,
 originLng: -75.6972,
 destination: "Montreal, QC",
 destinationLat: 45.5017,
 destinationLng: -73.5673,
 dateTime: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
 pricePerSeat: 20.0,
 seatsTotal: 4,
 seatsAvailable: 3,
 notes: null,
 status: "upcoming",
 luggageSpace: "large",
 petsAllowed: true,
 smokingAllowed: false,
 musicAllowed: false,
 createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
 updatedAt: now,
 },
 {
 id: "ride4",
 driverId: "user1",
 vehicleId: "vehicle1",
 origin: "Montreal, QC",
 originLat: 45.5017,
 originLng: -73.5673,
 destination: "Toronto, ON",
 destinationLat: 43.6532,
 destinationLng: -79.3832,
 dateTime: lastWeek,
 pricePerSeat: 35.0,
 seatsTotal: 4,
 seatsAvailable: 0,
 notes: null,
 status: "completed",
 luggageSpace: "medium",
 petsAllowed: false,
 smokingAllowed: false,
 musicAllowed: true,
 createdAt: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
 updatedAt: lastWeek,
 },
 {
 id: "ride5",
 driverId: "user2",
 vehicleId: "vehicle2",
 origin: "Montreal, QC",
 originLat: 45.5017,
 originLng: -73.5673,
 destination: "Quebec City, QC",
 destinationLat: 46.8139,
 destinationLng: -71.2080,
 dateTime: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
 pricePerSeat: 30.0,
 seatsTotal: 3,
 seatsAvailable: 2,
 notes: "Pickup at downtown location",
 status: "upcoming",
 luggageSpace: "medium",
 petsAllowed: false,
 smokingAllowed: false,
 musicAllowed: true,
 createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
 updatedAt: now,
 },
];

// Mock bookings
export const mockBookings = [
 {
 id: "booking1",
 rideId: "ride1",
 passengerId: "user2",
 status: "accepted",
 paymentStatus: "held",
 paymentAmount: 35.0,
 paidAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
 confirmedAt: null,
 confirmDeadline: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
 createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
 updatedAt: now,
 },
 {
 id: "booking2",
 rideId: "ride1",
 passengerId: "user3",
 status: "accepted",
 paymentStatus: "held",
 paymentAmount: 35.0,
 paidAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
 confirmedAt: null,
 confirmDeadline: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
 createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
 updatedAt: now,
 },
 {
 id: "booking3",
 rideId: "ride2",
 passengerId: "user4",
 status: "pending",
 paymentStatus: null,
 paymentAmount: null,
 paidAt: null,
 confirmedAt: null,
 confirmDeadline: null,
 createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
 updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
 },
 {
 id: "booking4",
 rideId: "ride4",
 passengerId: "user2",
 status: "completed",
 paymentStatus: "released",
 paymentAmount: 35.0,
 paidAt: new Date(lastWeek.getTime() - 1 * 24 * 60 * 60 * 1000),
 confirmedAt: new Date(lastWeek.getTime() + 12 * 60 * 60 * 1000),
 confirmDeadline: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000),
 createdAt: new Date(lastWeek.getTime() - 3 * 24 * 60 * 60 * 1000),
 updatedAt: lastWeek,
 },
];

// Mock messages
export const mockMessages = [
 {
 id: "msg1",
 rideId: "ride1",
 senderId: null,
 content: "Alex Smith created this ride",
 isSystem: true,
 createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
 },
 {
 id: "msg2",
 rideId: "ride1",
 senderId: "user2",
 content: "Hey! What time should we meet?",
 isSystem: false,
 createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
 },
 {
 id: "msg3",
 rideId: "ride1",
 senderId: "user1",
 content: "I'll be there 10 minutes early",
 isSystem: false,
 createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
 },
];

// Mock notifications
export const mockNotifications = [
 {
 id: "notif1",
 userId: "user2",
 type: "booking_accepted",
 title: "Booking accepted!",
 message: "Alex Smith accepted your booking request",
 rideId: "ride1",
 bookingId: "booking1",
 read: false,
 createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
 },
 {
 id: "notif2",
 userId: "user1",
 type: "booking_request",
 title: "New booking request",
 message: "Jordan Johnson requested a seat on your ride to Toronto, ON",
 rideId: "ride1",
 bookingId: "booking1",
 read: true,
 createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
 },
];

// Helper functions to filter mock data
export function getMockRides(filters?: {
 origin?: string;
 destination?: string;
 dateFrom?: string;
 dateTo?: string;
 university?: string;
 status?: string;
 includeHistory?: boolean;
}) {
 let rides = [...mockRides];

 if (filters) {
 if (!filters.includeHistory) {
 rides = rides.filter((r) => r.status === "upcoming" && r.seatsAvailable > 0);
 } else if (filters.status && filters.status !== "all") {
 rides = rides.filter((r) => r.status === filters.status);
 }

 if (filters.origin) {
 rides = rides.filter((r) => r.origin.toLowerCase().includes(filters.origin!.toLowerCase()));
 }

 if (filters.destination) {
 rides = rides.filter((r) => r.destination.toLowerCase().includes(filters.destination!.toLowerCase()));
 }

 if (filters.university) {
 const driverIds = mockUsers
 .filter((u) => u.university?.toLowerCase().includes(filters.university!.toLowerCase()))
 .map((u) => u.id);
 rides = rides.filter((r) => driverIds.includes(r.driverId));
 }
 }

 // Include driver and vehicle info
 return rides.map((ride) => {
 const driver = mockUsers.find((u) => u.id === ride.driverId);
 const vehicle = mockVehicles.find((v) => v.id === ride.vehicleId);
 const bookingsCount = mockBookings.filter(
 (b) => b.rideId === ride.id && b.status === "accepted"
 ).length;

 return {
 ...ride,
 driver: driver
 ? {
 id: driver.id,
 name: driver.name,
 university: driver.university,
 image: driver.image,
 }
 : null,
 vehicle: vehicle
 ? {
 id: vehicle.id,
 make: vehicle.make,
 model: vehicle.model,
 year: vehicle.year,
 color: vehicle.color,
 }
 : null,
 _count: {
 bookings: bookingsCount,
 },
 };
 });
}

export function getMockRideById(id: string) {
 const ride = mockRides.find((r) => r.id === id);
 if (!ride) return null;

 const driver = mockUsers.find((u) => u.id === ride.driverId);
 const vehicle = mockVehicles.find((v) => v.id === ride.vehicleId);
 const bookings = mockBookings
 .filter((b) => b.rideId === id)
 .map((b) => {
 const passenger = mockUsers.find((u) => u.id === b.passengerId);
 return {
 ...b,
 passenger: passenger
 ? {
 id: passenger.id,
 name: passenger.name,
 university: passenger.university,
 image: passenger.image,
 }
 : null,
 };
 });

 return {
 ...ride,
 driver: driver
 ? {
 id: driver.id,
 name: driver.name,
 university: driver.university,
 image: driver.image,
 }
 : null,
 vehicle: vehicle
 ? {
 id: vehicle.id,
 make: vehicle.make,
 model: vehicle.model,
 year: vehicle.year,
 color: vehicle.color,
 licensePlate: vehicle.licensePlate,
 }
 : null,
 bookings,
 };
}

