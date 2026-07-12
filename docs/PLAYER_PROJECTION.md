# Player Baseline Projection

Derived from the tuned 50-year sim (seed 42, archetype major). The player runs
on the headless auto-pilot, producing a mix across genres with default marketing
(13% domestic / 7% foreign). Figures are modal outcomes, not guarantees — any
single shock year (pandemic year 45, strike year 49) can swing results heavily.

## Industry vitality (RivalSpawner + Antitrust)

The competitive field is no longer a one-way street to oligopoly. A `RivalSpawner`
keeps ~10 active rivals (floor of 7) for the full 50 years, replenishing both
through M&A and hard bankruptcies:

- **Indie emergence** in busts/low-heat cycles: $50M–$200M cash, prestige-led
  ("Lantern Pictures", "Foxglove Productions"). Historical parallel: A24, Neon.
- **Disruptor emergence** in booms and post-2033 AI era: $500M–$2B cash,
  volume-oriented ("Helix Digital", "Vanta Networks", "Nexus AI Studios").
  Parallel: Netflix/Amazon MGM/Apple TV+.
- **Hard bankruptcies** (cash < -$300M, strength < 25) remove rivals from the
  active roster — but only if count is above the 7-rival floor.

`Antitrust` monitors industry concentration (top-3 cash share, top-1 share):

- Thresholds: top-1 > 40% or top-3 > 70% → intervention pool opens.
- ~5-year cooldown + stochastic firing means ~2-4 events over a 50-year run.
- **Divestiture** (top-1 > 40%): dominant studio loses ~8% of cash, which
  respawns as a new indie (mirrors Paramount Decrees 1948, FTC/Microsoft-Activision).
- **M&A freeze + fine** (top-3 > 70%): dominant studio barred from acquisitions
  for 2 years; `ConsolidationEngine` refuses their bids during the window.

**Player consequences:**

- A player who grows past ~35% market share triggers forced divestiture — they
  lose cash AND spawn a competitor. Scaling aggression has a ceiling.
- A mid-tier player may _benefit_ when antitrust hits a dominant rival, slowing
  their M&A and spinning off assets the player could later target.
- New indie/disruptor waves mean the player never reaches a "late game" where
  competition thins out — there is always a fresh entrant chasing the same deals.

## Key dynamics affecting the player

- **Budget inflation**: production budgets compound ~3.5%/year. A mid-tier
  ($40M in year 1) becomes ~$57M by year 10, ~$131M by year 30, ~$225M by year 50.
- **Market heat cycle**: 8.5-year boom/bust ± 3.7-year noise. Revenue multiplier
  swings 0.6–1.4. Scheduled shocks: 2008 crisis (y34), pandemic (y45–47), strikes
  (y49–50), AI production boom (y58–60), platform consolidation (y66–68).
- **Tier-dependent flop floor**: blockbuster floor 0.15×, high 0.22×, mid 0.35×,
  low 0.50×. A $200M blockbuster flop can write off $150M+ in one cycle.
- **Industry success rate ~42%** — 58% of releases lose money on theatrical
  alone; franchise halo or ancillaries are what push lifetime ROI positive.

## Balanced persona — modal outcome

| Year | Cash Position    | Releases | Franchises | Notes                                                                                                                                                                                                                                                                                    |
| ---: | ---------------- | -------: | ---------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    1 | -$50M to +$100M  |      0–2 |          0 | Start $500M; first pitches mostly mid/high tier, first release lands ~week 30–40.                                                                                                                                                                                                        |
|    5 | +$100M to +$400M |     8–12 |        0–1 | Break-even period. One breakout can spawn a franchise; one flop resets progress.                                                                                                                                                                                                         |
|   10 | +$300M to +$900M |    20–25 |        1–2 | Establishes tier. Macro dip (year 8–9) may compress cash.                                                                                                                                                                                                                                |
|   25 | +$1B to +$2.5B   |    55–70 |        3–5 | Survives the 2008-analogue dip (y18). Franchises start showing fatigue decay after entry 4–5.                                                                                                                                                                                            |
|   50 | +$1.5B to +$4B   |  100–115 |        5–8 | Survives COVID + strike shocks. By y50 at least one legacy franchise has decayed past relevance; top 2–3 rivals hold ~60% of remaining cash but the field is still ~10 rivals deep thanks to indie/disruptor spawning, and 2–4 antitrust interventions have trimmed any runaway leaders. |

