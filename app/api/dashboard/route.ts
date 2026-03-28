import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId parameter" }, { status: 400 });
    }

    // 1. Total Contacts
    const contactsCount = await prisma.contact.count({
      where: { companyId }
    });

    // 2. Active Opportunities
    const activeOpsCount = await prisma.opportunity.count({
      where: { 
        companyId,
        stage: { in: ['lead', 'qualified', 'proposal'] }
      }
    });

    // 3. Pipeline Value
    const activeOps = await prisma.opportunity.findMany({
      where: { 
        companyId,
        stage: { in: ['lead', 'qualified', 'proposal', 'closed_won'] }
      },
      select: { value: true, stage: true }
    });
    
    const pipelineVal = activeOps.reduce((sum: number, op: any) => sum + op.value, 0);

    // 4. Open Tickets
    const openTicketsCount = await prisma.ticket.count({
      where: { 
        companyId,
        status: { in: ['open', 'in_progress'] }
      }
    });

    // 5. Activity Logs (Recent 5)
    let activities = await prisma.activityLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    // Transform missing fields for UI
    const mappedActivities = activities.map((act: any) => {
      let color = "#1D9E75";
      if (act.type === 'email') color = "#F39C12";
      if (act.type === 'call') color = "#3498DB";
      if (act.type === 'stage_change') color = "#9B59B6";

      return {
        id: act.id,
        type: act.type,
        subject: act.subject,
        desc: act.body || "No details provided",
        time: act.createdAt.toLocaleDateString(),
        color
      };
    });

    // 6. Pipeline stages Breakdown
    const stageCounts = activeOps.reduce((acc: any, op: any) => {
      acc[op.stage] = (acc[op.stage] || 0) + 1;
      return acc;
    }, {});

    const totalDeals = activeOps.length || 1; // avoid div by zero
    const pipelineBreakdown = {
      leadPercent: Math.round(((stageCounts.lead || 0) / totalDeals) * 100),
      qualPercent: Math.round(((stageCounts.qualified || 0) / totalDeals) * 100),
      propPercent: Math.round(((stageCounts.proposal || 0) / totalDeals) * 100),
      wonPercent: Math.round(((stageCounts.closed_won || 0) / totalDeals) * 100),
    };

    return NextResponse.json({
      metrics: {
        contacts: contactsCount,
        activeOps: activeOpsCount,
        pipelineVal,
        openTickets: openTicketsCount
      },
      pipelineBreakdown,
      activities: mappedActivities.length ? mappedActivities : [
        { id: 'none', type: 'note', subject: 'Welcome to NexusCRM', desc: 'No activities yet. Start adding contacts!', time: 'Now', color: '#1D9E75' }
      ]
    });

  } catch (error: any) {
    console.error("[GET /api/dashboard]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
