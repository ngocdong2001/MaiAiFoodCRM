import "dotenv/config";

import { prisma } from "../src/lib/prisma";

const avatars = [
  "https://cdn.visily.ai/text2design/images/01837de52a9f0882c2fd1a7e437aec953140b7cf33c98f0c921e6728037101b5.webp",
  "https://cdn.visily.ai/text2design/images/1ad9ee6c66620f82a971daf6fdded160b9767b6787b2b3b1104edd9bf4b80df9.webp",
  "https://cdn.visily.ai/text2design/images/ca49b135f19875dad7236f2462e52332c089cf666ad920057a49a5b8e8a5de58.webp",
  "https://cdn.visily.ai/text2design/images/c2c8c1ecc4dec5cde231431d19bfb33910b91e5087086f724bbf9b0a794e4758.webp",
];

const staffSeeds = [
  {
    name: "Sarah Jenkins",
    role: "Senior Stylist",
    status: "active",
    email: "sarah.jenkins@maiai.local",
    phone: "0901000001",
    hourlyRate: 28,
    commissionRate: 12,
    avatarUrl: avatars[0],
    specialties: ["Nail Art", "Gel Extensions"],
    startTime: "09:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
    station: "Station 1",
  },
  {
    name: "Marcus Chen",
    role: "Colorist",
    status: "busy",
    email: "marcus.chen@maiai.local",
    phone: "0901000002",
    hourlyRate: 26,
    commissionRate: 10,
    avatarUrl: avatars[1],
    specialties: ["Gel Polish", "Pedicure"],
    startTime: "10:00",
    endTime: "18:00",
    breakStart: "12:30",
    breakEnd: "13:30",
    station: "Color Bar A",
  },
  {
    name: "Elena Rodriguez",
    role: "Junior Stylist",
    status: "active",
    email: "elena.rodriguez@maiai.local",
    phone: "0901000003",
    hourlyRate: 20,
    commissionRate: 8,
    avatarUrl: avatars[2],
    specialties: ["Manicure", "Gel Polish"],
    startTime: "09:00",
    endTime: "14:00",
    breakStart: "12:00",
    breakEnd: "12:45",
    station: "Station 4",
  },
  {
    name: "David Kim",
    role: "Senior Stylist",
    status: "on_leave",
    email: "david.kim@maiai.local",
    phone: "0901000004",
    hourlyRate: 30,
    commissionRate: 15,
    avatarUrl: avatars[3],
    specialties: ["Nail Art", "Acrylic Extensions"],
    startTime: "09:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
    station: "Station 2",
  },
];

const guestSeeds = [
  {
    name: "Eleanor Vance",
    email: "eleanor.v@example.com",
    phone: "+15551234567",
    totalVisits: 18,
    totalSpend: 4250,
    loyaltyPoints: 1460,
    memberSince: "2022-03-12",
    dateOfBirth: "1986-10-12",
    notes: "Prefers a gentle touch and sparkling water with lemon.",
    tags: ["VIP", "Sensitive Scalp"],
  },
  {
    name: "Emma Chen",
    email: "emma.chen@email.com",
    phone: "+14155550148",
    totalVisits: 17,
    totalSpend: 2410,
    loyaltyPoints: 730,
    memberSince: "2023-11-06",
    dateOfBirth: "1991-06-06",
    notes:
      "Prefers organic products and responds well to bundle offers by SMS.",
    tags: ["Loyal", "Quiet Chair"],
  },
  {
    name: "Sarah Kim",
    email: "sarah.kim@email.com",
    phone: "+16505550109",
    totalVisits: 6,
    totalSpend: 920,
    loyaltyPoints: 190,
    memberSince: "2024-01-21",
    dateOfBirth: "1994-05-21",
    notes: "Suitable for a win-back offer and birthday campaign.",
    tags: ["At Risk", "Morning Appointments"],
  },
  {
    name: "Mia Johnson",
    email: "mia.johnson@email.com",
    phone: "+15105550171",
    totalVisits: 31,
    totalSpend: 5220,
    loyaltyPoints: 1580,
    memberSince: "2021-08-02",
    dateOfBirth: "1989-02-02",
    notes: "Often buys retail products after service.",
    tags: ["VIP", "Retail Buyer"],
  },
];

