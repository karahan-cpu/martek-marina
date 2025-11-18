import { db } from "./db";
import { pedestals } from "@shared/schema";

// Generate random 6-digit access code
function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate random position on marina map (600x400 grid)
function generatePosition(index: number) {
  const rows = 4;
  const cols = 5;
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  return {
    x: 100 + (col * 100) + Math.random() * 40 - 20, // spacing with slight randomness
    y: 80 + (row * 80) + Math.random() * 30 - 15,
  };
}

async function seedPedestals() {
  console.log("Seeding 20 pedestals...");
  
  const pedestalData = [];
  const statuses = ["available", "available", "available", "occupied", "maintenance"];
  
  for (let i = 1; i <= 20; i++) {
    const position = generatePosition(i - 1);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const accessCode = generateAccessCode();
    
    pedestalData.push({
      berthNumber: `A${i.toString().padStart(2, '0')}`,
      status,
      waterEnabled: false,
      electricityEnabled: false,
      waterUsage: status === "occupied" ? Math.floor(Math.random() * 500) : 0,
      electricityUsage: status === "occupied" ? Math.floor(Math.random() * 150) : 0,
      currentUserId: null,
      locationX: Math.floor(position.x),
      locationY: Math.floor(position.y),
      accessCode,
    });
  }
  
  try {
    await db.insert(pedestals).values(pedestalData);
    console.log(`✓ Successfully created 20 pedestals`);
    console.log("\nAccess Codes:");
    pedestalData.forEach((p, i) => {
      console.log(`  Berth ${p.berthNumber}: ${p.accessCode}`);
    });
  } catch (error: any) {
    if (error.message?.includes("duplicate key")) {
      console.log("Pedestals already exist, skipping seed...");
    } else {
      console.error("Error seeding pedestals:", error);
      throw error;
    }
  }
}

seedPedestals()
  .then(() => {
    console.log("\nSeed complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
