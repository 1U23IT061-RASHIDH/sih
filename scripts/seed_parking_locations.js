require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const OOTY_PARKING_DATA = [
  {
    name: "Ooty Lake",
    tamil_name: "ஊட்டி ஏரி",
    latitude: 11.4102,
    longitude: 76.6950,
    type: "ATTRACTION",
    description: "Artificial lake built by John Sullivan in 1824. Famous for boating.",
    facilities: [
      { vehicleType: "CAR", totalSlots: 200, hourlyRate: 40 },
      { vehicleType: "BIKE", totalSlots: 500, hourlyRate: 15 },
      { vehicleType: "BUS", totalSlots: 40, hourlyRate: 100 },
    ]
  },
  {
    name: "Botanical Garden",
    tamil_name: "தாவரவியல் பூங்கா",
    latitude: 11.4150,
    longitude: 76.7100,
    type: "ATTRACTION",
    description: "22-hectare terraced garden with over 1000 species of exotic and indigenous plants.",
    facilities: [
      { vehicleType: "CAR", totalSlots: 150, hourlyRate: 50 },
      { vehicleType: "BIKE", totalSlots: 350, hourlyRate: 20 },
      { vehicleType: "BUS", totalSlots: 30, hourlyRate: 120 },
    ]
  },
  {
    name: "Doddabetta Peak",
    tamil_name: "தொட்டபெட்டா சிகரம்",
    latitude: 11.4012,
    longitude: 76.7348,
    type: "ATTRACTION",
    description: "Highest peak in the Nilgiri Hills (2,637 m). Panoramic views of Ooty and valleys.",
    facilities: [
      { vehicleType: "CAR", totalSlots: 80, hourlyRate: 60 },
      { vehicleType: "BIKE", totalSlots: 200, hourlyRate: 25 },
      { vehicleType: "BUS", totalSlots: 10, hourlyRate: 150 },
    ]
  },
  {
    name: "Rose Garden",
    tamil_name: "ரோஜா தோட்டம்",
    latitude: 11.4065,
    longitude: 76.7160,
    type: "ATTRACTION",
    description: "One of the largest rose gardens in India with 20,000+ varieties of roses.",
    facilities: [
      { vehicleType: "CAR", totalSlots: 120, hourlyRate: 40 },
      { vehicleType: "BIKE", totalSlots: 250, hourlyRate: 15 },
      { vehicleType: "BUS", totalSlots: 20, hourlyRate: 100 },
    ]
  },
  {
    name: "Pykara Falls & Lake",
    tamil_name: "பைகாரா அருவி & ஏரி",
    latitude: 11.4650,
    longitude: 76.5980,
    type: "ATTRACTION",
    description: "Majestic waterfalls and serene lake. Known for speedboating and scenic beauty.",
    facilities: [
      { vehicleType: "CAR", totalSlots: 140, hourlyRate: 35 },
      { vehicleType: "BIKE", totalSlots: 300, hourlyRate: 15 },
      { vehicleType: "BUS", totalSlots: 25, hourlyRate: 100 },
    ]
  },
  {
    name: "Avalanche Lake",
    tamil_name: "அவலான்சே ஏரி",
    latitude: 11.3100,
    longitude: 76.5700,
    type: "ATTRACTION",
    description: "Pristine lake surrounded by dense shola forests. Trout fishing and eco-tourism.",
    facilities: [
      { vehicleType: "CAR", totalSlots: 60, hourlyRate: 50 },
      { vehicleType: "BIKE", totalSlots: 150, hourlyRate: 20 },
    ]
  },
  {
    name: "Emerald Lake",
    tamil_name: "எமரால்டு ஏரி",
    latitude: 11.3750,
    longitude: 76.5800,
    type: "ATTRACTION",
    description: "Peaceful lake nestled in the Silent Valley region. Tea plantations and sunrise spot.",
    facilities: [
      { vehicleType: "CAR", totalSlots: 80, hourlyRate: 30 },
      { vehicleType: "BIKE", totalSlots: 180, hourlyRate: 15 },
      { vehicleType: "BUS", totalSlots: 15, hourlyRate: 80 },
    ]
  },
  {
    name: "Shooting Point / Pine Forest",
    tamil_name: "பைன் காடுகள்",
    latitude: 11.4420,
    longitude: 76.6520,
    type: "ATTRACTION",
    description: "Towering pine tree forests featured in numerous Bollywood and South Indian movies.",
    facilities: [
      { vehicleType: "CAR", totalSlots: 100, hourlyRate: 40 },
      { vehicleType: "BIKE", totalSlots: 200, hourlyRate: 15 },
      { vehicleType: "BUS", totalSlots: 20, hourlyRate: 100 },
    ]
  }
];

async function seed() {
  console.log('Seeding Parking Locations & Facilities into MongoDB...');

  for (const loc of OOTY_PARKING_DATA) {
    const location = await prisma.location.upsert({
      where: { name: loc.name },
      update: {
        latitude: loc.latitude,
        longitude: loc.longitude,
        description: loc.description,
        type: loc.type,
      },
      create: {
        name: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        description: loc.description,
        type: loc.type,
        crowdThreshold: 200,
        currentCount: 30,
      }
    });

    console.log(`📍 Location upserted: ${location.name} (${location.id})`);

    for (const fac of loc.facilities) {
      const facility = await prisma.parkingFacility.upsert({
        where: {
          locationId_vehicleType: {
            locationId: location.id,
            vehicleType: fac.vehicleType
          }
        },
        update: {
          totalSlots: fac.totalSlots,
          hourlyRate: fac.hourlyRate
        },
        create: {
          locationId: location.id,
          vehicleType: fac.vehicleType,
          totalSlots: fac.totalSlots,
          hourlyRate: fac.hourlyRate
        }
      });
      console.log(`   🅿️ Facility: ${facility.vehicleType} | Slots: ${facility.totalSlots} | Rate: ₹${facility.hourlyRate}/hr`);
    }
  }

  console.log('\n✅ All Parking Locations & Facilities successfully seeded in DB!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