const main = async () => {
  const now = new Date();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const specialtyNames = [
    "Manicure",
    "Pedicure",
    "Gel Polish",
    "Nail Art",
    "Gel Extensions",
    "Acrylic Extensions",
  ];
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
    const existing = await prisma.staff.findFirst({
      where: { email: seed.email },
    });
    const staff = existing
      ? await prisma.staff.update({
          where: { id: existing.id },
          data: {
            name: seed.name,
            role: seed.role,
            status: seed.status,
            phone: seed.phone,
            avatarUrl: seed.avatarUrl,
            hourlyRate: seed.hourlyRate,
            commissionRate: seed.commissionRate,
            updatedAt: now,
          },
        })
      : await prisma.staff.create({
          data: {
            name: seed.name,
            role: seed.role,
            status: seed.status,
            email: seed.email,
            phone: seed.phone,
            avatarUrl: seed.avatarUrl,
            hourlyRate: seed.hourlyRate,
            commissionRate: seed.commissionRate,
            joinDate: today,
            updatedAt: now,
          },
        });

    await prisma.staffspecialtymapping.deleteMany({
      where: { staffId: staff.id },
    });
    await prisma.staffspecialtymapping.createMany({
      data: seed.specialties.map((name) => ({
        staffId: staff.id,
        specialtyId: specialties.get(name)!,
      })),
      skipDuplicates: true,
    });

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() + dayOffset);
      const isDayOff = seed.status === "on_leave" || date.getUTCDay() === 0;
      await prisma.staffschedule.upsert({
        where: { staffId_date: { staffId: staff.id, date } },
        create: {
          staffId: staff.id,
          date,
          startTime: seed.startTime,
          endTime: seed.endTime,
          breakStart: isDayOff ? null : seed.breakStart,
          breakEnd: isDayOff ? null : seed.breakEnd,
          isDayOff,
          note: seed.station,
          updatedAt: now,
        },
        update: {
          startTime: seed.startTime,
          endTime: seed.endTime,
          breakStart: isDayOff ? null : seed.breakStart,
          breakEnd: isDayOff ? null : seed.breakEnd,
          isDayOff,
          note: seed.station,
          updatedAt: now,
        },
      });
    }
  }

  const guestTagNames = [...new Set(guestSeeds.flatMap((guest) => guest.tags))];
  const guestTags = new Map<string, number>();
  for (const [index, name] of guestTagNames.entries()) {
    const tag = await prisma.guesttag.upsert({
      where: { name },
      create: {
        name,
        color: "#F04CAC",
        isActive: true,
        sortOrder: index,
        updatedAt: now,
      },
      update: { isActive: true, sortOrder: index, updatedAt: now },
    });
    guestTags.set(name, tag.id);
  }

  for (const seed of guestSeeds) {
    const existing = await prisma.guest.findFirst({
      where: { email: seed.email },
    });
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
      data: seed.tags.map((name) => ({
        guestId: guest.id,
        tagId: guestTags.get(name)!,
      })),
      skipDuplicates: true,
    });
    const existingNote = await prisma.guestnote.findFirst({
      where: { guestId: guest.id, content: seed.notes },
    });
    if (!existingNote) {
      await prisma.guestnote.create({
        data: {
          guestId: guest.id,
          content: seed.notes,
          author: "MaiAI Seed",
          isPinned: true,
          updatedAt: now,
        },
      });
    }
  }

  // ── Service Categories ────────────────────────────────────────────────────
  const categorySeeds = [
    {
      name: "Nail Care",
      description: "Basic nail care services",
      icon: "✨",
      sortOrder: 0,
    },
    {
      name: "Nail Art",
      description: "Creative nail art designs",
      icon: "🎨",
      sortOrder: 1,
    },
    {
      name: "Extensions",
      description: "Nail extension services",
      icon: "💅",
      sortOrder: 2,
    },
    {
      name: "Pedicure",
      description: "Foot and nail care",
      icon: "🦶",
      sortOrder: 3,
    },
  ];
  const categories = new Map<string, number>();
  for (const cat of categorySeeds) {
    const c = await prisma.servicecategory.upsert({
      where: { name: cat.name },
      create: { ...cat, isActive: true, updatedAt: now },
      update: { isActive: true, updatedAt: now },
    });
    categories.set(cat.name, c.id);
  }

  // ── Services ──────────────────────────────────────────────────────────────
  const serviceSeeds = [
    {
      name: "Classic Manicure",
      description: "Shape, file, cuticle care, and polish",
      price: 35,
      durationMinutes: 45,
      category: "Nail Care",
      sortOrder: 0,
    },
    {
      name: "Gel Manicure",
      description: "Long-lasting gel polish application",
      price: 55,
      durationMinutes: 60,
      category: "Nail Care",
      sortOrder: 1,
    },
    {
      name: "French Manicure",
      description: "Classic French tip manicure",
      price: 45,
      durationMinutes: 50,
      category: "Nail Care",
      sortOrder: 2,
    },
    {
      name: "Nail Art Design",
      description: "Custom nail art per nail",
      price: 80,
      durationMinutes: 90,
      category: "Nail Art",
      sortOrder: 0,
    },
    {
      name: "Ombre Nails",
      description: "Gradient color ombre effect",
      price: 70,
      durationMinutes: 75,
      category: "Nail Art",
      sortOrder: 1,
    },
    {
      name: "Gel Extensions",
      description: "Full set gel nail extensions",
      price: 120,
      durationMinutes: 120,
      category: "Extensions",
      sortOrder: 0,
    },
    {
      name: "Acrylic Full Set",
      description: "Full acrylic nail set",
      price: 110,
      durationMinutes: 110,
      category: "Extensions",
      sortOrder: 1,
    },
    {
      name: "Classic Pedicure",
      description: "Foot soak, scrub, massage, and polish",
      price: 45,
      durationMinutes: 60,
      category: "Pedicure",
      sortOrder: 0,
    },
    {
      name: "Gel Pedicure",
      description: "Pedicure with gel polish finish",
      price: 65,
      durationMinutes: 75,
      category: "Pedicure",
      sortOrder: 1,
    },
  ];
  const services = new Map<string, number>();
  for (const svc of serviceSeeds) {
    const existing = await prisma.service.findFirst({
      where: { name: svc.name, categoryId: categories.get(svc.category)! },
    });
    const s = existing
      ? await prisma.service.update({
          where: { id: existing.id },
          data: {
            price: svc.price,
            durationMinutes: svc.durationMinutes,
            isActive: true,
            updatedAt: now,
          },
        })
      : await prisma.service.create({
          data: {
            name: svc.name,
            description: svc.description,
            price: svc.price,
            durationMinutes: svc.durationMinutes,
            categoryId: categories.get(svc.category)!,
            isActive: true,
            sortOrder: svc.sortOrder,
            updatedAt: now,
          },
        });
    services.set(svc.name, s.id);
  }

  // ── Collect staff and guest IDs for appointments ──────────────────────────
  const staffRecords = await prisma.staff.findMany({
    select: { id: true, name: true },
  });
  const guestRecords = await prisma.guest.findMany({
    select: { id: true, name: true },
  });
  if (staffRecords.length === 0 || guestRecords.length === 0) {
    console.log("No staff or guests found, skipping appointment seed.");
    return;
  }

  const staffByName = Object.fromEntries(
    staffRecords.map((s) => [s.name, s.id]),
  );
  const guestByName = Object.fromEntries(
    guestRecords.map((g) => [g.name, g.id]),
  );

  // ── Appointments ──────────────────────────────────────────────────────────
  // Deterministic key: appointmentKey = guestName + staffName + offsetDays
  type AppointmentSeed = {
    key: string;
    guestName: string;
    staffName: string;
    serviceName: string;
    offsetDays: number;
    startHour: number;
    status: string;
    paymentMethod?: string;
  };
  const appointmentSeeds: AppointmentSeed[] = [
    // Past – completed with payment
    {
      key: "appt-past-1",
      guestName: "Eleanor Vance",
      staffName: "Sarah Jenkins",
      serviceName: "Gel Manicure",
      offsetDays: -14,
      startHour: 10,
      status: "completed",
      paymentMethod: "credit_card",
    },
    {
      key: "appt-past-2",
      guestName: "Emma Chen",
      staffName: "Marcus Chen",
      serviceName: "Classic Pedicure",
      offsetDays: -10,
      startHour: 11,
      status: "completed",
      paymentMethod: "cash",
    },
    {
      key: "appt-past-3",
      guestName: "Mia Johnson",
      staffName: "Sarah Jenkins",
      serviceName: "Nail Art Design",
      offsetDays: -7,
      startHour: 14,
      status: "completed",
      paymentMethod: "credit_card",
    },
    {
      key: "appt-past-4",
      guestName: "Sarah Kim",
      staffName: "Elena Rodriguez",
      serviceName: "Classic Manicure",
      offsetDays: -5,
      startHour: 9,
      status: "completed",
      paymentMethod: "cash",
    },
    {
      key: "appt-past-5",
      guestName: "Eleanor Vance",
      staffName: "Marcus Chen",
      serviceName: "Gel Pedicure",
      offsetDays: -3,
      startHour: 13,
      status: "completed",
      paymentMethod: "credit_card",
    },
    {
      key: "appt-past-6",
      guestName: "Emma Chen",
      staffName: "Elena Rodriguez",
      serviceName: "French Manicure",
      offsetDays: -2,
      startHour: 10,
      status: "cancelled",
    },
    {
      key: "appt-past-7",
      guestName: "Mia Johnson",
      staffName: "Sarah Jenkins",
      serviceName: "Ombre Nails",
      offsetDays: -1,
      startHour: 15,
      status: "completed",
      paymentMethod: "bank_transfer",
    },
    // Today
    {
      key: "appt-today-1",
      guestName: "Eleanor Vance",
      staffName: "Sarah Jenkins",
      serviceName: "Gel Extensions",
      offsetDays: 0,
      startHour: 9,
      status: "confirmed",
    },
    {
      key: "appt-today-2",
      guestName: "Emma Chen",
      staffName: "Marcus Chen",
      serviceName: "Gel Manicure",
      offsetDays: 0,
      startHour: 10,
      status: "in_progress",
    },
    {
      key: "appt-today-3",
      guestName: "Mia Johnson",
      staffName: "Elena Rodriguez",
      serviceName: "Classic Pedicure",
      offsetDays: 0,
      startHour: 11,
      status: "pending",
    },
    {
      key: "appt-today-4",
      guestName: "Sarah Kim",
      staffName: "Sarah Jenkins",
      serviceName: "Classic Manicure",
      offsetDays: 0,
      startHour: 14,
      status: "pending",
    },
    // Future
    {
      key: "appt-future-1",
      guestName: "Eleanor Vance",
      staffName: "Marcus Chen",
      serviceName: "Nail Art Design",
      offsetDays: 2,
      startHour: 10,
      status: "confirmed",
    },
    {
      key: "appt-future-2",
      guestName: "Emma Chen",
      staffName: "Sarah Jenkins",
      serviceName: "Acrylic Full Set",
      offsetDays: 3,
      startHour: 9,
      status: "confirmed",
    },
    {
      key: "appt-future-3",
      guestName: "Mia Johnson",
      staffName: "Elena Rodriguez",
      serviceName: "Ombre Nails",
      offsetDays: 5,
      startHour: 11,
      status: "pending",
    },
    {
      key: "appt-future-4",
      guestName: "Sarah Kim",
      staffName: "Sarah Jenkins",
      serviceName: "Gel Manicure",
      offsetDays: 7,
      startHour: 13,
      status: "pending",
    },
  ];

  let appointmentCount = 0;
  let paymentCount = 0;
  let receiptCounter = 1;

  for (const seed of appointmentSeeds) {
    const guestId = guestByName[seed.guestName];
    const staffId = staffByName[seed.staffName];
    const serviceId = services.get(seed.serviceName);
    if (!guestId || !staffId || !serviceId) continue;

    const serviceData = serviceSeeds.find((s) => s.name === seed.serviceName)!;
    const startTime = new Date(today);
    startTime.setUTCDate(today.getUTCDate() + seed.offsetDays);
    startTime.setUTCHours(seed.startHour, 0, 0, 0);
    const endTime = new Date(
      startTime.getTime() + serviceData.durationMinutes * 60 * 1000,
    );

    // Use upsert-style: find by key stored in notes, or by exact time slot
    const existing = await prisma.appointment.findFirst({
      where: { guestId, staffId, startTime },
    });

    const appointment = existing
      ? await prisma.appointment.update({
          where: { id: existing.id },
          data: { status: seed.status, updatedAt: now },
        })
      : await prisma.appointment.create({
          data: {
            guestId,
            staffId,
            startTime,
            endTime,
            status: seed.status,
            source: "walk_in",
            notes: seed.key,
            updatedAt: now,
          },
        });
    appointmentCount++;

    // Create appointmentservice link
    await prisma.appointmentservice.upsert({
      where: {
        appointmentId_serviceId: { appointmentId: appointment.id, serviceId },
      },
      create: {
        appointmentId: appointment.id,
        serviceId,
        staffId,
        priceAtBooking: serviceData.price,
        durationAtBooking: serviceData.durationMinutes,
        status: seed.status === "completed" ? "completed" : "pending",
      },
      update: { status: seed.status === "completed" ? "completed" : "pending" },
    });

    // Create payment for completed appointments
    if (seed.status === "completed" && seed.paymentMethod) {
      const existing = await prisma.payment.findUnique({
        where: { appointmentId: appointment.id },
      });
      if (!existing) {
        const tip =
          seed.paymentMethod === "cash"
            ? 0
            : Math.round(serviceData.price * 0.1);
        await prisma.payment.create({
          data: {
            appointmentId: appointment.id,
            guestId,
            staffId,
            amount: serviceData.price,
            discountAmount: 0,
            tipAmount: tip,
            finalAmount: serviceData.price + tip,
            paymentMethod: seed.paymentMethod,
            paymentStatus: "paid",
            paidAt: endTime,
            receiptNumber: `RCP-${String(receiptCounter++).padStart(5, "0")}`,
          },
        });
        paymentCount++;
      }
    }
  }

  console.log(
    `Seeded ${staffSeeds.length} staff, ${specialtyNames.length} specialties, ${guestSeeds.length} guests, ${guestTagNames.length} guest tags, ${categorySeeds.length} service categories, ${serviceSeeds.length} services, ${appointmentCount} appointments, ${paymentCount} payments.`,
  );
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
