import { cn } from "../../lib/utils";

export function Avatar({ src, alt, fallback, className }) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100",
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextElementSibling) {
              e.currentTarget.nextElementSibling.style.display = 'flex';
            }
          }}
        />
      ) : null}
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-500 font-medium",
          src ? "hidden" : "flex"
        )}
      >
        {fallback}
      </div>
    </div>
  );
}
