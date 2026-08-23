# Piano Web — demo cursor-native-agent

Piano visual de dos octavas (C3–C5) creado como demo para **Meetup GDL** y el proyecto **cursor-native-agent**.

Sin dependencias: HTML, CSS y JavaScript puro con Web Audio API.

## Cómo abrirlo

**Opción 1 — directo en el navegador**

Abre `index.html` con doble clic o arrástralo al navegador.

**Opción 2 — servidor local (recomendado)**

```bash
cd /workspace/meetup-demo-recording/dash-piano
python -m http.server 8080
```

Luego visita [http://localhost:8080](http://localhost:8080).

## Cómo tocar

- **Mouse / touch:** pulsa cualquier tecla blanca o negra.
- **Teclado del equipo:** usa las teclas indicadas en la interfaz.

### Atajos

| Octava 3 | Tecla |
|----------|-------|
| C3–B3    | Z S X D C V G B H N J M |

| Octava 4–5 | Tecla |
|------------|-------|
| C4–C5      | Q 2 W 3 E R 5 T 6 Y 7 U I |

## Detalles técnicos

- Teclas negras individuales con posición absoluta (no una franja continua).
- Síntesis con envolvente ADSR (ataque, decaimiento, sustain, release).
- Feedback visual al pulsar (mouse o teclado).
