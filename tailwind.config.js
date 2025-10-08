/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: {
    bg:"#0f172a", panel:"#111827", muted:"#1f2937", text:"#f8fafc",
    sub:"#cbd5e1", accent:"#60a5fa", ok:"#34d399", warn:"#fbbf24", danger:"#f87171"
  }}},
  plugins: []
};
