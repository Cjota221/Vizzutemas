/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  
  // =====================================================
  // SAFELIST - Classes dinâmicas vindas do banco de dados
  // O JIT do Tailwind ignora classes que não estão no código
  // Aqui garantimos que todas as classes comuns estejam disponíveis
  // =====================================================
  safelist: [
    // ===== SPACING (Padding & Margin) =====
    // Pattern para p-0 até p-20, px, py, pt, pr, pb, pl
    { pattern: /^p[xytblr]?-\d+$/ },
    { pattern: /^-?m[xytblr]?-\d+$/ },
    { pattern: /^p[xytblr]?-\[.+\]$/ },
    { pattern: /^-?m[xytblr]?-\[.+\]$/ },
    { pattern: /^gap-\d+$/ },
    { pattern: /^gap-[xy]-\d+$/ },
    { pattern: /^space-[xy]-\d+$/ },
    
    // ===== SIZING (Width & Height) =====
    { pattern: /^w-\d+$/ },
    { pattern: /^w-(full|screen|auto|min|max|fit)$/ },
    { pattern: /^w-\[.+\]$/ },
    { pattern: /^h-\d+$/ },
    { pattern: /^h-(full|screen|auto|min|max|fit)$/ },
    { pattern: /^h-\[.+\]$/ },
    { pattern: /^min-w-\d+$/ },
    { pattern: /^min-h-\d+$/ },
    { pattern: /^max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|screen|none)$/ },
    { pattern: /^max-h-\d+$/ },
    
    // ===== TYPOGRAPHY =====
    { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/ },
    { pattern: /^text-\[.+\]$/ },
    { pattern: /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/ },
    { pattern: /^leading-(none|tight|snug|normal|relaxed|loose|\d+)$/ },
    { pattern: /^tracking-(tighter|tight|normal|wide|wider|widest)$/ },
    { pattern: /^text-(left|center|right|justify)$/ },
    
    // ===== COLORS (Background, Text, Border) =====
    { pattern: /^bg-(transparent|current|black|white)$/ },
    { pattern: /^bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/ },
    { pattern: /^bg-\[.+\]$/ },
    { pattern: /^text-(transparent|current|black|white)$/ },
    { pattern: /^text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/ },
    { pattern: /^text-\[.+\]$/ },
    { pattern: /^border-(transparent|current|black|white)$/ },
    { pattern: /^border-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/ },
    { pattern: /^border-\[.+\]$/ },
    
    // ===== BORDERS =====
    { pattern: /^border(-[trbl])?(-\d+)?$/ },
    { pattern: /^rounded(-[trbl]{1,2})?(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/ },
    { pattern: /^rounded-\[.+\]$/ },
    
    // ===== FLEXBOX =====
    'flex', 'inline-flex', 'flex-row', 'flex-col', 'flex-row-reverse', 'flex-col-reverse',
    'flex-wrap', 'flex-nowrap', 'flex-wrap-reverse',
    { pattern: /^flex-(1|auto|initial|none)$/ },
    { pattern: /^grow(-0)?$/ },
    { pattern: /^shrink(-0)?$/ },
    { pattern: /^basis-\d+$/ },
    'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly',
    'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch',
    'content-start', 'content-end', 'content-center', 'content-between', 'content-around', 'content-evenly',
    'self-auto', 'self-start', 'self-end', 'self-center', 'self-stretch', 'self-baseline',
    
    // ===== GRID =====
    { pattern: /^grid-cols-\d{1,2}$/ },
    { pattern: /^grid-rows-\d{1,2}$/ },
    { pattern: /^col-span-\d{1,2}$/ },
    { pattern: /^row-span-\d{1,2}$/ },
    'grid', 'inline-grid', 'grid-flow-row', 'grid-flow-col', 'grid-flow-dense',
    
    // ===== DISPLAY & POSITIONING =====
    'block', 'inline-block', 'inline', 'hidden', 'invisible', 'visible',
    'static', 'fixed', 'absolute', 'relative', 'sticky',
    { pattern: /^(top|right|bottom|left|inset)-\d+$/ },
    { pattern: /^(top|right|bottom|left|inset)-\[.+\]$/ },
    { pattern: /^z-\d+$/ },
    'z-auto',
    
    // ===== OVERFLOW =====
    'overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll',
    'overflow-x-auto', 'overflow-x-hidden', 'overflow-x-visible', 'overflow-x-scroll',
    'overflow-y-auto', 'overflow-y-hidden', 'overflow-y-visible', 'overflow-y-scroll',
    
    // ===== OPACITY & SHADOW =====
    { pattern: /^opacity-\d+$/ },
    { pattern: /^shadow(-sm|-md|-lg|-xl|-2xl|-inner|-none)?$/ },
    { pattern: /^shadow-\[.+\]$/ },
    
    // ===== ASPECT RATIO =====
    { pattern: /^aspect-(auto|square|video)$/ },
    { pattern: /^aspect-\[.+\]$/ },
    { pattern: /^aspect-\d+\/\d+$/ },
    
    // ===== OBJECT FIT & POSITION =====
    'object-contain', 'object-cover', 'object-fill', 'object-none', 'object-scale-down',
    'object-bottom', 'object-center', 'object-left', 'object-right', 'object-top',
    
    // ===== TRANSITIONS & ANIMATIONS =====
    'transition', 'transition-all', 'transition-colors', 'transition-opacity', 'transition-shadow', 'transition-transform',
    { pattern: /^duration-\d+$/ },
    { pattern: /^delay-\d+$/ },
    'ease-linear', 'ease-in', 'ease-out', 'ease-in-out',
    'animate-none', 'animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce',
    
    // ===== TRANSFORMS =====
    { pattern: /^scale-\d+$/ },
    { pattern: /^rotate-\d+$/ },
    { pattern: /^translate-[xy]-\d+$/ },
    { pattern: /^-translate-[xy]-\d+$/ },
    
    // ===== CURSOR =====
    'cursor-auto', 'cursor-default', 'cursor-pointer', 'cursor-wait', 'cursor-text', 'cursor-move', 'cursor-not-allowed',
    
    // ===== FILTER & BACKDROP =====
    'blur', 'blur-sm', 'blur-md', 'blur-lg', 'blur-xl', 'blur-2xl', 'blur-3xl',
    'brightness-0', 'brightness-50', 'brightness-75', 'brightness-90', 'brightness-95', 'brightness-100', 'brightness-105', 'brightness-110', 'brightness-125', 'brightness-150', 'brightness-200',
    'backdrop-blur', 'backdrop-blur-sm', 'backdrop-blur-md', 'backdrop-blur-lg',
    
    // ===== GRADIENTS =====
    { pattern: /^bg-gradient-to-(t|tr|r|br|b|bl|l|tl)$/ },
    { pattern: /^from-(transparent|current|black|white)$/ },
    { pattern: /^from-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/ },
    { pattern: /^via-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/ },
    { pattern: /^to-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/ },
    
    // ===== RESPONSIVE PREFIXES =====
    // Incluir variantes responsivas para classes comuns
    { pattern: /^sm:(flex|hidden|block|inline-block|grid)$/ },
    { pattern: /^md:(flex|hidden|block|inline-block|grid)$/ },
    { pattern: /^lg:(flex|hidden|block|inline-block|grid)$/ },
    { pattern: /^xl:(flex|hidden|block|inline-block|grid)$/ },
    { pattern: /^sm:grid-cols-\d{1,2}$/ },
    { pattern: /^md:grid-cols-\d{1,2}$/ },
    { pattern: /^lg:grid-cols-\d{1,2}$/ },
    { pattern: /^xl:grid-cols-\d{1,2}$/ },
    { pattern: /^sm:text-(xs|sm|base|lg|xl|2xl|3xl)$/ },
    { pattern: /^md:text-(xs|sm|base|lg|xl|2xl|3xl)$/ },
    { pattern: /^lg:text-(xs|sm|base|lg|xl|2xl|3xl)$/ },
    { pattern: /^sm:p[xytblr]?-\d+$/ },
    { pattern: /^md:p[xytblr]?-\d+$/ },
    { pattern: /^lg:p[xytblr]?-\d+$/ },
    { pattern: /^sm:w-\d+$/ },
    { pattern: /^md:w-\d+$/ },
    { pattern: /^lg:w-\d+$/ },
    
    // ===== HOVER & FOCUS STATES =====
    { pattern: /^hover:bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/ },
    { pattern: /^hover:text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/ },
    { pattern: /^hover:border-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/ },
    { pattern: /^hover:opacity-\d+$/ },
    { pattern: /^hover:scale-\d+$/ },
    { pattern: /^focus:ring-\d+$/ },
    { pattern: /^focus:ring-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/ },
    'focus:outline-none', 'focus:ring', 'focus:ring-offset-2',
  ],
  
  theme: {
    extend: {
      // ===== FLUID TYPOGRAPHY =====
      // Fontes que escalam suavemente entre mobile e desktop
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 3rem)',
      },
      
      // ===== SPACING FLUIDO =====
      spacing: {
        'fluid-1': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)',
        'fluid-4': 'clamp(1rem, 0.8rem + 1vw, 1.5rem)',
        'fluid-6': 'clamp(1.5rem, 1.2rem + 1.5vw, 2rem)',
        'fluid-8': 'clamp(2rem, 1.6rem + 2vw, 3rem)',
      },
      
      // ===== ANIMAÇÕES CUSTOMIZADAS =====
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
