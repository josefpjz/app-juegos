# PASSWORD GAME — Esquema completo del sistema

> Documento de referencia para futuras ventanas de contexto.
> Describe qué hace cada acción, cómo fluye el estado, y qué validaciones existen.

---

## 1. Stack y arquitectura

| Capa | Tecnología |
|------|-----------|
| UI | React + TypeScript + Vite |
| Estado global | Zustand (`useGameStore`) con slices separados |
| Persistencia | `localStorage` (auto-save cada 500 ms, debounced) |
| Animaciones | Motion/React (`AnimatePresence`, `motion`) |
| Drag & drop | @dnd-kit/core |
| Estilos | Tailwind + variables CSS custom (tema dark/light) |
| Audio | Web Audio API vía `useSoundFx` |

---

## 2. Flujo de fases (`GamePhase`)

El router de la app (`App.tsx`) es un simple switch sobre `gamePhase`. No hay React Router.

```
home
 └─► registration          (registro de jugadores)
      └─► teams / team-setup  (previsualización y ajuste de equipos)
           └─► mode / mode-select  (elegir modo y duración de ronda)
                ├─► bracket / bracket-view / repechage  (modo Bracket o FFA)
                │    └─► pre-round → playing → round-result  (ciclo de ronda)
                │         └─► final
                └─► league / league-view  (modo Liga)
                     └─► pre-round → playing → round-result
                          └─► final
```

Fases que renderizan el mismo componente:
- `bracket`, `bracket-view`, `repechage` → `BracketPage`
- `teams`, `team-setup` → `TeamsPage`
- `mode`, `mode-select` → `ModePage`
- `league`, `league-view` → `LeaguePage`
- `pre-round`, `playing`, `round-result` → `GameplayPage` (solo en modo Liga)

---

## 3. Modos de juego (`GameMode`)

| Valor | Nombre UI | Descripción |
|-------|-----------|-------------|
| `'bracket'` | Brackets | Eliminación directa tipo Champions. Repechaje si equipos no son potencia de 2 |
| `'league'` | Liga | Round-robin; todos juegan contra todos. Opcional playoffs al final |
| `'ffa'` | Modo Libre | Todos los equipos juegan sus rondas acumulando puntos; gana el mayor total |

---

## 4. Slices del store

### 4.1 `playerSlice`
| Acción | Qué hace | Validaciones |
|--------|----------|--------------|
| `addPlayer(name)` | Agrega `{id, name}` al array `players` | Nombre con ≥1 char (trim). En UI también valida duplicados (case-insensitive) |
| `removePlayer(id)` | Filtra `players` por id | — |
| `updatePlayerName(id, name)` | Reemplaza nombre (trim) | — |
| `clearPlayers()` | Vacía `players` | — |

### 4.2 `teamSlice`
| Acción | Qué hace | Validaciones / lógica especial |
|--------|----------|-------------------------------|
| `generateTeams()` | Divide `players` en parejas aleatorizadas → `teams[]` | Mínimo 4 jugadores, número par (`canGenerateTeams`). Easter egg: "Eli" + "Iveth" se emparejan con 85% de probabilidad |
| `shuffleTeams()` | Re-distribuye sin cambiar la lista de jugadores | Misma lógica; probabilidad del easter egg baja a 45% en shuffle |
| `swapPlayers(p1,t1,p2,t2)` | Intercambia dos jugadores entre equipos | — |
| `movePlayerToTeam(pid,from,to)` | Mueve un jugador a otro equipo | — |
| `confirmTeams()` | Fija `teamsConfirmed = true` | — |
| `loanPlayer(loan)` | Mueve físicamente al jugador entre equipos y registra `LoanRecord` | El jugador debe existir en `fromTeam` |
| `revertTemporaryLoans(matchId)` | Revierte todos los préstamos temporales del partido indicado | Solo afecta `type === 'temporary'` |

**Estructura `LoanRecord`:**
```ts
{ id, playerId, playerName, fromTeamId, toTeamId, type: 'temporary'|'permanent', matchId }
```

### 4.3 `matchSlice`
Controla el gameplay en tiempo real de **una partida** a la vez.

