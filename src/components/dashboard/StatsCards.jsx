import { Users, ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { motion } from "framer-motion";

export function StatsCards({ stats }) {
  const items = [
    {
      title: "Total Estudiantes",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Riesgo Bajo",
      value: stats.bajo,
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Riesgo Medio",
      value: stats.medio,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      title: "Riesgo Alto",
      value: stats.alto,
      icon: AlertOctagon,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{item.value}</h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
