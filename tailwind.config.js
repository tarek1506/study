/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        /* ── Brand ─────────────────────────────── */
        accent: {
          DEFAULT: "hsl(var(--accent))",
          soft: "hsl(var(--accent-soft))",
        },
        dark: "hsl(var(--dark-fill))",
        /* ── Shadcn compat ─────────────────────── */
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        /* ── Semantic text ─────────────────────── */
        "text-primary":   "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-tertiary":  "hsl(var(--text-tertiary))",
        /* ── Surfaces ──────────────────────────── */
        "bg-page":    "hsl(var(--bg-page))",
        "bg-surface": "hsl(var(--bg-surface))",
        "bg-elevated":"hsl(var(--bg-elevated))",
        "border-subtle": "hsl(var(--border-subtle))",
      },
      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 4px)",
        sm:   "calc(var(--radius) - 8px)",
        xl:   "1.5rem",
        "2xl":"1.75rem",
        full: "9999px",
      },
      boxShadow: {
        card:  "0 1px 4px 0 rgba(0,0,0,0.06)",
        "card-hover": "0 3px 14px 0 rgba(232,115,74,0.10)",
        subtle:"0 1px 3px 0 rgba(0,0,0,0.04)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)"   },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-up":        "fade-up 0.28s ease-out both",
      },
    },
  },
  plugins: [],
}
