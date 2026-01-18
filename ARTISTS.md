# 🎨 ARTISTS GUIDE

> **Per chi crea con gli occhi e il cuore.**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   "Code is poetry, but art is the soul."                                  ║
║                                                                           ║
║   "Il codice è poesia, ma l'arte è l'anima."                              ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🌟 Perché Artisti su GitHub?

GitHub non è solo per programmatori. È per **creatori**.

In enjoy, l'arte:
- Vive nel repository per sempre
- Può essere interattiva (SVG animati!)
- Può reagire allo stato del gioco
- Diventa parte della storia collettiva

---

## 🎯 Come Contribuire Arte

### 1. Arte Statica (Facile)
Immagini, illustrazioni, loghi.

**Formati accettati:**
- SVG (preferito - scalabile!)
- PNG (con trasparenza)
- GIF (animazioni semplici)

**Come fare:**
1. Crea la tua opera
2. Fork il repository
3. Aggiungi in `art/gallery/tuo_username/`
4. Apri PR con label `art`

### 2. Arte Generativa (Medio)
SVG che cambiano in base a variabili.

```svg
<!-- Esempio: cerchio che cambia colore in base al karma -->
<svg viewBox="0 0 100 100">
  <style>
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    .karma-circle { animation: pulse 2s infinite; }
  </style>
  <circle class="karma-circle" cx="50" cy="50" r="40" fill="url(#karma-gradient)"/>
  <defs>
    <linearGradient id="karma-gradient">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
</svg>
```

### 3. Arte Procedurale (Avanzato)
Arte generata da workflow GitHub Actions.

**Esempi esistenti:**
- `assets/svg/karma-pulse.svg` - Pulsa con lo stato
- `assets/svg/level-progress.svg` - Mostra progresso
- `assets/svg/celebration-*.svg` - Celebrazioni achievement

---

## 🎨 Temi e Stile

### Palette Ufficiale enjoy

| Nome | Hex | Uso |
|------|-----|-----|
| Void Purple | `#1a0a2e` | Sfondo principale |
| Karma Violet | `#8b5cf6` | Azioni positive |
| Energy Pink | `#ec4899` | Achievement |
| Success Green | `#22c55e` | Completamento |
| Warning Gold | `#eab308` | Bounty |
| Dawn Orange | `#f97316` | Streak |

### Mood

- **Cosmico** - Spazio, stelle, void
- **Organico** - Il repo "respira"
- **Giocoso** - Ma non infantile
- **Inclusivo** - Per tutti
- **Misterioso** - C'è sempre qualcosa da scoprire

---

## 🏆 Opportunità per Artisti

### Bounty Attive
Cerca issues con label `art` + `bounty`:
- Logo del gioco
- Badge per achievement
- Illustrazioni per i livelli
- Banner per GitHub Pages

### Progetti Aperti

| Progetto | Descrizione | Difficoltà |
|----------|-------------|------------|
| Achievement Icons | 30+ icone per achievement | 🟡 Medio |
| Level Banners | 100 banner (uno per livello) | 🔴 Epico |
| Character Design | Mascotte/personaggi | 🟡 Medio |
| Animated Logo | Logo SVG animato | 🟢 Facile |
| GitHub Pages Theme | Design completo | 🔴 Avanzato |

---

## 📁 Struttura Art Folder

```
art/
├── gallery/          # Arte dei contributor
│   └── username/     # Tua cartella personale
├── official/         # Arte ufficiale del gioco
├── generated/        # Arte generata dai workflow
└── assets/           # Asset riutilizzabili
```

---

## 🔧 Tool Consigliati

### Per SVG
- **Figma** (gratis) - Esporta in SVG
- **Inkscape** (open source) - Editor SVG potente
- **Boxy SVG** - Editor online

### Per Animazioni
- **Lottie** - Animazioni JSON
- **CSS Animations** - Dentro SVG
- **SMIL** - Animazioni SVG native

### Per Generative Art
- **p5.js** - Se conosci JavaScript
- **Processing** - Visual coding
- **Python + svgwrite** - Generazione programmatica

---

## 💜 Credit e Riconoscimenti

Ogni artista riceve:

1. **Credit nel file** - Il tuo nome nell'SVG/PNG
2. **Credit nel README** - Sezione Contributors
3. **Karma bonus** - +20 per arte approvata
4. **Badge speciale** - "Artist" sul tuo profilo player
5. **Galleria personale** - La tua cartella in `art/gallery/`

---

## 📜 Licenza Arte

Tutta l'arte in enjoy è sotto **CC BY-SA 4.0**:
- ✅ Chiunque può usarla
- ✅ Chiunque può modificarla
- ✅ Deve dare credit
- ✅ Deve usare stessa licenza

---

## 💡 Idee che Cerchiamo

- 🌌 **Visualizzazioni del void** - Come appare il "nulla" prima che il gioco inizi?
- 🎭 **Mascotte** - Un personaggio che rappresenta enjoy
- 🏅 **Badge unici** - Per achievement speciali
- 🌈 **Arte inclusiva** - Che rappresenta TUTTI
- ✨ **Micro-animazioni** - Piccoli dettagli che rendono tutto vivo

---

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   "L'arte non è quello che vedi,                                          ║
║    ma quello che fai vedere agli altri."                                  ║
║                                        - Edgar Degas                      ║
║                                                                           ║
║   "In enjoy, l'arte è quello che costruiamo insieme."                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

**Non serve essere "bravi". Serve voler creare.**

*Il void aspetta la tua arte.* 🎨💜
