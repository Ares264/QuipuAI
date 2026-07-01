import { useState } from "react";
import { BrainCircuit, Loader2, Sparkles, AlertTriangle, Info } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { analyzeStudent } from "../services/openai";
import studentsData from "../data/students.json";
import { motion, AnimatePresence } from "framer-motion";

export function AIAnalysisPage() {
  const [selectedStudent, setSelectedStudent] = useState(studentsData[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const student = studentsData.find(s => s.id === selectedStudent);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeStudent(student);
      setAnalysis(result);
    } catch (error) {
      console.error("Error analyzing student:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <BrainCircuit className="w-6 h-6 mr-2 text-primary" />
          Análisis con IA
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Genera diagnósticos automáticos y personalizados utilizando IA Generativa.
        </p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Seleccionar Estudiante
              </label>
              <select 
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(e.target.value);
                  setAnalysis(null);
                }}
              >
                {studentsData.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.grado} {s.curso}) - Promedio: {s.promedio}
                  </option>
                ))}
              </select>
            </div>
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar Análisis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="glass-card md:col-span-2 shadow-sm border-blue-100">
              <CardHeader className="bg-blue-50/50 border-b border-blue-100/50 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-blue-900 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                    Resumen Generado por IA
                  </CardTitle>
                  <Badge variant={analysis.priority === 'Alta' ? 'danger' : analysis.priority === 'Media' ? 'warning' : 'success'}>
                    Prioridad: {analysis.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Diagnóstico</h4>
                  <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {analysis.summary}
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                      Factores Clave
                    </h4>
                    <ul className="space-y-2">
                      {analysis.factors.map((factor, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 mr-2 shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                      <Info className="w-4 h-4 mr-2 text-blue-500" />
                      Explicación
                    </h4>
                    <p className="text-sm text-slate-600">
                      {analysis.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card bg-slate-900 text-white">
              <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                  <BrainCircuit className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">Próximos Pasos</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Basado en este análisis, puedes generar una ruta de aprendizaje personalizada para {student.nombre}.
                </p>
                <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-500">
                  Crear Ruta Personalizada
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