| Acción | Qué hace |
|--------|----------|
| `setCurrentMatch(matchId)` | Resetea `gameplay` e inicializa `currentMatchId`. El timer arranca en `timerDuration` |
| `startRound(teamId, round)` | Pone `isPlaying=true`, resetea scores/skips para el turno actual |
| `recordPoint()` | `roundScore + 1` |
| `skipWord()` | `roundSkips + 1` |
| `finishRound(penalties)` | Calcula `points = max(0, roundScore - penalties)`, guarda `RoundScore` en `roundsCompleted`, `isPlaying=false` |
| `resetCurrentRound()` | Vuelve todo a cero para repetir la ronda sin guardarla |
| `completeMatch()` | Calcula el resultado final del partido (team1 pares, team2 impares), determina `winnerId` (empate si iguales), guarda en `matches[]` y limpia `gameplay` |
| `setWord(word)` | Actualiza `currentWord` y agrega a `wordsUsed` |
| `decrementTimer()` | `timerSeconds - 1` (mínimo 0) |
| `setMatches(matches)` | Reemplaza todo el array `matches` |
| `addMatch(match)` | Agrega un partido al array |

**Estructura `GameplayState`:**
```ts
{
  currentMatchId, currentTeamId,
  currentRound,   // 1 o 2 (por equipo)
  currentWord, wordsUsed,
  roundScore, roundSkips,
  isPlaying, timerSeconds,
  roundsCompleted: RoundScore[]
}
```

**Cómo se calculan los totales:**
- Rondas completadas (índice par → team1, índice impar → team2).
- Cada equipo juega exactamente 2 rondas (`ROUNDS_PER_TEAM = 2`).
- Empate → `winnerId = null`.

### 4.4 `bracketSlice`
| Acción | Qué hace |
|--------|----------|
| `generateBracketTournament()` | Llama a `generateBracket(teams, bracketAdvancingCount)`, guarda rondas y aplana partidos en `matches` |
| `setDiceResults(results)` | Guarda resultados del dado (para repechaje) |
| `setBracketAdvancingCount(n)` | Cuántos equipos pasan directo a segunda ronda sin repechaje |
| `advanceBracketWinner(matchId, winnerId)` | Propaga el ganador al siguiente partido disponible en el bracket |
| `setRepechageMatches(matches)` | Guarda partidos de repechaje |
| `setThirdPlaceMatch(match)` | Guarda el partido por 3er lugar |
| `setEnableThirdPlace(bool)` | Activa/desactiva la opción de 3er lugar |

### 4.5 `leagueSlice`
| Acción | Qué hace |
|--------|----------|
| `setLeagueConfig(config)` | Guarda tipo (`'points'`/`'playoffs'`) y tamaño del playoff (2/4/8) |
| `generateLeague()` | Genera todos los partidos round-robin (`n*(n-1)/2`) |
| `updateStandings()` | Recalcula tabla de posiciones con todos los partidos jugados |
| `generatePlayoffs()` | Toma los top-N del standings y genera bracket eliminatorio |

**Sistema de puntos liga:**
- Victoria: 3 pts
- Empate: 1 pt
- Derrota: 0 pts
- Desempate: diferencia de puntos, luego puntos a favor

### 4.6 `uiSlice`
| Acción | Qué hace |
|--------|----------|
| `toggleTheme()` | Alterna `dark`/`light`, persiste en `localStorage('password-theme')` |
| `setGamePhase(phase)` | Cambia la vista activa |
| `setGameMode(mode)` | Fija el modo antes de generar el torneo |
| `setTimerDuration(seconds)` | Configura duración del timer (10/30/45/60/90/120 s) |
| `resetGame()` | Vuelve todo al estado inicial excepto el tema |

---

## 5. Ciclo de una ronda (gameplay)

```
PreRound (pantalla de preparación)
  ├─ Muestra equipo actual vs rival
  ├─ Roles: Ronda 1 → players[0] da pistas, players[1] adivina
  │         Ronda 2 → roles invertidos
  ├─ Botón "Préstamo" → abre PlayerLoan modal
  └─ Countdown 5→0 → inicia GameRound

GameRound (pantalla de juego)
  ├─ Timer regresivo (useTimer hook)
  ├─ Palabras aleatorias (useWords hook, sin repetir en sesión)
  ├─ ✓ Correcto → recordPoint() + siguiente palabra
  ├─ ⏭ Saltar  → skipWord() + siguiente palabra
  ├─ Alertas de sonido en 10, 5, 3, 2, 1 segundos
  └─ Timer = 0 → buzzer → handleRoundFinish()

RoundResult (pantalla de resultado)
  ├─ Muestra aciertos y saltos
  ├─ Opción de penalización manual (restar N puntos)
  ├─ "Repetir Ronda" → resetCurrentRound() (no guarda, rehace)
  └─ "Confirmar" → finishRound(penalties)
       └─ Si aún quedan turnos → vuelve a PreRound
          Si todos los turnos completados → completeMatch()
```

**Interleaving de turnos:**
- Índice par (0,2,...) = team1
- Índice impar (1,3,...) = team2
- Cada equipo hace 2 rondas → total 4 turnos por partido

---

## 6. Modo Bracket — detalle

### Generación (`generateBracket`)
1. Separa equipos en `byeTeams` (avanzan directo) y `playingTeams`.
2. Crea ronda 0 de repechaje si `playingTeams` no es potencia de 2.
3. Calcula `nextPowerOfTwo` para dimensionar el bracket.
4. Genera rondas vacías con `team1Id/team2Id = ''` que se llenan conforme avanzan ganadores.
5. Los `byeTeams` se colocan en ronda 2 (primera del bracket principal).

### Nombres de rondas
| fromFinal | Nombre |
|-----------|--------|
| 0 | Final |
| 1 | Semifinal |
| 2 | Cuartos de Final |
| 3 | Octavos de Final |
| otro | Ronda N |

### Repechaje con dados
1. Cada equipo tira un dado (1-6).
2. Los que saquen mayor valor avanzan directo.
3. Los demás juegan repechaje entre sí (emparejados aleatoriamente).
4. Si hay empate en el valor de corte, **todos** los equipos empatados van a repechaje.

### Turno queue en BracketPage
Estructura: todos los partidos jugables de la ronda actual, interleaved:
```
[match1-team1-gr1, match1-team2-gr1, match2-team1-gr1, match2-team2-gr1,
 match1-team1-gr2, match1-team2-gr2, match2-team1-gr2, match2-team2-gr2]
```
Al terminar un turno → `turnIndex++`. Al terminar todos → `completeMatch()` para cada partido → `advanceBracketWinner()`.

### Partido de 3er lugar
- Solo si `enableThirdPlace = true`.
- Se genera automáticamente a partir de los perdedores de semifinales.
- Se juega antes de la Final.

---

## 7. Modo Liga — detalle

### Round-robin
- Genera `n*(n-1)/2` partidos (cada par de equipos se enfrenta una vez).
- IDs: `league-match-1001`, `1002`, etc.

### Standings (tabla de posiciones)
Recalculada con `updateStandings()` después de cada partido.
Orden: `totalPoints` desc → diferencia de puntos desc → puntos a favor desc.

### Playoffs opcionales
- Configurable: top 2, 4 u 8 equipos.
- Se genera un bracket eliminatorio con los mejores del standings.
- El máximo playoff permitido depende de cuántos equipos hay (`getMaxPlayoffSize`).

---

## 8. Modo FFA (Modo Libre) — detalle

- Se crea **un único partido ficticio** (`ffa-{timestamp}`) con team1=teams[0], team2=teams[1].
- Turn queue: todos los equipos hacen ronda 1, luego todos hacen ronda 2.
- Los puntos se acumulan en `ffaRounds[]` del partido.
- `FFAScoreTable` muestra ranking en vivo con animación de posiciones.
- Al terminar → `FinalPage` con tabla final y campeón (equipo con mayor total).

---

## 9. Banco de palabras (`useWords`)

| Categoría | Archivo |
|-----------|---------|
| Animales | `data/words/animals.json` |
| Objetos | `data/words/objects.json` |
| Comida | `data/words/food.json` |
| Lugares | `data/words/places.json` |
| Acciones | `data/words/actions.json` |
| Famosos | `data/words/famous.json` |

- Al inicio de la sesión, todas las palabras de todas las categorías se mezclan (Fisher-Yates via `shuffle`).
- Se sirven en orden lineal sin repetir.
- Al agotarse, se vuelven a mezclar.
- `wordsUsed` en `GameplayState` registra las usadas en la ronda actual (para referencia, no bloquea).

> **Nota:** `anime.json`, `cartoons.json` y `drinks.json` existen en `/data/words/` pero **NO están importados** en `useWords.ts` actualmente.

---

## 10. Préstamo de jugadores (`PlayerLoan`)

- Disponible en la pantalla de preparación (PreRound), antes de cada partido.
- Solo se pueden prestar jugadores de equipos **que NO participan** en el partido actual.
- El equipo origen debe tener ≥2 jugadores.
- Tipos:
  - **Temporal**: se revierte con `revertTemporaryLoans(matchId)` al finalizar el partido.
  - **Permanente**: el jugador queda en el equipo destino para siempre.
- Cuando el jugador se presta, se mueve físicamente en `teams[]`.

---

## 11. Persistencia

- Clave en localStorage: `password-game-state`
- Se guarda **solo el estado de datos** (no las funciones del store).
- Auto-guardado debounced cada 500 ms al cambiar cualquier parte del estado.
- En `HomePage`: si existe estado guardado, aparece botón "Continuar partida anterior".
- `resetGame()` + `clearSavedState()` limpia todo para nuevo juego.
- El tema (`dark`/`light`) se guarda separado en `password-theme`.

---

