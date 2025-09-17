import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export interface GradeBarData {
  grade: string;
  count: number;
}

interface GradeBarChartProps {
  data: GradeBarData[];
}

const GradeBarChart: React.FC<GradeBarChartProps> = ({ data }) => {
  return (
    <div style={{ width: "100%", height: Math.max(240, data.length * 36) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 16, right: 24, left: 24, bottom: 16 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} label={{ value: "Ascents", position: "insideBottom", offset: -5 }} />
          <YAxis
            type="category"
            dataKey="grade"
            width={80}
            label={{ value: "Grade", angle: -90, position: "insideLeft", offset: 10, style: { textAnchor: 'middle' } }}
            tick={{ dx: 0 }}
          />
          <Tooltip />
          <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GradeBarChart;
