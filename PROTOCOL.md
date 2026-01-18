# 🔌 ENJOY PROTOCOL

> **Il layer che trasforma enjoy da gioco a piattaforma.**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   "Non stiamo costruendo un gioco.                                        ║
║    Stiamo costruendo le fondamenta su cui altri costruiranno."            ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🌐 Cos'è il Protocollo enjoy?

Un **standard aperto** che permette a:
- 🎮 **Altri giochi** di connettersi a enjoy
- 🛠️ **Tool e bot** di interagire con lo stato
- 🎨 **Artisti** di creare asset che vivono nel gioco
- 🏗️ **Builder** di costruire sopra le nostre fondamenta

---

## 🔗 Come Funziona

### 1. State API (Read-Only)
Qualsiasi repo può leggere lo stato di enjoy:

```bash
# Stato corrente del gioco
curl https://raw.githubusercontent.com/fabriziosalmi/enjoy/main/state.json

# Lista player
curl https://raw.githubusercontent.com/fabriziosalmi/enjoy/main/game/players/

# Livello corrente
curl https://raw.githubusercontent.com/fabriziosalmi/enjoy/main/levels/
```

### 2. Webhook Integration
I tuoi workflow possono ascoltare eventi di enjoy:

```yaml
# Nel tuo repo
name: React to enjoy
on:
  repository_dispatch:
    types: [enjoy-level-up, enjoy-achievement, enjoy-event]

jobs:
  react:
    runs-on: ubuntu-latest
    steps:
      - name: Do something when enjoy levels up
        run: echo "enjoy reached level ${{ github.event.client_payload.level }}"
```

### 3. Cross-Repo Karma
Altri progetti possono contribuire karma a enjoy:

```yaml
# Nel tuo repo - contribuisci karma quando qualcuno fa qualcosa di buono
- name: Send karma to enjoy
  uses: peter-evans/repository-dispatch@v2
  with:
    token: ${{ secrets.ENJOY_TOKEN }}
    repository: fabriziosalmi/enjoy
    event-type: external-karma
    client-payload: '{"player": "${{ github.actor }}", "amount": 5, "reason": "helped in my-project"}'
```

---

## 🎨 Per Artisti

### Contribuisci Arte Generativa

1. Crea SVG che reagisce allo stato del gioco:
```svg
<!-- Il tuo SVG può leggere variabili di enjoy -->
<svg data-enjoy-level="LEVEL" data-enjoy-karma="KARMA">
  <!-- Arte che cambia in base al livello -->
</svg>
```

2. Proponi via Issue con label `art`
3. Se approvato, diventa parte del gioco!

### Galleria Decentralizzata
La tua arte può vivere nel TUO repo ma essere visibile in enjoy:

```json
// game/art/external.json
{
  "galleries": [
    {
      "artist": "@tuo_username",
      "repo": "tuo_username/enjoy-art",
      "pieces": ["piece1.svg", "piece2.svg"]
    }
  ]
}
```

---

## 🛠️ Per Hacker/Builder

### Costruisci Tool che Interagiscono

**Esempi di progetti possibili:**

| Progetto | Descrizione |
|----------|-------------|
| `enjoy-cli` | CLI per giocare da terminale |
| `enjoy-dashboard` | Real-time dashboard dello stato |
| `enjoy-music` | Genera musica dallo stato del gioco |
| `enjoy-3d` | Visualizzazione 3D del board |
| `enjoy-mobile` | App mobile per notifiche |
| `enjoy-discord` | Bot Discord che annuncia eventi |
| `enjoy-telegram` | Bot Telegram per giocare |
| `enjoy-vscode` | Estensione VS Code |

### Schema dello State

```typescript
interface EnjoyState {
  level: number;           // 1-100
  phase: string;           // foundation|complexity|metamorphosis|consciousness|transcendence
  totalKarma: number;      // Karma globale
  totalPRs: number;        // PR totali
  players: {
    [username: string]: {
      karma: number;
      streak: number;
      achievements: string[];
      lastActive: string;
    }
  };
  board: any[];            // Contenuti del gioco
  lastHeartbeat: string;   // Ultimo pulse
}
```

---

## 🌍 Progetti Satellite

Questi progetti possono "orbitare" intorno a enjoy:

### Tier 1: Ufficiali
Mantenuti dalla community core di enjoy:
- `enjoy-docs` - Documentazione estesa
- `enjoy-art` - Galleria ufficiale
- `enjoy-translations` - Traduzioni in tutte le lingue

### Tier 2: Community
Mantenuti dalla community:
- Tool, bot, visualizzazioni
- Giochi che usano il protocollo enjoy
- Integrazioni con altre piattaforme

### Tier 3: Sperimentali
- Fork creativi
- Mod del gioco
- Versioni alternative delle regole

---

## 📜 Licenza del Protocollo

**MIT** - Fai quello che vuoi, ma:
1. Non essere cattivo
2. Dai credit dove è dovuto
3. Condividi le migliorie

---

## 🤝 Come Proporre Estensioni al Protocollo

1. Apri una Issue con label `enhancement` + `protocol`
2. Descrivi l'estensione proposta
3. Discussione community
4. Se approvata, diventa parte dello standard

---

## 🔮 Roadmap del Protocollo

### v0.1 (Ora)
- [x] State pubblico leggibile
- [x] Webhook per eventi base
- [x] Arte esterna linkabile

### v0.2 (Prossimo)
- [ ] API REST ufficiale
- [ ] OAuth per azioni cross-repo
- [ ] Standard per arte generativa

### v0.3 (Futuro)
- [ ] Federazione tra istanze enjoy
- [ ] Cross-chain karma (altri "enjoy" su GitLab, etc.)
- [ ] SDK ufficiale (JS/Python/Go)

### v1.0 (Sogno)
- [ ] enjoy diventa un protocollo, non solo un repo
- [ ] Chiunque può hostare un'istanza enjoy
- [ ] Universo interconnesso di giochi collaborativi

---

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   "Un protocollo non è un prodotto.                                       ║
║    È una promessa."                                                       ║
║                                                                           ║
║   "Promettiamo che chiunque può costruire su enjoy.                       ║
║    Promettiamo che rimarrà aperto per sempre.                             ║
║    Promettiamo che il gioco è di tutti."                                  ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🚀 Inizia Ora

1. **Leggi** lo [state.json](state.json)
2. **Studia** i [workflow](.github/workflows/)
3. **Proponi** un progetto satellite
4. **Costruisci** qualcosa di incredibile

**Il protocollo è aperto. La piattaforma è tua.**

*Cosa costruirai?* 🔌💜