## 12. Validaciones globales

| Regla | Dónde se aplica | Constante/función |
|-------|----------------|-------------------|
| Mínimo 4 jugadores para generar equipos | `PlayerInput` | `hasMinPlayers(n)` |
| Número par de jugadores | `PlayerInput` | `isEvenCount(n)` |
| Nombre de jugador ≥1 char | `PlayerInput` | `isValidPlayerName(name)` |
| Sin nombres duplicados | `PlayerInput` (UI) | Comparación case-insensitive |
| Max playoff size depende de nº de equipos | `LeagueOptions` | `getMaxPlayoffSize(n)` |
| Penalización no puede superar los aciertos | `RoundResult` | `Math.min(roundScore, penalty)` |
| Score final mínimo 0 | `finishRound` | `Math.max(0, score - penalties)` |
| Byes se auto-resuelven con `winnerId = team1Id` | `BracketPage` | lógica inline |

---

## 13. Hooks

| Hook | Qué hace |
|------|----------|
| `useTimer(duration, onTick, onFinish)` | Timer regresivo; callback por segundo y callback al llegar a 0 |
| `useCountdown(from, onEnd)` | Cuenta regresiva (5→0) para la pantalla PreRound |
| `useDice()` | Expone `rollAll(teams)` que genera `DiceResult[]` |
| `useWords()` | Pool mezclado de palabras; `getNextWord()`, `reset()` |
| `useSoundFx()` | `playCorrect`, `playSkip`, `playWarning`, `playBuzzer` vía Web Audio API |

---

## 14. Estructura de archivos clave

```
src/
├── App.tsx              ← Router de fases
├── store/
│   ├── gameStore.ts     ← Crea el store + auto-save + hydrate
│   ├── persistence.ts   ← localStorage helpers
│   ├── types.ts         ← Interfaces de los slices
│   └── slices/
│       ├── playerSlice.ts
│       ├── teamSlice.ts
│       ├── matchSlice.ts
│       ├── bracketSlice.ts
│       ├── leagueSlice.ts
│       └── uiSlice.ts
├── types/index.ts       ← Tipos del dominio (Player, Team, Match, etc.)
├── lib/
│   ├── bracketUtils.ts  ← generateBracket, advanceWinnerInBracket, getRoundName
│   ├── leagueUtils.ts   ← generateRoundRobin, calculateStandings
│   ├── repechageUtils.ts← rollDice, selectRepechageTeams, createRepechageMatches
│   ├── validators.ts    ← canGenerateTeams, isValidPlayerName, getMaxPlayoffSize
│   ├── shuffle.ts       ← Fisher-Yates shuffle
│   └── utils.ts         ← generateId
├── hooks/
│   ├── useTimer.ts
│   ├── useCountdown.ts
│   ├── useDice.ts
│   ├── useWords.ts
│   └── useSoundFx.ts
├── pages/               ← Una página por fase principal
├── components/
│   ├── gameplay/        ← PreRound, GameRound, RoundResult, FFAScoreTable
│   ├── bracket/         ← BracketView, BracketMatch, RepechageView
│   ├── league/          ← LeagueTable, LeagueOptions
│   ├── teams/           ← TeamGrid (drag&drop), TeamCard, PlayerChip
│   ├── players/         ← PlayerInput
│   ├── loan/            ← PlayerLoan
│   ├── mode/            ← ModeSelector (timer config + modos)
│   ├── final/           ← Champion, MatchHistory
│   └── layout/          ← Header, Layout, PageTransition
└── data/words/          ← JSON con categorías de palabras
```

---

## 15. Puntos de extensión (para futuras funciones)

- **Nuevas categorías de palabras**: agregar JSON en `data/words/` e importar en `useWords.ts`.
- **Nuevo modo de juego**: agregar valor a `GameMode` union, nueva lógica en `ModeSelector`, nueva fase o reutilizar `BracketPage`/`LeaguePage`.
- **Más configuraciones de timer**: agregar `<option>` en `ModeSelector`.
- **Más rondas por equipo**: cambiar la constante `ROUNDS_PER_TEAM = 2` en `GameplayPage` y `BracketPage`.
- **Sistema de estadísticas históricas**: extender `persistence.ts` con un array acumulativo separado.
- **Nuevo tipo de préstamo**: agregar variante a `LoanRecord.type` y lógica en `revertTemporaryLoans`.
- **Categorías desactivadas por defecto** (`anime.json`, `cartoons.json`, `drinks.json`): importar en `useWords.ts` y agregarlas a `ALL_CATEGORIES`.
- **Partidos a más de 2 rondas**: ajustar `ROUNDS_PER_TEAM` y la lógica de interleaving en `completeMatch`.
