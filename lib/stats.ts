import "server-only";

import { db } from "@/lib/db";

export { RANGES, rangeDays, type RangeKey } from "@/lib/ranges";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

/** Série diária de acessos e cliques, com os dias vazios preenchidos com 0. */
export async function timeSeries({
  days,
  boardId,
}: {
  days: number;
  boardId?: string;
}) {
  const since = startOfDay(new Date());
  since.setDate(since.getDate() - (days - 1));

  const where = { createdAt: { gte: since }, ...(boardId ? { boardId } : {}) };

  const [visits, clicks] = await Promise.all([
    db.visit.findMany({ where, select: { createdAt: true } }),
    db.click.findMany({ where, select: { createdAt: true } }),
  ]);

  const buckets = new Map<string, { visits: number; clicks: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    buckets.set(dayKey(d), { visits: 0, clicks: 0 });
  }

  for (const v of visits) {
    const bucket = buckets.get(dayKey(v.createdAt));
    if (bucket) bucket.visits += 1;
  }
  for (const c of clicks) {
    const bucket = buckets.get(dayKey(c.createdAt));
    if (bucket) bucket.clicks += 1;
  }

  // Em janelas longas, agrupa por semana para o gráfico não virar serrilha.
  const entries = [...buckets.entries()].map(([date, value]) => ({
    date,
    ...value,
  }));

  if (days > 120) {
    const weekly: { date: string; visits: number; clicks: number }[] = [];
    for (let i = 0; i < entries.length; i += 7) {
      const chunk = entries.slice(i, i + 7);
      weekly.push({
        date: chunk[0].date,
        visits: chunk.reduce((s, e) => s + e.visits, 0),
        clicks: chunk.reduce((s, e) => s + e.clicks, 0),
      });
    }
    return weekly;
  }

  return entries;
}

/** Números do topo do dashboard. */
export async function dashboardSummary() {
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);
  const since60 = new Date();
  since60.setDate(since60.getDate() - 60);

  const [
    totalBoards,
    activeBoards,
    inactiveBoards,
    productionBoards,
    totalClients,
    totalVisits,
    totalClicks,
    visits30,
    visitsPrev30,
    clients30,
    boards30,
  ] = await Promise.all([
    db.board.count(),
    db.board.count({ where: { status: "ativa" } }),
    db.board.count({ where: { status: "inativa" } }),
    db.board.count({ where: { status: "producao" } }),
    db.client.count(),
    db.visit.count(),
    db.click.count(),
    db.visit.count({ where: { createdAt: { gte: since30 } } }),
    db.visit.count({ where: { createdAt: { gte: since60, lt: since30 } } }),
    db.client.count({ where: { createdAt: { gte: since30 } } }),
    db.board.count({ where: { createdAt: { gte: since30 } } }),
  ]);

  const trend =
    visitsPrev30 === 0
      ? visits30 > 0
        ? 100
        : 0
      : Math.round(((visits30 - visitsPrev30) / visitsPrev30) * 100);

  return {
    totalBoards,
    activeBoards,
    inactiveBoards,
    productionBoards,
    totalClients,
    totalVisits,
    totalClicks,
    visits30,
    visitsTrend: trend,
    newClients30: clients30,
    newBoards30: boards30,
    ctr: totalVisits === 0 ? 0 : Math.round((totalClicks / totalVisits) * 100),
  };
}

/** Ranking de placas por acessos no período. */
export async function topBoards(days: number, limit = 8) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const grouped = await db.visit.groupBy({
    by: ["boardId"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
    orderBy: { _count: { boardId: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const boards = await db.board.findMany({
    where: { id: { in: grouped.map((g) => g.boardId) } },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      client: { select: { name: true } },
      customization: { select: { displayName: true, avatarUrl: true } },
    },
  });

  const byId = new Map(boards.map((b) => [b.id, b]));

  return grouped
    .map((g) => {
      const board = byId.get(g.boardId);
      if (!board) return null;
      return { ...board, visits: g._count._all };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);
}

/** Ranking de links por cliques no período. */
export async function topLinks(days: number, boardId?: string, limit = 10) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const grouped = await db.click.groupBy({
    by: ["linkLabel", "linkType"],
    where: { createdAt: { gte: since }, ...(boardId ? { boardId } : {}) },
    _count: { _all: true },
    orderBy: { _count: { linkLabel: "desc" } },
    take: limit,
  });

  return grouped.map((g) => ({
    label: g.linkLabel,
    type: g.linkType,
    clicks: g._count._all,
  }));
}

/** Divisão por tipo de dispositivo. */
export async function deviceBreakdown(days: number, boardId?: string) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const grouped = await db.visit.groupBy({
    by: ["device"],
    where: { createdAt: { gte: since }, ...(boardId ? { boardId } : {}) },
    _count: { _all: true },
  });

  const labels: Record<string, string> = {
    mobile: "Celular",
    tablet: "Tablet",
    desktop: "Computador",
  };

  return grouped.map((g) => ({
    device: labels[g.device ?? ""] ?? "Outro",
    count: g._count._all,
  }));
}

/** Divisão por origem do acesso (NFC, QR Code ou link direto). */
export async function sourceBreakdown(days: number, boardId?: string) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const grouped = await db.visit.groupBy({
    by: ["source"],
    where: { createdAt: { gte: since }, ...(boardId ? { boardId } : {}) },
    _count: { _all: true },
  });

  const labels: Record<string, string> = {
    nfc: "Aproximação NFC",
    qr: "QR Code",
    direct: "Link direto",
  };

  return grouped.map((g) => ({
    source: labels[g.source] ?? g.source,
    count: g._count._all,
  }));
}

export async function boardStats(boardId: string, days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [visits, clicks, visitsPeriod, clicksPeriod, series, links, devices, sources] =
    await Promise.all([
      db.visit.count({ where: { boardId } }),
      db.click.count({ where: { boardId } }),
      db.visit.count({ where: { boardId, createdAt: { gte: since } } }),
      db.click.count({ where: { boardId, createdAt: { gte: since } } }),
      timeSeries({ days, boardId }),
      topLinks(days, boardId),
      deviceBreakdown(days, boardId),
      sourceBreakdown(days, boardId),
    ]);

  return {
    visits,
    clicks,
    visitsPeriod,
    clicksPeriod,
    series,
    links,
    devices,
    sources,
    ctr: visits === 0 ? 0 : Math.round((clicks / visits) * 100),
  };
}
