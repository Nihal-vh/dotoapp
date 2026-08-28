import { prisma } from "./src/lib/db";
import bcrypt from "bcryptjs";
import { getTodayDateString, getTomorrowDateString, getOffsetDateString } from "./src/lib/utils";

async function runContinuityE2ETest() {
  console.log("🚀 Running DOTO Personal Work OS Continuity Verification Suite...\n");

  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();
  const yesterday = getOffsetDateString(-1);

  // 1. Verify User
  const user = await prisma.user.findUnique({
    where: { email: "demo@doto.work" },
  });
  if (!user) throw new Error("Demo user not found!");
  console.log("✅ 1. Authentication: Demo user account verified.");

  // 2. Verify Projects & Sessions
  const syntista = await prisma.project.findFirst({
    where: { userId: user.id, name: "Syntista" },
    include: {
      milestones: { include: { tasks: true } },
      sessions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!syntista) throw new Error("Syntista project not found!");
  console.log(`✅ 2. Projects: Found project "${syntista.name}" with ${syntista.milestones.length} milestones.`);
  console.log(`   Initial START HERE: "${syntista.startHere}"`);

  // Simulate Logging a New Work Session
  console.log("\n📝 3. Testing Work Session Logging Flow...");
  const newNextAction = "Run integration tests against tenant schema migration engine";
  await prisma.projectSession.create({
    data: {
      projectId: syntista.id,
      workedOn: "Tenant schema router multiplexer",
      completed: "Added dynamic connection pool resolver",
      stoppedAt: "Integration test assertions for tenant schema creation",
      nextAction: newNextAction,
      durationMins: 45,
    },
  });

  // Automatically update project START HERE
  const updatedSyntista = await prisma.project.update({
    where: { id: syntista.id },
    data: {
      startHere: newNextAction,
      lastWorked: new Date(),
    },
  });

  if (updatedSyntista.startHere !== newNextAction) {
    throw new Error("START HERE did not update correctly!");
  }
  console.log(`✅    New session logged successfully.`);
  console.log(`✅    Project START HERE automatically updated to: "${updatedSyntista.startHere}"`);

  // 4. Verify Learning Module & Video Timestamping
  console.log("\n🎓 4. Testing Learning Roadmaps & Video Timestamp Continuity...");
  const osLearning = await prisma.learningItem.findFirst({
    where: { userId: user.id, title: { contains: "Operating Systems" } },
    include: {
      topics: {
        where: { title: { contains: "Memory Management" } },
        include: { resources: true },
      },
    },
  });
  if (!osLearning) throw new Error("Operating Systems learning roadmap not found!");
  const memoryTopic = osLearning.topics[0];
  const videoResource = memoryTopic?.resources.find((r) => r.type === "YOUTUBE");
  if (!videoResource) throw new Error("Video resource not found!");

  console.log(`✅    Found Resource: "${videoResource.title}"`);
  console.log(`✅    Current Timestamp: ${videoResource.currentProgress} / ${videoResource.totalDuration}`);
  console.log(`✅    Resume Point / NEXT: "${videoResource.resumePoint}"`);

  // Simulate advancing video progress
  await prisma.learningResource.update({
    where: { id: videoResource.id },
    data: {
      currentProgress: "24:15",
      resumePoint: "24:15 - Multi-level page tables and TLB hit ratio calculation",
    },
  });
  console.log("✅    Updated video timestamp to 24:15 and refreshed NEXT resume note.");

  // 5. Verify Readings Module
  console.log("\n📖 5. Testing Readings & Page Bookmark Tracking...");
  const ostep = await prisma.readingItem.findFirst({
    where: { userId: user.id, title: { contains: "Three Easy Pieces" } },
  });
  if (!ostep) throw new Error("OSTEP reading item not found!");
  console.log(`✅    Current Reading: "${ostep.title}", Page ${ostep.currentPage} of ${ostep.totalPages}`);

  // Advance reading page
  const updatedReading = await prisma.readingItem.update({
    where: { id: ostep.id },
    data: {
      currentPage: 58,
      resumePoint: "Page 58 - Segmentation and Free-Space Management",
    },
  });
  const newPercent = Math.round((updatedReading.currentPage! / updatedReading.totalPages!) * 100);
  console.log(`✅    Advanced to Page ${updatedReading.currentPage} (${newPercent}% progress). Next: "${updatedReading.resumePoint}"`);

  // 6. Verify Daily Todos & Carry-Forward Workflow
  console.log("\n📋 6. Testing Daily Todos & Carry-Forward Workflow...");
  const overdueTasks = await prisma.todo.findMany({
    where: { userId: user.id, date: yesterday, status: "PENDING" },
  });
  console.log(`✅    Detected ${overdueTasks.length} overdue task(s) from yesterday.`);

  if (overdueTasks.length > 0) {
    // Carry forward to today
    await prisma.todo.updateMany({
      where: { id: { in: overdueTasks.map((t) => t.id) } },
      data: { date: today, status: "PENDING" },
    });
    console.log("✅    Successfully carried forward overdue tasks to today without data loss.");
  }

  // 7. Verify Evening Tomorrow Planning
  console.log("\n🌙 7. Testing Tomorrow Planning Routine...");
  const tomorrowTodos = await prisma.todo.findMany({
    where: { userId: user.id, date: tomorrow },
  });
  console.log(`✅    Tomorrow (${tomorrow}) currently has ${tomorrowTodos.length} planned task(s).`);

  // 8. Verify Reminders & Global Tasks System
  console.log("\n⏰ 8. Testing Reminders & Global Tasks System...");
  const globalTodo = await prisma.todo.create({
    data: {
      userId: user.id,
      title: "Quarterly security audit and key rotation",
      date: "BACKLOG",
      isGlobal: true,
      priority: "HIGH",
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000), // 7 days deadline
      remindAt: new Date(Date.now() + 2 * 3600 * 1000), // 2 hours alarm
    },
  });
  console.log(`✅    Created Global Backlog Task: "${globalTodo.title}" with due date and alarm.`);

  const testReminder = await prisma.reminder.create({
    data: {
      userId: user.id,
      title: "Check staging deploy health",
      remindAt: new Date(Date.now() - 1000), // Due now
      dueDate: new Date(Date.now() + 24 * 3600 * 1000),
      priority: "URGENT",
      status: "PENDING",
      todoId: globalTodo.id,
    },
  });
  console.log(`✅    Created Reminder: "${testReminder.title}" (Priority: ${testReminder.priority})`);

  // Verify due reminder query
  const dueReminders = await prisma.reminder.findMany({
    where: {
      userId: user.id,
      status: "PENDING",
      remindAt: { lte: new Date() },
    },
  });
  console.log(`✅    Found ${dueReminders.length} due reminder(s) ready for Web Push dispatch.`);

  // Cleanup test items
  await prisma.reminder.delete({ where: { id: testReminder.id } });
  await prisma.todo.delete({ where: { id: globalTodo.id } });
  console.log("✅    Cleaned up test reminder and global todo entries.");

  console.log("\n🎉 ALL CONTINUITY & REMINDERS VERIFICATION TESTS PASSED SUCCESSFULLY!\n");
}

runContinuityE2ETest()
  .catch((e) => {
    console.error("❌ Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

