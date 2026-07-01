import { cn } from "../../lib/utils";

const riskStyles = {
  bajo: "bg-success text-white",
  medio: "bg-warning text-white",
  alto: "bg-danger text-white",
};

const riskLabels = {
  bajo: "Riesgo Bajo",
  medio: "Riesgo Medio",
  alto: "Riesgo Alto",
};

export function RiskIndicator({ risk = "bajo", className }) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm",
        riskStyles[risk] || riskStyles.bajo,
        className
      )}
    >
      {riskLabels[risk] || riskLabels.bajo}
    </div>
  );
}
