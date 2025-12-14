import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Canadian cities and locations
const canadianLocations = [
  { city: "Montreal", lat: 45.5017, lng: -73.5673 },
  { city: "Toronto", lat: 43.6532, lng: -79.3832 },
  { city: "Ottawa", lat: 45.4215, lng: -75.6972 },
  { city: "Quebec City", lat: 46.8139, lng: -71.2080 },
  { city: "Kingston", lat: 44.2312, lng: -76.4860 },
  { city: "London", lat: 42.9849, lng: -81.2453 },
  { city: "Hamilton", lat: 43.2557, lng: -79.8711 },
  { city: "Windsor", lat: 42.3149, lng: -83.0364 },
];

// Expanded list of Canadian universities
const universities = [
  "McGill University",
  "Concordia University",
  "Université de Montréal",
  "University of Toronto",
  "University of Ottawa",
  "University of British Columbia",
  "McMaster University",
  "University of Alberta",
  "University of Waterloo",
  "Western University",
  "Queen's University",
  "University of Calgary",
  "Simon Fraser University",
  "York University",
  "Dalhousie University",
  "Université Laval",
  "University of Victoria",
  "University of Saskatchewan",
];

// Map of university domains
const universityDomains: Record<string, string> = {
  "McGill University": "mcgill.ca",
  "Concordia University": "mail.concordia.ca",
  "Université de Montréal": "umontreal.ca",
  "University of Toronto": "mail.utoronto.ca",
  "University of Ottawa": "uottawa.ca",
  "University of British Columbia": "student.ubc.ca",
  "McMaster University": "mcmaster.ca",
  "University of Alberta": "ualberta.ca",
  "University of Waterloo": "uwaterloo.ca",
  "Western University": "uwo.ca",
  "Queen's University": "queensu.ca",
  "University of Calgary": "ucalgary.ca",
  "Simon Fraser University": "sfu.ca",
  "York University": "my.yorku.ca",
  "Dalhousie University": "dal.ca",
  "Université Laval": "ulaval.ca",
  "University of Victoria": "uvic.ca",
  "University of Saskatchewan": "usask.ca",
};

// Separate male and female first names for proper gender matching
const maleFirstNames = [
  "Liam", "Noah", "Oliver", "Ethan", "Aiden", "Lucas", "Mason", "Jackson",
  "James", "Benjamin", "Henry", "Alexander", "Michael", "Daniel", "Matthew", "David",
  "Nathan", "Samuel", "Jacob", "Ryan", "Tyler", "Nicholas", "Andrew", "Christopher",
  "Joshua", "Connor", "Jonathan", "Caleb", "Luke", "Jack", "Owen", "Isaac",
  "Sebastian", "Julian", "Aiden", "Evan", "Adam", "Nathaniel", "Max", "Leo"
];

const femaleFirstNames = [
  "Emma", "Olivia", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia", "Harper",
  "Emily", "Abigail", "Elizabeth", "Ella", "Avery", "Sofia", "Scarlett", "Grace",
  "Chloe", "Victoria", "Riley", "Aria", "Lily", "Natalie", "Zoe", "Hannah",
  "Lillian", "Addison", "Aubrey", "Eleanor", "Stella", "Savannah", "Leah", "Audrey",
  "Bella", "Nora", "Lucy", "Anna", "Caroline", "Maya", "Layla", "Penelope"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor",
  "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Sanchez",
  "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
];

const vehicleMakes = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "Hyundai", "Mazda", "Subaru"];
const vehicleModels: Record<string, string[]> = {
  "Toyota": ["Camry", "Corolla", "RAV4", "Prius", "Highlander"],
  "Honda": ["Civic", "Accord", "CR-V", "Pilot", "Fit"],
  "Ford": ["Fusion", "Focus", "Escape", "Explorer", "Mustang"],
  "Chevrolet": ["Malibu", "Cruze", "Equinox", "Tahoe", "Impala"],
  "Nissan": ["Altima", "Sentra", "Rogue", "Pathfinder", "Versa"],
  "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Accent"],
  "Mazda": ["Mazda3", "Mazda6", "CX-5", "CX-9", "CX-3"],
  "Subaru": ["Impreza", "Legacy", "Outback", "Forester", "Crosstrek"],
};

