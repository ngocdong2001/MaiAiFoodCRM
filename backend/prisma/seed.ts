import "dotenv/config";

import { prisma } from "../src/lib/prisma";

const avatars = [
  "https://cdn.visily.ai/text2design/images/01837de52a9f0882c2fd1a7e437aec953140b7cf33c98f0c921e6728037101b5.webp",
  "https://cdn.visily.ai/text2design/images/1ad9ee6c66620f82a971daf6fdded160b9767b6787b2b3b1104edd9bf4b80df9.webp",
  "https://cdn.visily.ai/text2design/images/ca49b135f19875dad7236f2462e52332c089cf666ad920057a49a5b8e8a5de58.webp",
  "https://cdn.visily.ai/text2design/images/c2c8c1ecc4dec5cde231431d19bfb33910b91e5087086f724bbf9b0a794e4758.webp",
];

const staffSeeds = [
  { name: "Sarah Jenkins", role: "Senior Stylist", status: "active", email: "sarah.jenkins@maiai.local", phone: "0901000001", hourlyRate: 28, commissionRate: 12, avatarUrl: avatars[0], specialties: ["Nail Art", "Gel Extensions"], startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00", station: "Station 1" },
  { name: "Marcus Chen", role: "Colorist", status: "busy", email: "marcus.chen@maiai.local", phone: "0901000002", hourlyRate: 26, commissionRate: 10, avatarUrl: avatars[1], specialties: ["Gel Polish", "Pedicure"], startTime: "10:00", endTime: "18:00", breakStart: "12:30", breakEnd: "13:30", station: "Color Bar A" },
  { name: "Elena Rodriguez", role: "Junior Stylist", status: "active", email: "elena.rodriguez@maiai.local", phone: "0901000003", hourlyRate: 20, commissionRate: 8, avatarUrl: avatars[2], specialties: ["Manicure", "Gel Polish"], startTime: "09:00", endTime: "14:00", breakStart: "12:00", breakEnd: "12:45", station: "Station 4" },
  { name: "David Kim", role: "Senior Stylist", status: "on_leave", email: "david.kim@maiai.local", phone: "0901000004", hourlyRate: 30, commissionRate: 15, avatarUrl: avatars[3], specialties: ["Nail Art", "Acrylic Extensions"], startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00", station: "Station 2" },
];

const guestSeeds = [
  { name: "Eleanor Vance", email: "eleanor.v@example.com", phone: "+15551234567", totalVisits: 18, totalSpend: 4250, loyaltyPoints: 1460, memberSince: "2022-03-12", dateOfBirth: "1986-10-12", notes: "Prefers a gentle touch and sparkling water with lemon.", tags: ["VIP", "Sensitive Scalp"] },
  { name: "Emma Chen", email: "emma.chen@email.com", phone: "+14155550148", totalVisits: 17, totalSpend: 2410, loyaltyPoints: 730, memberSince: "2023-11-06", dateOfBirth: "1991-06-06", notes: "Prefers organic products and responds well to bundle offers by SMS.", tags: ["Loyal", "Quiet Chair"] },
  { name: "Sarah Kim", email: "sarah.kim@email.com", phone: "+16505550109", totalVisits: 6, totalSpend: 920, loyaltyPoints: 190, memberSince: "2024-01-21", dateOfBirth: "1994-05-21", notes: "Suitable for a win-back offer and birthday campaign.", tags: ["At Risk", "Morning Appointments"] },
  { name: "Mia Johnson", email: "mia.johnson@email.com", phone: "+15105550171", totalVisits: 31, totalSpend: 5220, loyaltyPoints: 1580, memberSince: "2021-08-02", dateOfBirth: "1989-02-02", notes: "Often buys retail products after service.", tags: ["VIP", "Retail Buyer"] },
];

const main = async () => {
  const now = new Date();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const specialtyNames = ["Manicure", "Pedicure", "Gel Polish", "Nail Art", "Gel Extensions", "Acrylic Extensions"];
  const specialties = new Map<string, number>();

  for (const name of specialtyNames) {
    const specialty = await prisma.staffspecialty.upsert({
      where: { name },
      create: { name, isActive: true, updatedAt: now },
      update: { isActive: true, updatedAt: now },
    });
    specialties.set(name, specialty.id);
  }

  for (const seed of staffSeeds) {
    const existing = await prisma.staff.findFirst({ where: { email: seed.email } });
    const staff = existing
      ? await prisma.staff.update({
          where: { id: existing.id },
          data: { name: seed.name, role: seed.role, status: seed.status, phone: seed.phone, avatarUrl: seed.avatarUrl, hourlyRate: seed.hourlyRate, commissionRate: seed.commissionRate, updatedAt: now },
        })
      : await prisma.staff.create({
          data: { name: seed.name, role: seed.role, status: seed.status, email: seed.email, phone: seed.phone, avatarUrl: seed.avatarUrl, hourlyRate: seed.hourlyRate, commissionRate: seed.commissionRate, joinDate: today, updatedAt: now },
        });

    await prisma.staffspecialtymapping.deleteMany({ where: { staffId: staff.id } });
    await prisma.staffspecialtymapping.createMany({
      data: seed.specialties.map((name) => ({ staffId: staff.id, specialtyId: specialties.get(name)! })),
      skipDuplicates: true,
    });

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() + dayOffset);
      const isDayOff = seed.status === "on_leave" || date.getUTCDay() === 0;
      await prisma.staffschedule.upsert({
        where: { staffId_date: { staffId: staff.id, date } },
        create: { staffId: staff.id, date, startTime: seed.startTime, endTime: seed.endTime, breakStart: isDayOff ? null : seed.breakStart, breakEnd: isDayOff ? null : seed.breakEnd, isDayOff, note: seed.station, updatedAt: now },
        update: { startTime: seed.startTime, endTime: seed.endTime, breakStart: isDayOff ? null : seed.breakStart, breakEnd: isDayOff ? null : seed.breakEnd, isDayOff, note: seed.station, updatedAt: now },
      });
    }
  }

  const guestTagNames = [...new Set(guestSeeds.flatMap((guest) => guest.tags))];
  const guestTags = new Map<string, number>();
  for (const [index, name] of guestTagNames.entries()) {
    const tag = await prisma.guesttag.upsert({
      where: { name },
      create: { name, color: "#F04CAC", isActive: true, sortOrder: index, updatedAt: now },
      update: { isActive: true, sortOrder: index, updatedAt: now },
    });
    guestTags.set(name, tag.id);
  }

  for (const seed of guestSeeds) {
    const existing = await prisma.guest.findFirst({ where: { email: seed.email } });
    const data = {
      name: seed.name,
      phone: seed.phone,
      email: seed.email,
      totalVisits: seed.totalVisits,
      totalSpend: seed.totalSpend,
      loyaltyPoints: seed.loyaltyPoints,
      memberSince: new Date(`${seed.memberSince}T00:00:00.000Z`),
      dateOfBirth: new Date(`${seed.dateOfBirth}T00:00:00.000Z`),
      notes: seed.notes,
      isActive: true,
      updatedAt: now,
    };
    const guest = existing
      ? await prisma.guest.update({ where: { id: existing.id }, data })
      : await prisma.guest.create({ data });

    await prisma.guesttagmapping.deleteMany({ where: { guestId: guest.id } });
    await prisma.guesttagmapping.createMany({
      data: seed.tags.map((name) => ({ guestId: guest.id, tagId: guestTags.get(name)! })),
      skipDuplicates: true,
    });
    const existingNote = await prisma.guestnote.findFirst({ where: { guestId: guest.id, content: seed.notes } });
    if (!existingNote) {
      await prisma.guestnote.create({ data: { guestId: guest.id, content: seed.notes, author: "MaiAI Seed", isPinned: true, updatedAt: now } });
    }
  }

  console.log(`Seeded ${staffSeeds.length} staff, ${specialtyNames.length} specialties, ${guestSeeds.length} guests, and ${guestTagNames.length} guest tags.`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });