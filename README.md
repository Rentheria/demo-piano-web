# 🎹 Piano Web

Demo construido para **Meetup GDL** mostrando las capacidades de **cursor-native-agent**.

## ✨ Características

- Piano interactivo de 2+ octavas (C3 a C5)
- Interfaz limpia con estética Cursor (crema y carbón)
- Soporte para mouse, teclado y táctil (móvil)
- Síntesis de audio con Web Audio API
- Sin frameworks, sin build tools, sin dependencias npm
- Completamente auto-contenido

## 🚀 Cómo usar

### Opción 1: Abrir directamente
Simplemente abre `index.html` en tu navegador favorito (Chrome, Firefox, Safari, Edge).

### Opción 2: Servidor HTTP local
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# Node.js (si tienes npx)
npx http-server -p 8080
```

Luego visita: `http://localhost:8080`

## ⌨️ Atajos de Teclado

### Teclas blancas (notas naturales)
```
A S D F G H J K L ; '
C D E F G A B C D E F
```

### Teclas negras (sostenidos)
```
W E   T Y U   O P
C# D# F# G# A# C# D#
```

## 🎵 Notas técnicas

- **Web Audio API**: Síntesis de audio en tiempo real usando osciladores de onda sinusoidal
- **Envolvente ADSR**: Ataque, decaimiento y liberación suaves para un sonido más natural
- **Responsive**: Adaptado para desktop, tablet y móvil
- **Accesible**: Funciona sin conexión a internet (excepto fuentes de Google)

## 📁 Estructura

```
.
├── index.html    # Estructura HTML del piano
├── styles.css    # Estilos con paleta Cursor
├── piano.js      # Lógica del piano y Web Audio API
└── README.md     # Este archivo
```

## 🛠️ Tecnologías

- HTML5
- CSS3 (Flexbox, variables CSS, responsive design)
- JavaScript (ES6+)
- Web Audio API

## 📝 Licencia

MIT License © 2026

Construido con ❤️ usando cursor-native-agent para Meetup GDL.

---

**¿Preguntas?** Este proyecto fue generado completamente por un agente de Cursor como demostración de desarrollo asistido por IA.