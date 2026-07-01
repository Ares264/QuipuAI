import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "react-router-dom";
import { Users, Search, AlertTriangle, ChevronRight, Phone } from "lucide-react";

const GRADES = ["Todos", "1°", "2°", "3°", "4°", "5°", "6°"];
const SECTIONS = ["Todas", "A", "B", "C"];

export function StudentsDirectoryPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("Todos");
  const [sectionFilter, setSectionFilter] = useState("Todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "students"), snap => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchName = s.nombre.toLowerCase().includes(search.toLowerCase());
      const matchGrade = gradeFilter === "Todos" || s.grado === gradeFilter;
      const matchSection = sectionFilter === "Todas" || s.curso === sectionFilter;
      return matchName && matchGrade && matchSection;
    }).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [students, search, gradeFilter, sectionFilter]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Cargando directorio...</div>;
  }

  const selectCls = "px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none shadow-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Directorio de Estudiantes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión y seguimiento de alumnos de Nivel Primaria
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
          <select className={selectCls} value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
            {GRADES.map(g => <option key={g} value={g}>{g === "Todos" ? "Grados" : g}</option>)}
          </select>
          <select className={selectCls} value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
            {SECTIONS.map(s => <option key={s} value={s}>{s === "Todas" ? "Secciones" : s}</option>)}
          </select>
        </div>
      </div>

      {/* Roster Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">No se encontraron estudiantes</h3>
          <p className="text-sm text-slate-500 mt-1">Intenta ajustando los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(st => (
            <Link 
              key={st.id} 
              to={`/student/${st.id}`}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col gap-3"
            >
              {/* Top Row: Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm md:text-base leading-tight group-hover:text-primary transition-colors pr-8">
                    {st.nombre}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {st.grado} – Sección {st.curso}
                  </div>
                </div>
                
                {st.riesgo === 'alto' && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-red-50 rounded-bl-3xl flex items-start justify-end p-2 border-l border-b border-red-100">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                )}
                {st.riesgo === 'medio' && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-orange-50 rounded-bl-3xl flex items-start justify-end p-2 border-l border-b border-orange-100">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-slate-50 rounded p-2 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Promedio</div>
                  <div className={`text-sm font-bold ${
                    st.promedio < 11 ? "text-danger" : st.promedio < 14 ? "text-amber-600" : "text-success"
                  }`}>{st.promedio}</div>
                </div>
                <div className="bg-slate-50 rounded p-2 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Asistencia</div>
                  <div className={`text-sm font-bold ${
                    st.asistencia < 70 ? "text-danger" : st.asistencia < 85 ? "text-amber-600" : "text-success"
                  }`}>{st.asistencia}%</div>
                </div>
              </div>

              {/* Footer Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone className="w-3 h-3" /> 
                  {st.telefonoPadre || 'Sin contacto'}
                </div>
                <span className="text-xs font-medium text-primary flex items-center gap-0.5 group-hover:gap-1 transition-all">
                  Ver perfil <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
