"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const defaultData = [
  { name: "Lun", cours: 2, devoirs: 1 },
  { name: "Mar", cours: 3, devoirs: 2 },
  { name: "Mer", cours: 2, devoirs: 3 },
  { name: "Jeu", cours: 4, devoirs: 2 },
  { name: "Ven", cours: 3, devoirs: 1 },
  { name: "Sam", cours: 1, devoirs: 0 },
  { name: "Dim", cours: 0, devoirs: 0 },
];

interface ActivityChartProps {
  data?: { name: string; cours: number; devoirs?: number }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const hasRealData = !!data && data.length > 0;
  const chartData = hasRealData ? data : defaultData;

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis
            dataKey="name"
            className="text-xs"
            tick={{ fill: "#6b7280" }}
          />
          <YAxis className="text-xs" tick={{ fill: "#6b7280" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="cours"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
            name="Cours"
          />
          {!hasRealData && (
            <Line
              type="monotone"
              dataKey="devoirs"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6, stroke: "#059669", strokeWidth: 2 }}
              name="Devoirs"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
