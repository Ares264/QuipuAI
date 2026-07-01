import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Sparkles, Target } from "lucide-react";

export function StrengthsCard({ strengths }) {
  return (
    <Card className="glass-card h-full bg-gradient-to-br from-white to-blue-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-blue-700">
          <Sparkles className="w-5 h-5 mr-2" />
          Fortalezas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {(strengths || []).map((strength, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2 shrink-0"></span>
              <span className="text-slate-700 text-sm">{strength}</span>
            </li>
          ))}
          {(!strengths || strengths.length === 0) && (
            <li className="text-sm text-slate-500 italic">No hay datos registrados.</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ImprovementCard({ improvements }) {
  return (
    <Card className="glass-card h-full bg-gradient-to-br from-white to-amber-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-amber-700">
          <Target className="w-5 h-5 mr-2" />
          Oportunidades de Mejora
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {(improvements || []).map((improvement, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 mr-2 shrink-0"></span>
              <span className="text-slate-700 text-sm">{improvement}</span>
            </li>
          ))}
          {(!improvements || improvements.length === 0) && (
            <li className="text-sm text-slate-500 italic">No hay datos registrados.</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
