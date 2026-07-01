import { useState, useEffect, useMemo } from "react";
import {
  collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, query, where, updateDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Save, Plus, Trash2, BookOpen, Calendar, ClipboardList,
  FileSpreadsheet, AlertCircle, AlertTriangle, Phone, ExternalLink
} from "lucide-react";
import { Button } from "../components/ui/Button";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const GRADES   = ["1°", "2°", "3°", "4°", "5°", "6°"];
const SECTIONS = ["A", "B", "C"];

const ATT_STATES = {
  '': { label: '',  bg: 'bg-white hover:bg-slate-100',                 text: 'Sin marcar' },
  P:  { label: 'P', bg: 'bg-green-100 hover:bg-green-200 text-green-800', text: 'Presente'  },
  F:  { label: 'F', bg: 'bg-red-100   hover:bg-red-200   text-red-800',   text: 'Falta'     },
  T:  { label: 'T', bg: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800', text: 'Tardanza' },
};
const STATE_CYCLE = ['', 'P', 'F', 'T'];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getSchoolDays(count = 22) {
  const days = [];
  const d = new Date();
  while (days.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) days.unshift(new Date(d));
    d.setDate(d.getDate() - 1);
  }
  return days;
}

const fmtISO  = (d) => d.toISOString().split('T')[0];
const fmtDay  = (d) => d.getDate().toString().padStart(2, '0');
const fmtMon  = (d) => d.toLocaleString('es-PE', { month: 'short' });
const fmtWday = (d) => d.toLocaleString('es-PE', { weekday: 'narrow' });

