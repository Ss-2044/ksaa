// الاستخدام: npm run admin:create -- <username> <password>
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [username, password] = process.argv.slice(2);
if (!username || !password || password.length < 10) {
  console.error("Usage: npm run admin:create -- <username> <password (10+ chars)>");
  process.exit(1);
}

const db = new PrismaClient();
db.admin
  .upsert({
    where: { username },
    create: { username, passwordHash: bcrypt.hashSync(password, 12) },
    update: { passwordHash: bcrypt.hashSync(password, 12) },
  })
  .then(() => console.log(`✓ admin "${username}" saved (password hashed with bcrypt)`))
  .finally(() => db.$disconnect());
