import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ArrowLeft, BookOpen, Calendar, Clock, GraduationCap, TrendingUp, Phone, AlertTriangle, Info, FileSpreadsheet } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Save, UserMinus, FileText, Home, Sparkles, Bot } from "lucide-react";
import { Avatar } from "../components/ui/Avatar";
import { Card, CardContent } from "../components/ui/Card";
import { CircularRiskIndex } from "../components/student/CircularRiskIndex";
import { EvolutionTimeline } from "../components/student/EvolutionTimeline";
import { StrengthsCard, ImprovementCard } from "../components/student/StrengthsCards";
import { ProgressBar } from "../components/ui/ProgressBar";
import { motion } from "framer-motion";

export function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState([]);
  const [motivo, setMotivo] = useState("");
  const [fechaVisita, setFechaVisita] = useState("");
  const [savingIntervention, setSavingIntervention] = useState(false);
  const [recommendation, setRecommendation] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const docRef = doc(db, "students", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStudent({ id: docSnap.id, ...data });
          setMotivo(data.motivoBajoRendimiento || "");
          setFechaVisita(data.fechaVisita || "");
          setRecommendation(data.recomendacionGemini || "");
          
          // Fetch attendance history
          const attQuery = query(collection(db, "attendance"), where("studentId", "==", id));
          const attSnap = await getDocs(attQuery);
          const attData = attSnap.docs.map(d => d.data());
          // Sort by date descending
          attData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          setAttendances(attData);
        } else {
          console.log("No such student!");
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchStudent();
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Cargando perfil del estudiante...</div>;
  }

  if (!student) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-700 mb-4">Estudiante no encontrado</h2>
        <Button onClick={() => navigate("/")}>Volver al Dashboard</Button>
      </div>
    );
  }

  const riskBannerColor = student.riesgo === 'alto'
    ? 'bg-danger/10 border-danger/30 text-danger'
    : student.riesgo === 'medio'
    ? 'bg-warning/10 border-warning/30 text-amber-700'
    : 'bg-success/10 border-success/30 text-green-700';

  const riskMessage = student.riesgo === 'alto'
    ? '⚠️ Riesgo Alto: Se recomienda contactar al apoderado y generar una ruta de apoyo inmediata.'
    : student.riesgo === 'medio'
    ? '⚡ Riesgo Medio: Monitorear semanalmente y revisar participación y asistencia.'
    : '✅ Sin Riesgo: El estudiante mantiene un buen desempeño académico.';

  const handleSaveIntervention = async () => {
    setSavingIntervention(true);
    try {
      await updateDoc(doc(db, "students", id), {
        motivoBajoRendimiento: motivo,
        fechaVisita: fechaVisita
      });
      alert("Información de intervención guardada correctamente.");
    } catch (e) {
      alert("Error al guardar: " + e.message);
    } finally {
      setSavingIntervention(false);
    }
  };

  const generateGeminiRecommendation = async () => {
    if (!motivo) {
      alert("Por favor ingresa primero los 'Supuestos Motivos' en el módulo derecho para que Gemini pueda analizar la situación.");
      return;
    }
    setGeneratingAI(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No se encontró la llave VITE_GEMINI_API_KEY en las variables de entorno.");
      }

      const prompt = `Actúa como un psicopedagogo experto en educación primaria. El alumno presenta bajo rendimiento y posible deserción escolar. El docente ha detectado esta problemática: "${motivo}". Redacta de forma concisa y directa 3 consejos prácticos (en bullet points cortos) para que el docente sepa cómo intervenir en el aula y qué temas tocar con los padres durante la próxima visita domiciliaria. Usa un tono profesional y alentador.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (result.error) throw new Error(result.error.message);
      
      const text = result.candidates[0].content.parts[0].text;
      setRecommendation(text);
      
      await updateDoc(doc(db, "students", id), {
        recomendacionGemini: text
      });
    } catch (e) {
      console.error("Error completo de Gemini:", e);
      alert("Error al obtener recomendación de IA:\n" + e.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          className="pl-0 text-slate-500 hover:text-slate-900"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Dashboard
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="ml-auto flex items-center gap-2 text-primary"
          onClick={() => navigate("/registro")}
        >
          <FileSpreadsheet className="w-4 h-4" /> Ir al Registro
        </Button>
      </div>

      {/* Risk Alert Banner */}
      <div className={`flex items-start gap-3 p-4 rounded-lg border ${riskBannerColor}`}>
        {student.riesgo === 'alto' ? <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" /> : <Info className="w-5 h-5 mt-0.5 shrink-0" />}
        <div className="flex-1 text-sm font-medium">{riskMessage}
          {student.telefonoPadre && student.riesgo !== 'bajo' && (
            <a 
              href={`https://wa.me/51${student.telefonoPadre.replace(/\D/g,'')}`}
              target="_blank"
              rel="noreferrer"
              className="ml-3 inline-flex items-center gap-1 underline font-semibold hover:opacity-80"
            >
              <Phone className="w-3.5 h-3.5" /> Llamar: {student.telefonoPadre}
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Main Profile Info */}
          <Card className="glass-card overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <CardContent className="px-8 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12 mb-6">
                <Avatar 
                  src={student.foto}
                  fallback={student.nombre.substring(0,2).toUpperCase()}
                  className="w-24 h-24 border-4 border-white shadow-md text-2xl"
                />
                <div className="flex-1 pb-2">
                  <h1 className="text-3xl font-bold text-slate-900">{student.nombre}</h1>
                  <p className="text-slate-500 font-medium">
                    {student.grado} — Sección {student.curso}
                  </p>
                  {student.contexto && (
                    <p className="text-xs text-slate-400 mt-1 italic">{student.contexto}</p>
                  )}
                </div>
                <div className="pb-2 flex flex-col gap-2 items-end">
                  {student.telefonoPadre && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5">
                      <Phone className="w-4 h-4 text-success" />
                      <span className="font-medium">{student.telefonoPadre}</span>
                    </div>
                  )}
                  <Button onClick={() => navigate("/ai-analysis")}>
                    Analizar con IA
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4 border-t border-slate-100">
                <div>
                  <div className="text-sm text-slate-500 flex items-center mb-1">
                    <Calendar className="w-4 h-4 mr-1.5" /> Asistencia
                  </div>
                  <div className="font-semibold text-lg">{student.asistencia}%</div>
                  <ProgressBar 
                    value={student.asistencia} 
                    className="mt-2" 
                    indicatorClassName={student.asistencia < 75 ? "bg-danger" : "bg-primary"} 
                  />
                </div>
                <div>
                  <div className="text-sm text-slate-500 flex items-center mb-1">
                    <GraduationCap className="w-4 h-4 mr-1.5" /> Promedio
                  </div>
                  <div className="font-semibold text-lg">{student.promedio}/20</div>
                  <ProgressBar 
                    value={student.promedio * 5} 
                    className="mt-2" 
                    indicatorClassName={student.promedio < 11 ? "bg-danger" : student.promedio < 14 ? "bg-warning" : "bg-success"}
                  />
                </div>
                <div>
                  <div className="text-sm text-slate-500 flex items-center mb-1">
                    <BookOpen className="w-4 h-4 mr-1.5" /> Tareas
                  </div>
                  <div className="font-semibold text-lg">{student.tareas ?? '—'}%</div>
                  <ProgressBar value={student.tareas ?? 0} className="mt-2" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 flex items-center mb-1">
                    <Clock className="w-4 h-4 mr-1.5" /> Participación
                  </div>
                  <div className="font-semibold text-lg">{student.participacion}/10</div>
                  <ProgressBar value={student.participacion * 10} className="mt-2" indicatorClassName="bg-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Asistencia Detallado */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                Historial Completo de Asistencia
              </h3>
              {attendances.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No hay registros de asistencia aún.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {attendances.map((att, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-sm">
                        <span className="font-medium text-slate-600">
                          {new Date(att.fecha + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        {att.estado === 'P' ? (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold">Presente</span>
                        ) : att.estado === 'F' ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold">Falta</span>
                        ) : att.estado === 'T' ? (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">Tardanza</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">Sin Marcar</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recomendación de Gemini AI */}
          {(student.riesgo === 'alto' || student.riesgo === 'medio') && (
            <Card className="glass-card overflow-hidden border-indigo-100">
              <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center justify-between">
                <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-500" />
                  Sugerencia Pedagógica AI
                </h3>
                <Button 
                  size="sm" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                  onClick={generateGeminiRecommendation}
                  disabled={generatingAI}
                >
                  <Sparkles className="w-4 h-4" />
                  {generatingAI ? "Pensando..." : "Generar con Gemini"}
                </Button>
              </div>
              <CardContent className="p-6">
                {!recommendation ? (
                  <div className="text-center py-6">
                    <Bot className="w-10 h-10 text-indigo-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Ingresa los motivos del bajo rendimiento en el panel lateral derecho y genera una recomendación guiada por Inteligencia Artificial para preparar tu visita a domicilio.
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-sm prose-indigo max-w-none text-slate-700">
                    <div dangerouslySetInnerHTML={{ __html: recommendation.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StrengthsCard strengths={student.fortalezas} />
            <ImprovementCard improvements={student.oportunidades} />
          </div>
        </motion.div>

        <motion.div 
          className="lg:col-span-1 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardContent className="p-8 flex flex-col items-center">
              <CircularRiskIndex risk={student.riesgo} />
              
              <div className="w-full mt-8 pt-6 border-t border-slate-100">
                <h4 className="font-medium text-slate-900 mb-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" />
                  Impacto Esperado
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Mejora de Promedio</span>
                      <span className="font-medium text-success">+15%</span>
                    </div>
                    <ProgressBar value={85} indicatorClassName="bg-success" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Retención Escolar</span>
                      <span className="font-medium text-primary">Alta</span>
                    </div>
                    <ProgressBar value={92} />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-6"
                  onClick={() => navigate("/route")}
                >
                  Ver Ruta de Acción
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Módulo de Intervención Temprana */}
          {(student.riesgo === 'alto' || student.riesgo === 'medio') && (
            <Card className="glass-card border-amber-200 bg-amber-50/30">
              <CardContent className="p-6">
                <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-4 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Módulo de Intervención Temprana
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Supuestos Motivos (Bajo Rendimiento)
                    </label>
                    <textarea 
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                      rows="3"
                      placeholder="Ej. Problemas familiares, falta de apoyo en casa, inasistencias por salud..."
                      value={motivo}
                      onChange={e => setMotivo(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5" /> Programar Visita a Domicilio
                    </label>
                    <input 
                      type="date" 
                      className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                      value={fechaVisita}
                      onChange={e => setFechaVisita(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleSaveIntervention}
                    disabled={savingIntervention}
                  >
                    <Save className="w-4 h-4" />
                    {savingIntervention ? "Guardando..." : "Guardar Intervención"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </motion.div>
      </div>
    </div>
  );
}
