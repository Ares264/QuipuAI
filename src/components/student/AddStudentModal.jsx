import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export function AddStudentModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    grado: "1°",
    curso: "A",
    telefonoPadre: "",
    contexto: "",
    asistencia: 100,
    promedio: 20,
    participacion: 10,
    riesgo: "bajo"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateRisk = (asistencia, promedio, participacion) => {
    if (promedio < 11 || asistencia < 70) return "alto";
    if (promedio < 14 || asistencia < 85) return "medio";
    return "bajo";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const parsedAsistencia = parseInt(formData.asistencia, 10) || 0;
      const parsedPromedio = parseInt(formData.promedio, 10) || 0;
      const parsedParticipacion = parseInt(formData.participacion, 10) || 0;
      
      const studentData = {
        ...formData,
        asistencia: parsedAsistencia,
        promedio: parsedPromedio,
        participacion: parsedParticipacion,
        riesgo: calculateRisk(parsedAsistencia, parsedPromedio, parsedParticipacion),
        foto: "" 
      };

      await addDoc(collection(db, "students"), studentData);
      onClose(); 
      
      setFormData({
        nombre: "",
        grado: "1°",
        curso: "A",
        telefonoPadre: "",
        contexto: "",
        asistencia: 100,
        promedio: 20,
        participacion: 10,
        riesgo: "bajo"
      });
    } catch (err) {
      console.error("Error adding student: ", err);
      setError("Error al agregar estudiante. Verifica tu conexión y configuración de Firebase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar Nuevo Estudiante">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-danger/10 text-danger p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              name="nombre" 
              required 
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Ej. Ana García"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Celular Apoderado</label>
            <input 
              type="tel" 
              name="telefonoPadre" 
              value={formData.telefonoPadre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Ej. 987654321"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contexto del Alumno (Opcional)</label>
          <input 
            type="text" 
            name="contexto" 
            value={formData.contexto}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Ej. Zona rural sin internet, quechuahablante..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Grado</label>
            <select 
              name="grado" 
              value={formData.grado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="1°">1°</option>
              <option value="2°">2°</option>
              <option value="3°">3°</option>
              <option value="4°">4°</option>
              <option value="5°">5°</option>
              <option value="6°">6°</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sección/Curso</label>
            <select 
              name="curso" 
              value={formData.curso}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asistencia (%)</label>
            <input 
              type="number" 
              name="asistencia" 
              required 
              min="0"
              max="100"
              value={formData.asistencia}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Promedio</label>
            <input 
              type="number" 
              name="promedio" 
              required 
              min="0"
              max="20"
              value={formData.promedio}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Participación</label>
            <input 
              type="number" 
              name="participacion" 
              required 
              min="0"
              max="10"
              value={formData.participacion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Estudiante"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