const colors = ["Black", "White", "Silver", "Gray", "Blue", "Red", "Green", "Brown"];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateLicensePlate(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  return `${randomElement(Array.from(letters))}${randomElement(Array.from(letters))}${randomElement(Array.from(letters))} ${randomElement(Array.from(numbers))}${randomElement(Array.from(numbers))}${randomElement(Array.from(numbers))}`;
}

function generateEmail(firstName: string, lastName: string, domain: string): string {
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName[0].toLowerCase()}${randomInt(1, 99)}`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}`,
  ];
  return `${randomElement(formats)}@${domain}`;
}

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Cleaning database...");
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.ride.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("👥 Creating users...");
  const users: any[] = [];
  
  // Fetch young people images from RandomUser API (age 20-30)
  console.log("📸 Fetching profile pictures...");
  const imageCache: string[] = [];
  for (let i = 0; i < 50; i++) {
    const gender = i % 2 === 0 ? 'female' : 'male';
    try {
      const response = await fetch(`https://randomuser.me/api/?gender=${gender}&seed=${i}&nat=ca,us&age=20-30`);
      const data = await response.json();
      if (data.results && data.results[0] && data.results[0].picture && data.results[0].picture.large) {
        imageCache.push(data.results[0].picture.large);
      } else {
        // Fallback to portrait service
        const portraitId = i % 99;
        imageCache.push(`https://randomuser.me/api/portraits/${gender === 'female' ? 'women' : 'men'}/${portraitId}.jpg`);
      }
    } catch (error) {
      // Fallback to portrait service on error
      const portraitId = i % 99;
      imageCache.push(`https://randomuser.me/api/portraits/${gender === 'female' ? 'women' : 'men'}/${portraitId}.jpg`);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Create 50 users with proper gender matching
  for (let i = 0; i < 50; i++) {
    // Determine gender first (50/50 split)
    const isFemale = i % 2 === 0;
    const firstName = isFemale 
      ? randomElement(femaleFirstNames)
      : randomElement(maleFirstNames);
    const lastName = randomElement(lastNames);
    const university = randomElement(universities);
    const domain = universityDomains[university];
    const email = generateEmail(firstName, lastName, domain);
    
    // Hash a simple password for all seed users
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // Use cached image from RandomUser API
    const imageUrl = imageCache[i];
    
    const fullName = `${firstName} ${lastName}`;
    
    // Generate phone number (Canadian format)
    const areaCodes = ["514", "438", "450", "418", "819", "613", "416", "647", "437", "905", "289", "365", "604", "778", "250", "236", "403", "587", "780", "306", "204", "902", "506"];
    const areaCode = randomElement(areaCodes);
    
    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        university,
        password: hashedPassword,
        phone: `+1 (${areaCode}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
        image: imageUrl,
        bio: i % 3 === 0 ? randomElement([
          "Love road trips and meeting new people!",
          "Student at " + university.split(" ")[0] + ". Always down for a ride!",
          "Looking to split gas costs with fellow students.",
          null,
        ]) : null,
        emailVerified: new Date(),
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);

  // Create vehicles for some users (about 60% of users have vehicles)
  console.log("🚗 Creating vehicles...");
  const vehicles = [];
  const usersWithVehicles = users.slice(0, 30); // First 30 users (60% of 50) have vehicles
  
  for (const user of usersWithVehicles) {
    const make = randomElement(vehicleMakes);
    const model = randomElement(vehicleModels[make]);
    const vehicle: any = await prisma.vehicle.create({
      data: {
        userId: user.id,
        make,
        model,
        year: randomInt(2015, 2024),
        color: randomElement(colors),
        licensePlate: generateLicensePlate(),
        isDefault: vehicles.length === 0, // First vehicle is default
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      },
    });
    vehicles.push(vehicle);
  }

  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Create rides
  console.log("🚙 Creating rides...");
  const rides = [];
  const now = new Date();
  const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const rideStatuses = ["upcoming", "upcoming", "upcoming", "completed", "completed", "cancelled"]; // More upcoming rides
  const luggageOptions = ["none", "small", "medium", "large"];

  for (let i = 0; i < 40; i++) {
    const driver = randomElement(usersWithVehicles);
    const vehicle = vehicles.find(v => v.userId === driver.id) || randomElement(vehicles);
    const origin = randomElement(canadianLocations);
    const destination = randomElement(canadianLocations.filter(l => l.city !== origin.city));
    
    const rideDate = randomDate(pastDate, futureDate);
    const isPast = rideDate < now;
    const isFuture = rideDate > now;
    
    let status: string;
    if (isPast) {
      status = randomElement(["completed", "completed", "cancelled"]);
    } else if (isFuture) {
      status = randomElement(["upcoming", "upcoming", "upcoming", "upcoming", "cancelled"]);
    } else {
      status = "in_progress";
    }

    const seatsTotal = randomInt(2, 5);
    const seatsBooked = status === "completed" ? randomInt(1, seatsTotal - 1) : 
                       status === "upcoming" ? randomInt(0, Math.floor(seatsTotal / 2)) : 0;
    const seatsAvailable = seatsTotal - seatsBooked;

    const ride = await prisma.ride.create({
      data: {
        driverId: driver.id,
        vehicleId: vehicle.id,
        origin: `${origin.city}, QC`,
        originLat: origin.lat + randomFloat(-0.1, 0.1),
        originLng: origin.lng + randomFloat(-0.1, 0.1),
        destination: `${destination.city}, ON`,
        destinationLat: destination.lat + randomFloat(-0.1, 0.1),
        destinationLng: destination.lng + randomFloat(-0.1, 0.1),
        dateTime: rideDate,
        pricePerSeat: Math.round(randomFloat(15, 80) * 10) / 10, // Round to nearest 10 cents (ends in .10, .20, .30, etc.)
        seatsTotal,
        seatsAvailable,
        status,
        luggageSpace: randomElement(luggageOptions),
        petsAllowed: Math.random() > 0.8,
        smokingAllowed: false,
        musicAllowed: Math.random() > 0.3,
        notes: Math.random() > 0.7 ? "Flexible on pickup time. Text me when you arrive!" : null,
        createdAt: randomDate(new Date(rideDate.getTime() - 7 * 24 * 60 * 60 * 1000), rideDate),
      },
    });
    rides.push(ride);
  }

  console.log(`✅ Created ${rides.length} rides`);

  // Create bookings
  console.log("🎫 Creating bookings...");
  const bookings = [];
  
  for (const ride of rides) {
    if (ride.status === "cancelled") continue;
    
    const driver = users.find(u => u.id === ride.driverId)!;
    const availablePassengers = users.filter(u => u.id !== driver.id);
    const numBookings = randomInt(0, Math.min(ride.seatsTotal - ride.seatsAvailable, availablePassengers.length));
    
    const selectedPassengers = availablePassengers
      .sort(() => Math.random() - 0.5)
      .slice(0, numBookings);

    for (const passenger of selectedPassengers) {
      let bookingStatus: string;
      if (ride.status === "completed") {
        bookingStatus = "completed";
      } else if (ride.status === "upcoming") {
        bookingStatus = randomElement(["pending", "accepted", "accepted", "accepted"]);
      } else {
        bookingStatus = "accepted";
      }

      const booking = await prisma.booking.create({
        data: {
          rideId: ride.id,
          passengerId: passenger.id,
          status: bookingStatus,
          paymentStatus: bookingStatus === "accepted" || bookingStatus === "completed" ? "held" : null,
          paymentAmount: ride.pricePerSeat,
          paidAt: bookingStatus !== "pending" ? randomDate(ride.createdAt, ride.dateTime) : null,
          confirmedAt: bookingStatus === "completed" ? randomDate(ride.dateTime, new Date(ride.dateTime.getTime() + 24 * 60 * 60 * 1000)) : null,
          confirmDeadline: bookingStatus === "completed" ? new Date(ride.dateTime.getTime() + 24 * 60 * 60 * 1000) : null,
          createdAt: randomDate(ride.createdAt, ride.dateTime),
        },
      });
      bookings.push(booking);
    }
  }

  console.log(`✅ Created ${bookings.length} bookings`);

  // Create messages
  console.log("💬 Creating messages...");
  let messageCount = 0;
  
  for (const ride of rides.slice(0, 20)) { // Messages for first 20 rides
    const driver = users.find(u => u.id === ride.driverId)!;
    const rideBookings = bookings.filter(b => b.rideId === ride.id);
    const participants = [driver, ...rideBookings.map(b => users.find(u => u.id === b.passengerId)!).filter(Boolean)];
    
    // System message
    await prisma.message.create({
      data: {
        rideId: ride.id,
        senderId: null,
        content: `${driver.name} created this ride`,
        isSystem: true,
        createdAt: ride.createdAt,
      },
    });
    messageCount++;

    // User messages
    const numMessages = randomInt(3, 12);
    for (let i = 0; i < numMessages; i++) {
      const sender = randomElement(participants);
      const messages = [
        "Hey! What time should we meet?",
        "I'll be there 10 minutes early",
        "Thanks for the ride!",
        "See you soon!",
        "Can we make a quick stop?",
        "Perfect, see you then!",
        "Running a bit late, be there in 5!",
        "Thanks everyone!",
        "Great ride today!",
        "Looking forward to it!",
      ];
      
      await prisma.message.create({
        data: {
          rideId: ride.id,
          senderId: sender.id,
          content: randomElement(messages),
          isSystem: false,
          createdAt: randomDate(ride.createdAt, ride.dateTime),
        },
      });
      messageCount++;
    }
  }

  console.log(`✅ Created ${messageCount} messages`);

  // Create notifications
  console.log("🔔 Creating notifications...");
  let notificationCount = 0;
  
  for (const booking of bookings) {
    const ride = rides.find(r => r.id === booking.rideId)!;
    const driver = users.find(u => u.id === ride.driverId)!;
    const passenger = users.find(u => u.id === booking.passengerId)!;

    // Notification for driver
    if (booking.status === "pending") {
      await prisma.notification.create({
        data: {
          userId: driver.id,
          type: "booking_request",
          title: "New booking request",
          message: `${passenger.name} requested a seat on your ride to ${ride.destination}`,
          rideId: ride.id,
          bookingId: booking.id,
          read: Math.random() > 0.5,
          createdAt: booking.createdAt,
        },
      });
      notificationCount++;
    }

    // Notification for passenger
    if (booking.status === "accepted") {
      await prisma.notification.create({
        data: {
          userId: passenger.id,
          type: "booking_accepted",
          title: "Booking accepted!",
          message: `${driver.name} accepted your booking request`,
          rideId: ride.id,
          bookingId: booking.id,
          read: Math.random() > 0.3,
          createdAt: booking.createdAt,
        },
      });
      notificationCount++;
    } else if (booking.status === "declined") {
      await prisma.notification.create({
        data: {
          userId: passenger.id,
          type: "booking_declined",
          title: "Booking declined",
          message: `${driver.name} declined your booking request`,
          rideId: ride.id,
          bookingId: booking.id,
          read: true,
          createdAt: booking.createdAt,
        },
      });
      notificationCount++;
    }
  }

  console.log(`✅ Created ${notificationCount} notifications`);

  // Create reviews for completed bookings
  console.log("⭐ Creating reviews...");
  let reviewCount = 0;
  const completedBookings = bookings.filter(b => b.status === "completed");
  
  for (const booking of completedBookings.slice(0, 15)) {
    const ride = rides.find(r => r.id === booking.rideId)!;
    const driver = users.find(u => u.id === ride.driverId)!;
    const passenger = users.find(u => u.id === booking.passengerId)!;

    // Passenger reviews driver
    if (Math.random() > 0.2) {
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          reviewerId: passenger.id,
          revieweeId: driver.id,
          rating: randomInt(4, 5), // Mostly positive
          comment: randomElement([
            "Great driver, very punctual!",
            "Smooth ride, would book again.",
            "Friendly and safe driver.",
            "Thanks for the ride!",
            "Comfortable car and great conversation.",
            null, // Some without comments
          ]),
          createdAt: randomDate(ride.dateTime, new Date()),
        },
      });
      reviewCount++;
    }

    // Driver reviews passenger
    if (Math.random() > 0.3) {
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          reviewerId: driver.id,
          revieweeId: passenger.id,
          rating: randomInt(4, 5),
          comment: randomElement([
            "Great passenger, on time!",
            "Pleasant company.",
            "Would drive again!",
            null,
          ]),
          createdAt: randomDate(ride.dateTime, new Date()),
        },
      });
      reviewCount++;
    }
  }

  console.log(`✅ Created ${reviewCount} reviews`);

  console.log("\n🎉 Seed completed successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${vehicles.length} vehicles`);
  console.log(`   - ${rides.length} rides`);
  console.log(`   - ${bookings.length} bookings`);
  console.log(`   - ${messageCount} messages`);
  console.log(`   - ${notificationCount} notifications`);
  console.log(`   - ${reviewCount} reviews`);
  console.log(`\n🔑 All seed users have password: password123`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

