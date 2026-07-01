import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

const COLORS = {
  bajo: "#16a34a",
  medio: "#eab308",
  alto: "#dc2626",
};

export function RiskChart({ data }) {
  const chartData = [
    { name: "Riesgo Bajo", value: data.bajo, fill: COLORS.bajo },
    { name: "Riesgo Medio", value: data.medio, fill: COLORS.medio },
    { name: "Riesgo Alto", value: data.alto, fill: COLORS.alto },
  ].filter(item => item.value > 0);

  return (
    <Card className="h-full glass-card">
      <CardHeader>
        <CardTitle>Distribución de Riesgo</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 500 }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
