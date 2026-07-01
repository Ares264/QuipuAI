import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center text-sm text-slate-500 font-medium">
        Bienvenido de vuelta, Profesor
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar estudiante..."
            className="h-9 w-64 rounded-full bg-slate-100 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger"></span>
        </button>
      </div>
    </header>
  );
}