## Aggressive persona (predatory bidding, always pitch)

- Year 5: wider outcome band, -$200M to +$600M. One bad opener can force a loan.
- Year 10: +$500M to +$1.5B if survives the y8 bust; ~30% of runs end in bankruptcy-adjacent state.
- Year 25: either top-3 studio or acquired. Bimodal.
- Year 50: top-1 or dead. Aggressive wins the boom decades (y15–20, y58–60) and loses the busts.

## Prestige / frugal persona (low–mid budget only, indies)

- Year 5: +$200M to +$500M. Low burn + 0.50× indie floor = rarely loses big.
- Year 10: +$500M to +$1B. Rare breakout franchise hits happen around a prestige project (~15% of runs).
- Year 25: +$1.5B to +$3B, but low market share (<10%). Awards count high.
- Year 50: stable +$2B to +$5B range, but rarely dominant — the inflation curve slowly squeezes indie margins, and the ancillary-revenue collapse (years 22–40) hits indies harder because they lack streaming deals.

## What the player should expect each cycle

- **Boom years** (heat > 1.15): 4–6 active releases, franchise creation likely, M&A pricey.
- **Bust years** (heat < 0.85): 1–2 releases, consolidation wave, distressed-asset M&A bargains.
- **Shock years**: revenue cliff (pandemic ≈ 0.35× for 2 yrs). Survival test — indies most exposed on theatrical, majors on overhead. AI boom (y58–60) is a rare uplift.

## Distress from the player POV

Insolvent rivals no longer linger in a dignified-red coma. `DistressCascade`
walks any studio whose cash goes negative through a four-stage collapse, one
visible stage per rival every ~6 months:

1. **IP FIRE SALE** (cash < $0, negative 26w+): seller offloads a crown-jewel
   franchise or catalog to a rival with >$500M cash at ~0.35× value. Expect 3–8
   over 50 years — these are the bargain windows. If you've got dry powder when
   a major's cash hits -$50M, watch the news for catalog going up.
2. **ASSET LIQUIDATION** (cash < -$75M): the rival picks one real-studio distress
   move — backlot sale (-10 prestige, +$50–200M), shelving an in-production project
   for a 40% sunk-cost write-off (-5 prestige, $20M+), selling back-catalog library
   rights to a rival for a $100–500M lump sum (those titles' ongoing revenue flips
   to the buyer), selling a backend/participation stake on future franchise revenue
   for $50–300M (studio keeps ownership, financier takes a cut of upside),
   overhead/executive layoffs (-5 prestige, $20–80M), or — for platform-owners —
   divesting the platform itself ($500M–$2B one-shot). Talent are free-agent and
   contracted per project, so there is no payroll to shed. Expect 5–10 events.
3. **DISTRESSED M&A** (cash < -$200M after stage-2 budget spent): target shops
   itself to the richest non-antitrust-frozen acquirer at 0.3–0.5× book. This
   flows through the same `ConsolidationEngine` path as regular M&A, so
   antitrust warnings still apply to the buyer. Expect 1–3 extra M&A in bust
   decades.
4. **BANKRUPTCY** (cash < -$400M and no buyer found, plus spawner floor ≥8
   rivals): hard removal. Remaining IP in the vault reverts to `MARKET` so
   indies can claim it on reuse. Expect 1–3 true liquidations per 50 years.

For the player: bust decades (2005–2014 in seed 42) are buying season —
franchise packages and backlots trade at fire-sale. Boom decades see fewer
stage-1s because heat props up revenue. If you're holding the lone major with
cash > $750M during a bust, you'll be the default stage-3 acquirer — budget
accordingly, and watch the antitrust freeze timer.

## Unrealistic / known limits

- Player auto-pilot in the headless sim does not currently tap the ancillary /
  streaming revenue curve modeled in `getAncillaryMultiplier` — only the macro
  heat on theatrical is wired. Manual play gets more lanes.
- Talent-release in stage 2 recovers cash but does not actually mutate
  `state.entities.contracts` — contracts keep billing in parallel. Cosmetic for
  now; book it as a liquidity injection, not a headcount cut.
- Player market share in headless runs is effectively 0% because the studio-
  state cash path differs from the rival path; this is a reporting artifact,
  not a gameplay one.
