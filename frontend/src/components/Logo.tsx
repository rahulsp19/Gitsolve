

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Connections */}
      <path 
        d="M 20 60 L 40 45 L 70 60 L 90 25 M 40 45 L 40 75 L 70 60" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Nodes */}
      <circle cx="20" cy="60" r="9" fill="currentColor" />
      <circle cx="40" cy="45" r="9" fill="currentColor" />
      <circle cx="40" cy="75" r="9" fill="currentColor" />
      <circle cx="70" cy="60" r="9" fill="currentColor" />
      <circle cx="90" cy="25" r="9" fill="currentColor" />
    </svg>
  );
}
