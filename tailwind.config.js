/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores Principais do Projeto
        primary: {
          DEFAULT: '#2563eb', // blue-600
          hover: '#1d4ed8',   // blue-700
          light: '#dbeafe',   // blue-100 (para backgrounds)
          soft: '#eff6ff',    // blue-50
        },
        // Cores de Administração / Perigo
        admin: {
          DEFAULT: '#dc2626', // red-600
          hover: '#b91c1c',   // red-700
          light: '#fee2e2',   // red-100
          soft: '#fef2f2',    // red-50
        },
        // Estados de Recursos e Mensagens
        success: {
          DEFAULT: '#16a34a', // green-600
          hover: '#15803d',   // green-700
          light: '#dcfce7',   // green-100
          soft: '#f0fdf4',    // green-50
        },
        warning: {
          DEFAULT: '#ea580c', // orange-600
          hover: '#c2410c',   // orange-700
          light: '#ffedd5',   // orange-100
          soft: '#fff7ed',    // orange-50
        },
        danger: {
          DEFAULT: '#dc2626', // red-600
          hover: '#b91c1c',   // red-700
          light: '#fee2e2',   // red-100
          soft: '#fef2f2',    // red-50
        }
      }
    },
  },
  plugins: [],
}