import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

async function main() {
  const passwordHash = await bcrypt.hash("test123", 12);

  const user = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: { email: "test@test.com", passwordHash },
  });

  const cars: Array<{
    make: string;
    model: string;
    year: number;
    askingPrice: number;
    mileage: number;
    regNumber: string;
    status: "WATCHING" | "INTERESTED" | "CONTACTED";
  }> = [
    {
      make: "Volvo",
      model: "V70",
      year: 2015,
      askingPrice: 89000,
      mileage: 142000,
      regNumber: "ABC123",
      status: "WATCHING",
    },
    {
      make: "Toyota",
      model: "Corolla",
      year: 2018,
      askingPrice: 149000,
      mileage: 68000,
      regNumber: "DEF456",
      status: "INTERESTED",
    },
    {
      make: "Volkswagen",
      model: "Golf",
      year: 2016,
      askingPrice: 109000,
      mileage: 95000,
      regNumber: "GHI789",
      status: "CONTACTED",
    },
  ];

  for (const car of cars) {
    const existing = await prisma.car.findFirst({
      where: { userId: user.id, regNumber: car.regNumber },
    });
    if (!existing) {
      await prisma.car.create({ data: { ...car, userId: user.id } });
    }
  }

  console.log(`Seeded user ${user.email} with ${cars.length} cars.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
