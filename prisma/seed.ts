import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import bcrypt from "bcrypt";

const prisma = new PrismaClient({
    adapter: new PrismaPg({  connectionString: process.env.DATABASE_URL!  }),
});

async function main(){
    const email = "alissondinizleo@gmail.com";
    const passwordPlain = "@leonardO1997";
    const password = await bcrypt.hash(passwordPlain, 10);

    await prisma.user.upsert({
        where: {email}, 
        update: {password, role: Role.ADMIN, name: "Alisson"},
        create: {email, name: "Alisson", password, role: Role.ADMIN},
    });

    console.log("seed ok:")
    console.log("ADMIN:", `${email} / ${passwordPlain}`);

}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => prisma.$disconnect());
