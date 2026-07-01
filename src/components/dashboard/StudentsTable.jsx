import { useNavigate } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { RiskIndicator } from "../ui/RiskIndicator";
import { ChevronRight } from "lucide-react";

export function StudentsTable({ students }) {
  const navigate = useNavigate();

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <CardTitle>Estudiantes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Estudiante</th>
                <th className="px-6 py-4 font-medium">Asistencia</th>
                <th className="px-6 py-4 font-medium">Promedio</th>
                <th className="px-6 py-4 font-medium">Participación</th>
                <th className="px-6 py-4 font-medium">Riesgo</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <Avatar 
                        src={student.foto} 
                        fallback={student.nombre.substring(0, 2).toUpperCase()} 
                      />
                      <div>
                        <div className="font-medium text-slate-900">{student.nombre}</div>
                        <div className="text-xs text-slate-500">
                          {student.grado} {student.curso}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[60px]">
                        <div 
                          className={`h-1.5 rounded-full ${student.asistencia < 75 ? 'bg-danger' : 'bg-primary'}`} 
                          style={{ width: `${student.asistencia}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{student.asistencia}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={student.promedio >= 14 ? 'success' : student.promedio >= 11 ? 'warning' : 'danger'}>
                      {student.promedio}/20
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {student.participacion}/10
                  </td>
                  <td className="px-6 py-4">
                    <RiskIndicator risk={student.riesgo} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:text-blue-700"
                      onClick={() => navigate(`/student/${student.id}`)}
                    >
                      Ver perfil <ChevronRight className="ml-1 w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No se encontraron estudiantes en este grado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
