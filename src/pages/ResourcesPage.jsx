import { useState } from "react";
import { BookOpen, Clock, FileText, Video, Headphones, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { motion } from "framer-motion";

const mockResources = [
  {
    id: 1,
    title: "Técnicas de Comprensión Lectora",
    area: "Comunicación",
    type: "document",
    level: "Básico",
    time: "45 min",
    icon: FileText,
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: 2,
    title: "Fracciones y Proporciones",
    area: "Matemática",
    type: "video",
    level: "Intermedio",
    time: "25 min",
    icon: Video,
    color: "bg-red-100 text-red-600"
  },
  {
    id: 3,
    title: "Lógica y Razonamiento",
    area: "Razonamiento",
    type: "interactive",
    level: "Avanzado",
    time: "60 min",
    icon: BookOpen,
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    id: 4,
    title: "Audiolibro: Historia Universal",
    area: "Historia",
    type: "audio",
    level: "Todos",
    time: "120 min",
    icon: Headphones,
    color: "bg-purple-100 text-purple-600"
  },
  {
    id: 5,
    title: "Taller de Expresión Oral",
    area: "Comunicación",
    type: "video",
    level: "Básico",
    time: "35 min",
    icon: Video,
    color: "bg-red-100 text-red-600"
  },
  {
    id: 6,
    title: "Ejercicios de Álgebra",
    area: "Matemática",
    type: "document",
    level: "Intermedio",
    time: "40 min",
    icon: FileText,
    color: "bg-blue-100 text-blue-600"
  }
];

export function ResourcesPage() {
  const [filter, setFilter] = useState("Todos");
  const areas = ["Todos", "Comunicación", "Matemática", "Razonamiento", "Historia"];

  const filteredResources = filter === "Todos" 
    ? mockResources 
    : mockResources.filter(r => r.area === filter);

  const getLevelBadge = (level) => {
    switch(level) {
      case "Básico": return <Badge variant="success">Básico</Badge>;
      case "Intermedio": return <Badge variant="warning">Intermedio</Badge>;
      case "Avanzado": return <Badge variant="danger">Avanzado</Badge>;
      default: return <Badge variant="default">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-primary" />
            Recursos de Apoyo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Biblioteca de materiales para asignar a estudiantes.
          </p>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm overflow-x-auto max-w-full">
          {areas.map(area => (
            <button
              key={area}
              onClick={() => setFilter(area)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === area
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card h-full flex flex-col hover:border-blue-200 hover:shadow-md transition-all group">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl ${resource.color}`}>
                    <resource.icon className="w-6 h-6" />
                  </div>
                  {getLevelBadge(resource.level)}
                </div>
                <CardTitle className="mt-4 text-lg group-hover:text-primary transition-colors">
                  {resource.title}
                </CardTitle>
                <div className="text-sm font-medium text-slate-500">
                  {resource.area}
                </div>
              </CardHeader>
              <CardContent className="mt-auto pt-0 flex items-center justify-between">
                <div className="flex items-center text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {resource.time}
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                    Ver
                  </Button>
                  <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                    <Plus className="w-4 h-4 mr-1" />
                    Asignar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
