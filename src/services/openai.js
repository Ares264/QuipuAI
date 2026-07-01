// This is a mock service prepared for OpenAI integration.
// In the future, you will install 'openai' package and configure the client.

export const getMockedAnalysis = (student) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        summary: `El estudiante ${student.nombre} muestra un rendimiento ${student.riesgo === 'bajo' ? 'sobresaliente' : student.riesgo === 'medio' ? 'inconsistente' : 'preocupante'} con un promedio de ${student.promedio}/20. Su asistencia es del ${student.asistencia}%.`,
        factors: [
          student.asistencia < 80 ? "Asistencia irregular a clases." : null,
          student.participacion < 5 ? "Baja participación activa." : null,
          student.tareas < 70 ? "Incumplimiento en entrega de tareas." : null,
          student.riesgo === 'alto' ? "Tendencia a la baja en los últimos 3 meses." : null
        ].filter(Boolean).concat(student.riesgo === 'bajo' ? ["Hábitos de estudio sólidos.", "Participación constante."] : []),
        explanation: student.riesgo === 'bajo' 
          ? "El estudiante mantiene un buen ritmo de aprendizaje y demuestra compromiso con sus responsabilidades académicas." 
          : "Existen áreas que requieren atención para evitar que el rendimiento académico se vea más afectado a largo plazo.",
        riskLevel: student.riesgo,
        priority: student.riesgo === 'alto' ? 'Alta' : student.riesgo === 'medio' ? 'Media' : 'Baja'
      });
    }, 2000); // Simulate API delay
  });
};

export const analyzeStudent = async (student) => {
  // TODO: Integrate with OpenAI API here
  // const completion = await openai.chat.completions.create({...})
  
  return getMockedAnalysis(student);
};
