import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { TrendingUp, TrendingDown } from "lucide-react";

export function EvolutionTimeline({ history }) {
  // history is an array of 6 numbers representing grades for the last 6 months
  const safeHistory = history || [];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const data = safeHistory.map((grade, index) => ({
    name: months[index] || `M${index+1}`,
    grade: grade
  }));

  const firstGrade = safeHistory.length > 0 ? safeHistory[0] : 0;
  const lastGrade = safeHistory.length > 0 ? safeHistory[safeHistory.length - 1] : 0;
  const isImproving = lastGrade >= firstGrade;

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Evolución Académica</CardTitle>
        <div className={`flex items-center text-sm font-medium ${isImproving ? 'text-success' : 'text-danger'}`}>
          {isImproving ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {isImproving ? "Mejorando" : "Empeorando"}
        </div>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line
              type="monotone"
              dataKey="grade"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
