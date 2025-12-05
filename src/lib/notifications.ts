import { prisma } from "./prisma";

type NotificationType = 
  | "booking_request"
  | "booking_accepted"
  | "booking_declined"
  | "booking_cancelled"
  | "ride_cancelled";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  rideId?: string;
  bookingId?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  rideId,
  bookingId,
}: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      rideId,
      bookingId,
    },
  });
}

// Helper to notify driver of new booking request
export async function notifyBookingRequest(
  driverId: string,
  passengerName: string,
  rideId: string,
  bookingId: string,
  origin: string,
  destination: string
) {
  return createNotification({
    userId: driverId,
    type: "booking_request",
    title: "New Booking Request",
    message: `${passengerName} wants to join your ride from ${origin} to ${destination}`,
    rideId,
    bookingId,
  });
}

// Helper to notify passenger of booking acceptance
export async function notifyBookingAccepted(
  passengerId: string,
  driverName: string,
  rideId: string,
  bookingId: string,
  origin: string,
  destination: string
) {
  return createNotification({
    userId: passengerId,
    type: "booking_accepted",
    title: "Booking Accepted! 🎉",
    message: `${driverName} accepted your request for the ride from ${origin} to ${destination}`,
    rideId,
    bookingId,
  });
}

// Helper to notify passenger of booking decline
export async function notifyBookingDeclined(
  passengerId: string,
  driverName: string,
  rideId: string,
  bookingId: string,
  origin: string,
  destination: string
) {
  return createNotification({
    userId: passengerId,
    type: "booking_declined",
    title: "Booking Declined",
    message: `${driverName} declined your request for the ride from ${origin} to ${destination}`,
    rideId,
    bookingId,
  });
}

// Helper to notify driver when passenger cancels
export async function notifyBookingCancelled(
  driverId: string,
  passengerName: string,
  rideId: string,
  bookingId: string,
  origin: string,
  destination: string
) {
  return createNotification({
    userId: driverId,
    type: "booking_cancelled",
    title: "Booking Cancelled",
    message: `${passengerName} cancelled their booking for your ride from ${origin} to ${destination}`,
    rideId,
    bookingId,
  });
}

// Helper to notify all passengers when a ride is cancelled
export async function notifyRideCancelled(
  passengerId: string,
  driverName: string,
  rideId: string,
  origin: string,
  destination: string
) {
  return createNotification({
    userId: passengerId,
    type: "ride_cancelled",
    title: "Ride Cancelled",
    message: `${driverName} cancelled the ride from ${origin} to ${destination}`,
    rideId,
  });
}

