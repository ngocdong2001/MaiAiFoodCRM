import { Router, Request, Response } from "express";
import { getPrismaTenant } from "../lib/prisma-tenant";

const router = Router();

// ─── Voice Agent API key guard (same as tenant-admin) ───────────────────────
function requireAdminKey(req: Request, res: Response, next: Function) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    res.status(503).json({ ok: false, error: "Admin access not configured" });
    return;
  }
  if (req.headers["x-admin-key"] !== adminKey) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }
  next();
}

// ─── Helper: resolve tenant DB URL from tenant ID ───────────────────────────
function getTenantDbUrl(tenantId: number): string {
  const base = process.env.DATABASE_URL_TENANT || process.env.DATABASE_URL || "";
  // Replace the database name in the URL with the tenant-specific database
  // e.g. mysql://user:pass@host:3308/maiai_crm_1 → maiai_crm_{tenantId}
  return base.replace(/\/[^\/]+$/, `/maiai_crm_${tenantId}`);
}

// ─── POST /api/call-analysis ────────────────────────────────────────────────
// Save a completed call analysis record (called by voice agent or CallCenterAdmin)

router.post("/", requireAdminKey, async (req: Request, res: Response) => {
  try {
    const tenantId = Number(req.body?.tenantId);
    if (!tenantId || Number.isNaN(tenantId)) {
      res.status(400).json({ ok: false, error: "Missing or invalid tenantId" });
      return;
    }

    const dbUrl = getTenantDbUrl(tenantId);
    const prisma = getPrismaTenant(tenantId, dbUrl);

    const data = req.body;
    const record = await prisma.callanalysis.create({
      data: {
        callId: data.callId || null,
        roomName: data.roomName || null,
        callerNumber: data.callerNumber || null,
        calledNumber: data.calledNumber || null,
        direction: data.direction || "inbound",
        status: data.status || "completed",
        startedAt: data.startedAt ? new Date(data.startedAt) : null,
        endedAt: data.endedAt ? new Date(data.endedAt) : null,
        duration: data.duration || 0,

        sttModel: data.sttModel || null,
        llmModel: data.llmModel || null,
        ttsModel: data.ttsModel || null,
        cacheEnabled: data.cacheEnabled || false,
        eotThreshold: data.eotThreshold || null,
        tenantSlug: data.tenantSlug || null,

        turnCount: data.turnCount || 0,
        avgLatencyMs: data.avgLatencyMs || null,
        minLatencyMs: data.minLatencyMs || null,
        maxLatencyMs: data.maxLatencyMs || null,
        firstAudioMs: data.firstAudioMs || null,

        cacheHits: data.cacheHits || 0,
        cacheMisses: data.cacheMisses || 0,
        cacheBypasses: data.cacheBypasses || 0,

        audioSentBytes: data.audioSentBytes || 0,
        audioRecvBytes: data.audioRecvBytes || 0,
        functionCalls: data.functionCalls || 0,

        turnsData: data.turnsData || undefined,
      },
    });

    res.json({ ok: true, analysis: record });
  } catch (err) {
    console.error("[CallAnalysis] Error saving:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── GET /api/call-analysis/:tenantId ───────────────────────────────────────
// List call analyses for a tenant (paginated)

router.get("/:tenantId", requireAdminKey, async (req: Request, res: Response) => {
  try {
    const tenantId = Number(req.params.tenantId);
    if (!tenantId || Number.isNaN(tenantId)) {
      res.status(400).json({ ok: false, error: "Invalid tenant ID" });
      return;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const status = req.query.status as string | undefined;

    const dbUrl = getTenantDbUrl(tenantId);
    const prisma = getPrismaTenant(tenantId, dbUrl);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [total, analyses] = await Promise.all([
      prisma.callanalysis.count({ where }),
      prisma.callanalysis.findMany({
        where,
        orderBy: { startedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    res.json({
      ok: true,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      analyses,
    });
  } catch (err) {
    console.error("[CallAnalysis] Error listing:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── GET /api/call-analysis/:tenantId/stats ─────────────────────────────────
// Get summary stats for a tenant's call analyses

router.get("/:tenantId/stats", requireAdminKey, async (req: Request, res: Response) => {
  try {
    const tenantId = Number(req.params.tenantId);
    if (!tenantId || Number.isNaN(tenantId)) {
      res.status(400).json({ ok: false, error: "Invalid tenant ID" });
      return;
    }

    const dbUrl = getTenantDbUrl(tenantId);
    const prisma = getPrismaTenant(tenantId, dbUrl);

    const [total, completed, failed, missed] = await Promise.all([
      prisma.callanalysis.count(),
      prisma.callanalysis.count({ where: { status: "completed" } }),
      prisma.callanalysis.count({ where: { status: "failed" } }),
      prisma.callanalysis.count({ where: { status: "missed" } }),
    ]);

    // Avg latency across all completed calls
    const avgResult = await prisma.callanalysis.aggregate({
      where: { status: "completed" },
      _avg: { avgLatencyMs: true, duration: true },
    });

    // Cache stats
    const cacheStats = await prisma.callanalysis.aggregate({
      where: { cacheEnabled: true },
      _sum: { cacheHits: true, cacheMisses: true, cacheBypasses: true },
    });

    res.json({
      ok: true,
      total,
      completed,
      failed,
      missed,
      avgLatencyMs: avgResult._avg.avgLatencyMs || 0,
      avgDuration: avgResult._avg.duration || 0,
      cacheHits: cacheStats._sum.cacheHits || 0,
      cacheMisses: cacheStats._sum.cacheMisses || 0,
      cacheBypasses: cacheStats._sum.cacheBypasses || 0,
    });
  } catch (err) {
    console.error("[CallAnalysis] Error getting stats:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── GET /api/call-analysis/:tenantId/:analysisId ───────────────────────────
// Get a single call analysis with full turns data

router.get("/:tenantId/:analysisId", requireAdminKey, async (req: Request, res: Response) => {
  try {
    const tenantId = Number(req.params.tenantId);
    const analysisId = Number(req.params.analysisId);
    if (Number.isNaN(tenantId) || Number.isNaN(analysisId)) {
      res.status(400).json({ ok: false, error: "Invalid IDs" });
      return;
    }

    const dbUrl = getTenantDbUrl(tenantId);
    const prisma = getPrismaTenant(tenantId, dbUrl);

    const analysis = await prisma.callanalysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      res.status(404).json({ ok: false, error: "Analysis not found" });
      return;
    }

    res.json({ ok: true, analysis });
  } catch (err) {
    console.error("[CallAnalysis] Error getting detail:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
