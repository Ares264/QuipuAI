import { motion } from "framer-motion";

export function CircularRiskIndex({ risk = "bajo" }) {
  // Convert risk level to a score 0-100
  const scores = {
    bajo: 15, // 15% risk
    medio: 55, // 55% risk
    alto: 85, // 85% risk
  };
  
  const colors = {
    bajo: "#16a34a",
    medio: "#eab308",
    alto: "#dc2626",
  };

  const score = scores[risk] || scores.bajo;
  const color = colors[risk] || colors.bajo;
  
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#f1f5f9"
          strokeWidth="12"
          fill="transparent"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{score}</span>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Índice</span>
      </div>
      
      <div className="mt-4 text-center">
        <h4 className="font-semibold text-slate-900">Riesgo {risk.charAt(0).toUpperCase() + risk.slice(1)}</h4>
        <p className="text-xs text-slate-500 max-w-[200px] mt-1">
          {risk === "bajo" && "El estudiante muestra un rendimiento estable y participación adecuada."}
          {risk === "medio" && "Requiere atención en áreas específicas para evitar empeorar su rendimiento."}
          {risk === "alto" && "Intervención inmediata requerida. Alto riesgo de deserción o reprobación."}
        </p>
      </div>
    </div>
  );
}
