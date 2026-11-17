"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/utils";

export type SeriesPoint = { date: string; visits: number; clicks: number };

const shortDate = (iso: string) => {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
};

export default function AccessChart({
  data,
  height = 280,
}: {
  data: SeriesPoint[];
  height?: number;
}) {
  const empty = data.every((d) => d.visits === 0 && d.clicks === 0);

  return (
    <div className="relative" style={{ height }}>
      {empty ? (
        <div className="absolute inset-0 z-10 grid place-items-center">
          <div className="rounded-xl bg-white/80 px-4 py-2 text-[13px] font-medium text-[#8a97b1] backdrop-blur-sm">
            Ainda sem acessos neste período
          </div>
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B54B0" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#1B54B0" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B92E5" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#5B92E5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#e6eaf2"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tick={{ fontSize: 11, fill: "#8a97b1" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={44}
            tick={{ fontSize: 11, fill: "#8a97b1" }}
          />
          <Tooltip
            cursor={{ stroke: "#bbd2f6", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 14,
              border: "1px solid #e6eaf2",
              boxShadow: "0 8px 30px rgba(13,31,61,0.12)",
              fontSize: 13,
              padding: "10px 12px",
            }}
            labelFormatter={(value) => shortDate(String(value))}
            formatter={(value, name) => [
              formatNumber(Number(value ?? 0)),
              name === "visits" ? "Acessos" : "Cliques",
            ]}
          />
          <Area
            type="monotone"
            dataKey="visits"
            stroke="#1B54B0"
            strokeWidth={2.4}
            fill="url(#gVisits)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#5B92E5"
            strokeWidth={2}
            strokeDasharray="5 4"
            fill="url(#gClicks)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
