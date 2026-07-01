import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BrainCircuit, 
  Route, 
  BookOpen, 
  MessageSquare,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileSpreadsheet, label: "Registro Auxiliar", path: "/registro" },
  { icon: Users, label: "Estudiantes", path: "/students" },

  { icon: BrainCircuit, label: "Análisis IA", path: "/ai-analysis" },
  { icon: Route, label: "Ruta de Acción", path: "/route" },
  { icon: BookOpen, label: "Recursos", path: "/resources" },
  { icon: MessageSquare, label: "Mensajes", path: "/messages" },
];

export function Sidebar({ className }) {
  return (
    <aside className={cn("flex flex-col w-64 h-screen border-r border-slate-200 bg-white", className)}>
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Quipu<span className="text-primary">AI</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">Docente</span>
            <span className="text-xs text-slate-500">Primaria</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
