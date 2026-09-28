import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const CATEGORIES = [
  { slug: "phones", name: "جوالات", icon: "phone" },
  { slug: "laptops", name: "لابتوبات", icon: "laptop" },
  { slug: "tablets", name: "لوحية", icon: "tablet" },
  { slug: "smartwatches", name: "ساعات ذكية", icon: "watch" },
  { slug: "headphones", name: "سماعات", icon: "headphones" },
  { slug: "desktops", name: "كمبيوتر مكتبي", icon: "desktop" },
  { slug: "cameras", name: "كاميرات", icon: "camera" },
  { slug: "accessories", name: "اكسسوارات", icon: "accessories" },
  { slug: "other", name: "أخرى", icon: "other" },
];

async function main() {
  for (const [i, c] of CATEGORIES.entries()) {
    await db.category.upsert({
      where: { slug: c.slug },
      create: { ...c, sortOrder: c.slug === "other" ? 999 : (i + 1) * 10 },
      update: {},
    });
  }
  console.log(`✓ ${CATEGORIES.length} categories`);

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (username && password) {
    if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters");
    const exists = await db.admin.findUnique({ where: { username } });
    if (!exists) {
      await db.admin.create({ data: { username, passwordHash: await bcrypt.hash(password, 12) } });
      console.log(`✓ admin "${username}" created (bcrypt)`);
    } else console.log(`• admin "${username}" already exists`);
  }
}

main().finally(() => db.$disconnect());
