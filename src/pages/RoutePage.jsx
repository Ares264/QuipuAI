import { useState } from "react";
import { Route, CheckCircle2, Clock, Calendar as CalendarIcon, PlayCircle } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { motion } from "framer-motion";

const mockRoute = [
  {
    week: 1,
    title: "Semana 1: Diagnóstico y Nivelación",
    activities: [
      { id: 1, title: "Evaluación diagnóstica de lectura", time: "45 min", objective: "Identificar nivel de comprensión actual", status: "completed" },
      { id: 2, title: "Taller de técnicas de estudio I", time: "60 min", objective: "Mejorar la retención de información", status: "completed" }
    ]
  },
  {
    week: 2,
    title: "Semana 2: Refuerzo Específico",
    activities: [
      { id: 3, title: "Ejercicios de matemática básica", time: "90 min", objective: "Reforzar operaciones fundamentales", status: "current" },
      { id: 4, title: "Lectura guiada: El Quijote (Cap. 1)", time: "45 min", objective: "Mejorar velocidad y comprensión", status: "pending" }
    ]
  },
  {
    week: 3,
    title: "Semana 3: Desarrollo de Habilidades",
    activities: [
      { id: 5, title: "Taller de escritura creativa", time: "60 min", objective: "Fomentar la expresión escrita", status: "pending" },
      { id: 6, title: "Resolución de problemas verbales", time: "60 min", objective: "Aplicar lógica a situaciones reales", status: "pending" }
    ]
  },
  {
    week: 4,
    title: "Semana 4: Evaluación y Retroalimentación",
    activities: [
      { id: 7, title: "Prueba de progreso final", time: "90 min", objective: "Medir avance tras las 4 semanas", status: "pending" },
      { id: 8, title: "Sesión de feedback con el estudiante", time: "30 min", objective: "Establecer metas para el próximo mes", status: "pending" }
    ]
  }
];

export function RoutePage() {
  const [activities, setActivities] = useState(mockRoute);
  
  // Calculate progress
  let totalActivities = 0;
  let completedActivities = 0;
  
  activities.forEach(week => {
    week.activities.forEach(act => {
      totalActivities++;
      if (act.status === "completed") completedActivities++;
    });
  });
  
  const progressPercentage = Math.round((completedActivities / totalActivities) * 100);

  const toggleStatus = (weekIndex, activityId) => {
    setActivities(prev => {
      const newActivities = [...prev];
      const activityIndex = newActivities[weekIndex].activities.findIndex(a => a.id === activityId);
      
      if (activityIndex !== -1) {
        const currentStatus = newActivities[weekIndex].activities[activityIndex].status;
        newActivities[weekIndex].activities[activityIndex].status = 
          currentStatus === "completed" ? "pending" : "completed";
      }
      return newActivities;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Route className="w-6 h-6 mr-2 text-primary" />
            Ruta Personalizada
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Plan de intervención de 4 semanas generado por IA.
          </p>
        </div>
        
        <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm min-w-[200px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Progreso General</span>
            <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
          </div>
          <ProgressBar value={progressPercentage} className="h-2" />
        </div>
      </div>

      <div className="relative border-l-2 border-slate-100 ml-3 md:ml-6 space-y-12 pb-8">
        {activities.map((week, weekIndex) => (
          <div key={week.week} className="relative pl-8 md:pl-0">
            {/* Timeline dot */}
            <div className="absolute left-[-9px] md:left-[-9px] top-1 w-4 h-4 rounded-full border-4 border-white bg-blue-500 shadow-sm z-10" />
            
            <div className="md:ml-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-slate-400" />
                {week.title}
              </h3>
              
              <div className="space-y-4">
                {week.activities.map((activity, actIndex) => (
                  <motion.div 
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (weekIndex * 0.1) + (actIndex * 0.1) }}
                  >
                    <Card className={`overflow-hidden transition-all duration-300 ${activity.status === 'completed' ? 'bg-slate-50/50 border-slate-200/60' : activity.status === 'current' ? 'border-blue-200 shadow-md ring-1 ring-blue-100' : 'bg-white'}`}>
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center">
                          <div className={`p-4 sm:p-6 flex-1 ${activity.status === 'completed' ? 'opacity-60' : ''}`}>
                            <div className="flex items-center space-x-2 mb-1">
                              {activity.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-success" />}
                              {activity.status === 'current' && <PlayCircle className="w-4 h-4 text-blue-500" />}
                              <h4 className={`font-semibold text-base ${activity.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                {activity.title}
                              </h4>
                            </div>
                            <p className="text-sm text-slate-500 mb-3 flex items-center">
                              <span className="font-medium mr-1">Objetivo:</span> {activity.objective}
                            </p>
                            <div className="flex items-center text-xs font-medium text-slate-400">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              {activity.time}
                            </div>
                          </div>
                          
                          <div className="w-full sm:w-auto p-4 sm:p-6 bg-slate-50 sm:bg-transparent border-t sm:border-t-0 border-slate-100 flex justify-end">
                            <Button
                              variant={activity.status === "completed" ? "outline" : activity.status === "current" ? "primary" : "ghost"}
                              onClick={() => toggleStatus(weekIndex, activity.id)}
                              className={activity.status === "pending" ? "border border-slate-200 hover:bg-slate-100" : ""}
                            >
                              {activity.status === "completed" ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                                  Completado
                                </>
                              ) : activity.status === "current" ? (
                                "Completar ahora"
                              ) : (
                                "Marcar como hecho"
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
