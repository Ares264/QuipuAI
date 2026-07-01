import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { StatsCards } from "../components/dashboard/StatsCards";
import { RiskChart } from "../components/dashboard/RiskChart";
import { StudentsTable } from "../components/dashboard/StudentsTable";
import { AddStudentModal } from "../components/student/AddStudentModal";
import { Button } from "../components/ui/Button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

const GRADES = ["1°", "2°", "3°", "4°", "5°"];

export function Dashboard() {
  const [selectedGrade, setSelectedGrade] = useState("1°");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Listen to Firestore real-time updates
    const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching students: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.grado === selectedGrade);
  }, [students, selectedGrade]);

  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const bajo = filteredStudents.filter(s => s.riesgo === "bajo").length;
    const medio = filteredStudents.filter(s => s.riesgo === "medio").length;
    const alto = filteredStudents.filter(s => s.riesgo === "alto").length;
    
    return { total, bajo, medio, alto };
  }, [filteredStudents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard General</h1>
          <p className="text-sm text-slate-500 mt-1">Vista general del rendimiento y riesgo estudiantil</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            {GRADES.map(grade => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedGrade === grade
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
          
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </Button>
        </div>
      </div>

      <StatsCards stats={stats} />

      {loading ? (
        <div className="text-center py-10 text-slate-500">Cargando datos...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StudentsTable students={filteredStudents} />
          </motion.div>
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RiskChart data={stats} />
          </motion.div>
        </div>
      )}

      <AddStudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