const selectCls = "px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none shadow-sm";
const thCls     = "px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap border-b border-slate-200 bg-slate-50";
const tdCls     = "px-3 py-2 text-sm border-b border-slate-100";
const inputCls  = "w-full text-center px-1 py-1 border border-slate-200 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm";

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════════════ */
export function RegistryPage() {
  const [tab, setTab]               = useState("asistencia");
  const [grade, setGrade]           = useState("1°");
  const [section, setSection]       = useState("A");
  const [students, setStudents]     = useState([]);
  const [courses, setCourses]       = useState([]);
  const [attendance, setAttendance] = useState({});   // key: `${sid}_${date}` → 'P'|'F'|'T'|''
  const [grades, setGrades]         = useState({});   // key: `${sid}_${cid}`  → {nota, participacion, observacion}
  const [gradeEdits, setGradeEdits] = useState({});
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [newCourseName, setNewCourseName] = useState("");
  const [addingCourse, setAddingCourse]   = useState(false);

  const schoolDays = useMemo(() => getSchoolDays(22), []);

  /* ── Firestore subscriptions ── */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "students"), snap => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => setError(err.message));
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "courses"),
      where("grado",  "==", grade),
      where("curso",  "==", section)
    );
    const unsub = onSnapshot(q, snap => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.orden - b.orden));
    });
    return unsub;
  }, [grade, section]);

  useEffect(() => {
    const startDate = fmtISO(schoolDays[0]);
    const endDate   = fmtISO(schoolDays[schoolDays.length - 1]);
    const q = query(
      collection(db, "attendance"),
      where("grado",  "==", grade),
      where("curso",  "==", section),
      where("fecha",  ">=", startDate),
      where("fecha",  "<=", endDate)
    );
    const unsub = onSnapshot(q, snap => {
      const map = {};
      snap.docs.forEach(d => {
        const { studentId, fecha, estado } = d.data();
        map[`${studentId}_${fecha}`] = estado;
      });
      setAttendance(map);
    });
    return unsub;
  }, [grade, section, schoolDays]);

  useEffect(() => {
    const q = query(
      collection(db, "grades"),
      where("grado", "==", grade),
      where("curso", "==", section)
    );
    const unsub = onSnapshot(q, snap => {
      const map = {};
      snap.docs.forEach(d => { map[`${d.data().studentId}_${d.data().courseId}`] = { id: d.id, ...d.data() }; });
      setGrades(map);
    });
    return unsub;
  }, [grade, section]);

  /* ── Derived ── */
  const filtered = useMemo(() =>
    students
      .filter(s => s.grado === grade && s.curso === section)
      .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [students, grade, section]
  );

  /* ── Attendance helpers ── */
  const toggleAttDropdown = async (sid, date, nextState) => {
    const docId = `${sid}_${date}`;
    
    // OPTIMISTIC UPDATE: Make the UI feel instant
    setAttendance(prev => ({ ...prev, [docId]: nextState }));

    try {
      // Fire and forget (Firebase handles offline sync & retry automatically)
      setDoc(doc(db, "attendance", docId), {
        studentId: sid, fecha: date, estado: nextState, grado: grade, curso: section
      });
      
      const newAttendance = { ...attendance, [docId]: nextState };
      let P = 0, F = 0, T = 0;
      schoolDays.forEach(d => {
        const v = newAttendance[`${sid}_${fmtISO(d)}`];
        if (v === 'P') P++;
        else if (v === 'F') F++;
        else if (v === 'T') T++;
      });
      const marked = P + F + T;
      const pct = marked ? Math.round(((P + T * 0.5) / marked) * 100) : 100;
      
      const st = students.find(s => s.id === sid);
      if (st) {
        const newRiesgo = (st.promedio < 11 || pct < 70) ? "alto" : (st.promedio < 14 || pct < 85) ? "medio" : "bajo";
        updateDoc(doc(db, "students", sid), {
          asistencia: pct,
          riesgo: newRiesgo
        });
      }
    } catch (e) { setError(e.message); }
  };

  const markAllPresent = async (date) => {
    setSaving(true);
    
    // OPTIMISTIC UPDATE for all students
    const updates = {};
    filtered.forEach(st => {
      const key = `${st.id}_${date}`;
      if (!attendance[key]) updates[key] = 'P';
    });
    setAttendance(prev => ({ ...prev, ...updates }));

    try {
      const promises = filtered.map(st => {
        const key = `${st.id}_${date}`;
        if (!attendance[key]) {
          return toggleAttDropdown(st.id, date, 'P');
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
    } catch (e) {
      setError("Error marcando asistencia: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const attStats = (sid) => {
    let P = 0, F = 0, T = 0;
    schoolDays.forEach(d => {
      const v = attendance[`${sid}_${fmtISO(d)}`];
      if (v === 'P') P++;
      else if (v === 'F') F++;
      else if (v === 'T') T++;
    });
    const marked = P + F + T;
    const pct = marked ? Math.round(((P + T * 0.5) / marked) * 100) : null;
    return { P, F, T, pct };
  };

  /* ── Grade helpers ── */
  const getGradeVal = (sid, cid, field) => {
    const key = `${sid}_${cid}`;
    if (gradeEdits[key]?.[field] !== undefined) return gradeEdits[key][field];
    return grades[key]?.[field] ?? '';
  };

  const handleGradeEdit = (sid, cid, field, val) => {
    const key = `${sid}_${cid}`;
    setGradeEdits(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [field]: val } }));
  };

  const calcAvg = (sid) => {
    if (!courses.length) return null;
    const notes = courses.map(c => {
      const v = Number(getGradeVal(sid, c.id, 'nota'));
      return isNaN(v) ? null : v;
    }).filter(v => v !== null);
    if (!notes.length) return null;
    return (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1);
  };

  const saveGrades = async () => {
    setSaving(true); setError(null);
    try {
      const studentUpdates = {}; // Track which students need averaging

      await Promise.all(
        Object.entries(gradeEdits).map(([key, changes]) => {
          const [sid, cid] = key.split('_');
          studentUpdates[sid] = true;
          
          const existing = grades[key];
          const docRef = existing?.id
            ? doc(db, "grades", existing.id)
            : doc(db, "grades", key);
          return setDoc(docRef, {
            studentId: sid, courseId: cid, grado: grade, curso: section,
            ...(existing || {}), ...changes
          });
        })
      );

      // Now update the student documents with their new average and risk
      const stPromises = Object.keys(studentUpdates).map(sid => {
        const st = students.find(s => s.id === sid);
        if (!st) return Promise.resolve();

        // Calculate new average
        const notes = courses.map(c => {
          const key = `${sid}_${c.id}`;
          const val = gradeEdits[key]?.nota !== undefined ? gradeEdits[key].nota : grades[key]?.nota;
          const v = Number(val);
          return isNaN(v) || val === '' || val === undefined ? null : v;
        }).filter(v => v !== null);

        const newAvg = notes.length ? Math.round(notes.reduce((a, b) => a + b, 0) / notes.length) : st.promedio;
        const newRiesgo = (newAvg < 11 || st.asistencia < 70) ? "alto" : (newAvg < 14 || st.asistencia < 85) ? "medio" : "bajo";

        return updateDoc(doc(db, "students", sid), {
          promedio: newAvg,
          riesgo: newRiesgo
        });
      });
      await Promise.all(stPromises);

      setGradeEdits({});
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  /* ── Course helpers ── */
  const addCourse = async () => {
    if (!newCourseName.trim()) return;
    setAddingCourse(true);
    try {
      await addDoc(collection(db, "courses"), {
        nombre: newCourseName.trim(), grado: grade, curso: section, orden: courses.length + 1
      });
      setNewCourseName("");
    } catch (e) { setError(e.message); }
    finally { setAddingCourse(false); }
  };

  const deleteCourse = async (id) => {
    if (!confirm("¿Eliminar este curso? Se perderán las notas asociadas.")) return;
    await deleteDoc(doc(db, "courses", id));
  };

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-primary" />
            Registro Auxiliar
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Asistencia diaria • Notas • Participación — Docente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className={selectCls} value={grade}   onChange={e => setGrade(e.target.value)}>
            {GRADES.map(g   => <option key={g}>{g}</option>)}
          </select>
          <select className={selectCls} value={section} onChange={e => setSection(e.target.value)}>
            {SECTIONS.map(s => <option key={s} value={s}>Sección {s}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger/10 text-danger rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Alertas de Riesgo */}
      {filtered.filter(s => s.riesgo === 'alto' || s.riesgo === 'medio').length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-800 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            Alertas de Rendimiento ({grade} – Sección {section})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.filter(s => s.riesgo === 'alto' || s.riesgo === 'medio').map(st => (
              <div key={`alert-${st.id}`} className="bg-white rounded-lg border border-amber-100 p-3 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-800 text-sm truncate">{st.nombre}</span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${st.riesgo === 'alto' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    Riesgo {st.riesgo}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Promedio: <strong>{st.promedio}</strong> | Asist: <strong>{st.asistencia}%</strong>
                </div>
                {st.telefonoPadre ? (
                  <a 
                    href={`https://wa.me/51${st.telefonoPadre.replace(/\D/g,'')}?text=Estimado%20apoderado,%20le%20escribimos%20del%20colegio%20para%20conversar%20sobre%20el%20rendimiento%20de%20${encodeURIComponent(st.nombre)}.`}
                    target="_blank" rel="noreferrer"
                    className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded text-xs font-medium transition-colors"
                  >
                    <Phone className="w-3 h-3" /> Contactar Tutor
                  </a>
                ) : (
                  <div className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 bg-slate-50 text-slate-400 border border-slate-100 rounded text-xs font-medium">
                    Sin teléfono registrado
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-slate-200">
        {[
          { id: "asistencia", label: "Asistencia",            Icon: Calendar      },
          { id: "notas",      label: "Notas y Participación", Icon: ClipboardList },
          { id: "cursos",     label: "Mis Cursos",            Icon: BookOpen      },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === id
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB: ASISTENCIA
      ══════════════════════════════════════════════════════════ */}
      {tab === "asistencia" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className={`${thCls} w-8 text-center sticky left-0 bg-slate-50 z-10`}>N°</th>
                  <th className={`${thCls} min-w-[180px] sticky left-8 bg-slate-50 z-10`}>Apellidos y Nombres</th>
                  {schoolDays.map(day => {
                    const dateStr = fmtISO(day);
                    return (
                      <th key={dateStr} className={`${thCls} w-10 text-center px-1 relative group`}>
                        <div className="text-slate-400 text-[10px] leading-none">{fmtWday(day)}</div>
                        <div className="text-slate-800 font-bold leading-tight">{fmtDay(day)}</div>
                        <div className="text-slate-400 text-[10px] leading-none">{fmtMon(day)}</div>
                        {/* Hover button to mark all present */}
                        <button 
                          onClick={() => markAllPresent(dateStr)}
                          title="Marcar todos Presente"
                          className="absolute -top-2 -right-2 bg-green-500 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-600 shadow-sm z-20"
                        >
                          P
                        </button>
                      </th>
                    );
                  })}
                  <th className={`${thCls} w-12 text-center border-l border-slate-200 text-green-700 bg-green-50/50`} title="Presentes">P</th>
                  <th className={`${thCls} w-12 text-center text-red-700 bg-red-50/50`} title="Faltas">F</th>
                  <th className={`${thCls} w-12 text-center text-yellow-700 bg-yellow-50/50`} title="Tardanzas">T</th>
                  <th className={`${thCls} w-20 text-center border-l border-slate-200`}>% Asist.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={schoolDays.length + 3} className="px-4 py-8 text-center text-slate-400 italic">
                    No hay estudiantes en {grade} – Sección {section}.
                  </td></tr>
                )}
                {filtered.map((student, idx) => {
                  const stats = attStats(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className={`${tdCls} text-center text-slate-400 font-medium sticky left-0 bg-white group-hover:bg-blue-50/20`}>{idx + 1}</td>
                      <td className={`${tdCls} font-medium text-slate-800 sticky left-8 bg-white group-hover:bg-blue-50/20`}>{student.nombre}</td>
                      {schoolDays.map(day => {
                        const dateStr = fmtISO(day);
                        const key     = `${student.id}_${dateStr}`;
                        const state   = attendance[key] || '';
                        const cfg     = ATT_STATES[state];
                        return (
                          <td key={dateStr} className="p-0.5 text-center border-b border-slate-100">
                            <select
                              value={state}
                              onChange={(e) => toggleAttDropdown(student.id, dateStr, e.target.value)}
                              title={cfg.text}
                              className={`w-9 h-7 rounded text-[11px] font-bold text-center appearance-none cursor-pointer focus:ring-2 focus:ring-primary outline-none ${cfg.bg}`}
                            >
                              <option value="" className="bg-white text-black text-center">-</option>
                              <option value="P" className="bg-white text-green-700 text-center font-bold">P</option>
                              <option value="F" className="bg-white text-red-700 text-center font-bold">F</option>
                              <option value="T" className="bg-white text-yellow-700 text-center font-bold">T</option>
                            </select>
                          </td>
                        );
                      })}
                      <td className={`${tdCls} text-center border-l border-slate-200 font-bold text-green-700 bg-green-50/30`}>{stats.P}</td>
                      <td className={`${tdCls} text-center font-bold text-red-700 bg-red-50/30`}>{stats.F}</td>
                      <td className={`${tdCls} text-center font-bold text-yellow-700 bg-yellow-50/30`}>{stats.T}</td>
                      <td className={`${tdCls} text-center border-l border-slate-200`}>
                        {stats.pct !== null ? (
                          <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                            stats.pct >= 85 ? 'bg-green-100 text-green-700'
                            : stats.pct >= 70 ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}>{stats.pct}%</span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
            {Object.entries(ATT_STATES).filter(([k]) => k).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1">
                <span className={`inline-flex items-center justify-center w-6 h-5 rounded text-[11px] font-bold ${v.bg}`}>{v.label}</span>
                {v.text}
              </span>
            ))}
            <span className="ml-auto flex items-center gap-4 italic text-slate-400">
              <span>💡 Selecciona P, F o T (o usa el teclado).</span>
              <span>💡 Pasa el mouse sobre una fecha para "Marcar Todos Presentes".</span>
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: NOTAS Y PARTICIPACIÓN
      ══════════════════════════════════════════════════════════ */}
      {tab === "notas" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            {courses.length === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                ⚠️ Aún no tienes cursos registrados para {grade} – Sección {section}. Ve a la pestaña <strong>Mis Cursos</strong> para agregarlos.
              </p>
            )}
            <div className="ml-auto">
              <Button
                onClick={saveGrades}
                disabled={!Object.keys(gradeEdits).length || saving}
                className="flex items-center gap-2 bg-success hover:bg-success/90 text-white"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar Notas"}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className={`${thCls} w-8 text-center sticky left-0 bg-slate-50 z-10`}>N°</th>
                    <th className={`${thCls} min-w-[180px] sticky left-8 bg-slate-50 z-10`}>Apellidos y Nombres</th>
                    {courses.map(c => (
                      <th key={c.id} className={`${thCls} text-center min-w-[200px]`} colSpan={3}>
                        <span className="text-primary">{c.nombre}</span>
                      </th>
                    ))}
                    <th className={`${thCls} w-24 text-center`}>Promedio</th>
                  </tr>
                  {courses.length > 0 && (
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="sticky left-0 bg-slate-50/80"></th>
                      <th className="sticky left-8 bg-slate-50/80"></th>
                      {courses.map(c => (
                        <>
                          <th key={`${c.id}-nota`}    className="px-2 py-1.5 text-[10px] font-semibold text-slate-500 text-center border-l border-slate-100">Nota (0-20)</th>
                          <th key={`${c.id}-part`}    className="px-2 py-1.5 text-[10px] font-semibold text-slate-500 text-center">Partic. (0-10)</th>
                          <th key={`${c.id}-obs`}     className="px-2 py-1.5 text-[10px] font-semibold text-slate-500 text-center">Observación</th>
                        </>
                      ))}
                      <th></th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={3 + courses.length * 3 + 1} className="px-4 py-8 text-center text-slate-400 italic">
                      No hay estudiantes en {grade} – Sección {section}.
                    </td></tr>
                  )}
                  {filtered.map((student, idx) => {
                    const avg = calcAvg(student.id);
                    const isEdited = Object.keys(gradeEdits).some(k => k.startsWith(student.id));
                    return (
                      <tr key={student.id} className={`hover:bg-blue-50/20 transition-colors group ${isEdited ? 'bg-amber-50/30' : ''}`}>
                        <td className={`${tdCls} text-center text-slate-400 font-medium sticky left-0 bg-inherit group-hover:bg-blue-50/20`}>{idx + 1}</td>
                        <td className={`${tdCls} font-medium text-slate-800 sticky left-8 bg-inherit group-hover:bg-blue-50/20`}>
                          {student.nombre}
                          {isEdited && <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-amber-400" title="Sin guardar" />}
                        </td>
                        {courses.map(c => {
                          const nota   = getGradeVal(student.id, c.id, 'nota');
                          const notaNum = Number(nota);
                          return (
                            <>
                              <td key={`${c.id}-nota`} className="p-1 border-l border-slate-100">
                                <input
                                  type="number" min="0" max="20"
                                  className={`${inputCls} font-semibold ${notaNum < 11 && nota !== '' ? 'text-danger bg-danger/5 border-danger/30' : ''}`}
                                  value={nota}
                                  onChange={e => handleGradeEdit(student.id, c.id, 'nota', e.target.value)}
                                  placeholder="—"
                                />
                              </td>
                              <td key={`${c.id}-part`} className="p-1">
                                <input
                                  type="number" min="0" max="10"
                                  className={inputCls}
                                  value={getGradeVal(student.id, c.id, 'participacion')}
                                  onChange={e => handleGradeEdit(student.id, c.id, 'participacion', e.target.value)}
                                  placeholder="—"
                                />
                              </td>
                              <td key={`${c.id}-obs`} className="p-1">
                                <input
                                  type="text"
                                  className={`${inputCls} text-left text-xs text-slate-500 min-w-[100px]`}
                                  value={getGradeVal(student.id, c.id, 'observacion')}
                                  onChange={e => handleGradeEdit(student.id, c.id, 'observacion', e.target.value)}
                                  placeholder="Ninguna"
                                />
                              </td>
                            </>
                          );
                        })}
                        <td className={`${tdCls} text-center`}>
                          {avg !== null ? (
                            <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${
                              Number(avg) >= 14 ? 'bg-green-100 text-green-700'
                              : Number(avg) >= 11 ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            }`}>{avg}</span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400 italic text-right">
              * Nota en rojo = por debajo de 11. Haz clic en "Guardar Notas" para confirmar los cambios.
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: MIS CURSOS
      ══════════════════════════════════════════════════════════ */}
      {tab === "cursos" && (
        <div className="max-w-xl space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800">Cursos de {grade} – Sección {section}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Agrega los cursos que dictas en este grado para registrar notas.</p>
            </div>

            {courses.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 italic text-sm">
                Aún no hay cursos. Agrega tu primer curso abajo.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {courses.map((c, i) => (
                  <li key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="font-medium text-slate-800">{c.nombre}</span>
                    </div>
                    <button
                      onClick={() => deleteCourse(c.id)}
                      className="text-slate-300 hover:text-danger transition-colors"
                      title="Eliminar curso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/30">
              <label className="block text-sm font-medium text-slate-700 mb-2">Agregar nuevo curso</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  placeholder="Ej. Comunicación, Matemática, Ciencias..."
                  value={newCourseName}
                  onChange={e => setNewCourseName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCourse()}
                />
                <Button onClick={addCourse} disabled={addingCourse || !newCourseName.trim()} className="flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  {addingCourse ? "Agregando..." : "Agregar"}
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-2">Presiona Enter o el botón Agregar. Los cursos son específicos a {grade} – Sección {section}.</p>
            </div>
          </div>

          {/* Suggested courses */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-5 py-4">
            <p className="text-sm font-medium text-blue-800 mb-3">💡 Cursos comunes en primaria</p>
            <div className="flex flex-wrap gap-2">
              {["Comunicación", "Matemática", "Ciencia y Tecnología", "Personal Social", "Arte y Cultura", "Educación Física", "Inglés", "Religión", "Tutoría"].map(name => (
                <button
                  key={name}
                  onClick={() => setNewCourseName(name)}
                  className="px-3 py-1 text-xs bg-white border border-blue-200 rounded-full text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
