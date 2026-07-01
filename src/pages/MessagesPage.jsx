import { useState } from "react";
import { MessageSquare, Sparkles, User, Users, Copy, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import studentsData from "../data/students.json";
import { motion, AnimatePresence } from "framer-motion";

export function MessagesPage() {
  const [selectedStudent, setSelectedStudent] = useState(studentsData[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [target, setTarget] = useState(null); // 'parents' or 'student'

  const student = studentsData.find(s => s.id === selectedStudent);

  const generateMessage = (type) => {
    setTarget(type);
    setIsGenerating(true);
    setMessageContent("");
    
    // Simulate API call to OpenAI
    setTimeout(() => {
      if (type === 'parents') {
        setMessageContent(`Estimados padres de ${student.nombre},\n\nEspero que se encuentren muy bien. Les escribo para compartirles una actualización sobre el desempeño académico de ${student.nombre} en este periodo.\n\nActualmente mantiene un promedio de ${student.promedio}/20 con una asistencia del ${student.asistencia}%. Hemos notado que destaca especialmente en áreas como ${student.fortalezas.join(' y ')}.\n\nPara seguir apoyando su desarrollo, nos gustaría proponer algunas estrategias conjuntas enfocadas en: ${student.oportunidades.join(', ')}.\n\nQuedo a su disposición para agendar una breve reunión y conversar sobre los detalles del plan de acción que hemos preparado.\n\nAtentamente,\nEl Docente`);
      } else {
        setMessageContent(`¡Hola ${student.nombre}!\n\nQuería tomarme un momento para reconocer el esfuerzo que has estado poniendo en tus clases. Tienes un gran potencial, especialmente en ${student.fortalezas[0]}.\n\nHe notado que últimamente ${student.oportunidades[0].toLowerCase()} ha sido un reto. No te preocupes, es completamente normal. He preparado algunas actividades y recursos especiales que te ayudarán a fortalecer esa área paso a paso.\n\nRecuerda que estoy aquí para apoyarte. ¡Confío plenamente en tus capacidades!\n\nSaludos,\nTu Profesor`);
      }
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(messageContent);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-primary" />
          Comunicaciones IA
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Genera mensajes empáticos y personalizados para padres o estudiantes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-6">
          <Card className="glass-card">
            <CardContent className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Seleccionar Estudiante
              </label>
              <select 
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-6"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                {studentsData.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>

              <div className="space-y-3">
                <Button 
                  variant={target === 'parents' ? 'primary' : 'outline'} 
                  className="w-full justify-start h-12"
                  onClick={() => generateMessage('parents')}
                  disabled={isGenerating}
                >
                  <Users className="w-4 h-4 mr-3 text-slate-500" />
                  <span className="flex-1 text-left">Mensaje para Padres</span>
                  {target === 'parents' && isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  )}
                </Button>
                
                <Button 
                  variant={target === 'student' ? 'primary' : 'outline'} 
                  className="w-full justify-start h-12"
                  onClick={() => generateMessage('student')}
                  disabled={isGenerating}
                >
                  <User className="w-4 h-4 mr-3 text-slate-500" />
                  <span className="flex-1 text-left">Mensaje para Estudiante</span>
                  {target === 'student' && isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="glass-card h-full min-h-[400px] flex flex-col border-blue-100">
            <div className="bg-slate-50/50 border-b border-slate-100 p-4 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Editor IA</span>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!messageContent}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button size="sm" className="bg-primary text-white hover:bg-blue-700" disabled={!messageContent}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
            
            <CardContent className="flex-1 p-0 relative">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10 rounded-b-2xl"
                  >
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                      <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-600">
                      Escribiendo con empatía...
                    </p>
                  </motion.div>
                ) : messageContent ? (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full"
                  >
                    <textarea
                      className="w-full h-full p-8 bg-transparent border-none focus:ring-0 resize-none text-slate-700 leading-relaxed"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-slate-400"
                  >
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <MessageSquare className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm">Selecciona una opción para generar el mensaje</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
