import { db } from "./db";
import { marinas, pedestals } from "@shared/schema";

// Seed 2 premium marinas
export async function seedMarinas() {
  console.log("🌊 Seeding premium marinas...");

  const marinaData = [
    {
      name: "Martek Marina İstanbul",
      location: "İstanbul, Turkey",
      description: "Our flagship premium marina in the heart of İstanbul, featuring state-of-the-art facilities and unparalleled service for discerning yacht owners.",
      amenities: ["24/7 Security", "High-Speed WiFi", "Fuel Station", "Restaurant & Bar", "Yacht Maintenance", "Concierge Service", "Swimming Pool", "Fitness Center"],
      totalBerths: 10,
      isPremium: true,
    },
    {
      name: "Martek Marina Bodrum",
      location: "Bodrum, Turkey",
      description: "Experience luxury yachting in the stunning Bodrum peninsula, with crystal-clear waters and world-class amenities tailored for premium clientele.",
      amenities: ["24/7 Security", "Premium WiFi", "On-site Chandlery", "Fine Dining", "Spa & Wellness", "VIP Lounge", "Helicopter Pad", "Private Beach"],
      totalBerths: 10,
      isPremium: true,
    },
  ];

  if (!db) throw new Error("Database not initialized");
  const createdMarinas = await db.insert(marinas).values(marinaData).returning();
  console.log(`✓ Created ${createdMarinas.length} premium marinas`);

  return createdMarinas;
}

// Seed 20 pedestals across the 2 marinas
export async function seedPedestals() {
  console.log("⚓ Seeding pedestals...");

  // Get the marinas first
  if (!db) throw new Error("Database not initialized");
  const allMarinas = await db.select().from(marinas);
  if (allMarinas.length < 2) {
    throw new Error("Need 2 marinas before seeding pedestals");
  }

  const [istanbulMarina, bodrumMarina] = allMarinas;

  const pedestalData = [
    // İstanbul Marina - 10 pedestals (A01-A10)
    ...Array.from({ length: 10 }, (_, i) => ({
      marinaId: istanbulMarina.id,
      berthNumber: `A${String(i + 1).padStart(2, '0')}`,
      status: i < 3 ? "available" : i < 7 ? "occupied" : "available",
      waterEnabled: false,
      electricityEnabled: false,
      waterUsage: 0,
      electricityUsage: 0,
      currentUserId: null,
      locationX: 100 + (i % 5) * 80,
      locationY: 100 + Math.floor(i / 5) * 80,
      accessCode: String(Math.floor(100000 + Math.random() * 900000)), // 6-digit code
    })),
    // Bodrum Marina - 10 pedestals (B01-B10)
    ...Array.from({ length: 10 }, (_, i) => ({
      marinaId: bodrumMarina.id,
      berthNumber: `B${String(i + 1).padStart(2, '0')}`,
      status: i < 4 ? "available" : i < 6 ? "occupied" : "available",
      waterEnabled: false,
      electricityEnabled: false,
      waterUsage: 0,
      electricityUsage: 0,
      currentUserId: null,
      locationX: 100 + (i % 5) * 80,
      locationY: 100 + Math.floor(i / 5) * 80,
      accessCode: String(Math.floor(100000 + Math.random() * 900000)), // 6-digit code
    })),
  ];

  if (!db) throw new Error("Database not initialized");
  const createdPedestals = await db.insert(pedestals).values(pedestalData).returning();
  console.log(`✓ Created ${createdPedestals.length} pedestals`);

  return createdPedestals;
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await seedMarinas();
      await seedPedestals();
      console.log("✓ Seeding complete!");
      process.exit(0);
    } catch (error) {
      console.error("Error seeding database:", error);
      process.exit(1);
    }
  })();
}
