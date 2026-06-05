@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300;400;700&family=Roboto:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=JetBrains+Mono:wght@400;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Roboto", "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  --font-serif: "Roboto Slab", Georgia, serif;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Rounded, fluid scrollbars for modern dashboard components */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Clean vector shape rendering */
.stroke-rounded {
  stroke-linecap: round;
  stroke-linejoin: round;
}
