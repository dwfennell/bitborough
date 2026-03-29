# Tile Generation Package Design

## Overview

A generator-evaluator harness for creating SVG game tiles, inspired by [Anthropic's harness design for long-running apps](https://www.anthropic.com/engineering/harness-design-long-running-apps). The core insight: separate generation from evaluation to overcome self-evaluation bias, and quantify subjective quality through structured rubrics and blind judging.

## Architecture

Three layers, each with a clear job:

| Layer | What | Job |
|---|---|---|
| **Skill** (`tile-author`) | Human-facing entry point | Invoked in conversation, spawns the agent |
| **Agent** (`.claude/agents/tile-gen.md`) | Autonomous loop driver | Runs the generation-evaluation loop without intervention |
| **CLI** (`tile-gen`) | Prompt assembler + staging tool | Assembles prompts from profiles, manages staging, promotes tiles |

The CLI does **not** call the Claude API. It assembles prompt text that the agent follows. Intelligence stays in Claude Code; the CLI handles context assembly and artifact management.

## Package Structure

```
packages/tile-gen/
├── src/
│   ├── cli.ts                 # CLI entry point
│   ├── commands/
│   │   ├── prompt.ts          # Assemble generation prompt from profile
│   │   ├── evaluate.ts        # Assemble evaluation prompt; rasterize SVG
│   │   ├── list.ts            # List tiles in staging
│   │   ├── show.ts            # Display scores + evaluator notes for a tile
│   │   ├── promote.ts         # Copy passing tile to game assets
│   │   ├── profiles.ts        # List available style profiles
│   │   └── profile-create.ts  # Scaffold a new style profile
│   ├── rasterize.ts           # SVG → PNG via resvg
│   └── staging.ts             # Staging directory read/write
├── profiles/
│   └── default/
│       ├── profile.yaml       # Palette, criteria config, thresholds
│       ├── style-guide.md     # Prose style guide (derived from current tile-style.md)
│       └── references/        # Reference SVGs for evaluator comparison
├── output/                    # Staging area (gitignored)
│   └── <profile>/<run-id>/
│       ├── tile.svg           # Best-scoring result
│       ├── iterations/        # Each iteration's SVG + feedback
│       │   ├── 1.svg
│       │   ├── 1-scores.json
│       │   ├── 2.svg
│       │   └── 2-scores.json
│       └── report.json        # Final scores, iteration history, blind judge notes
├── package.json
└── tsconfig.json
```

## CLI Commands

```
tile-gen prompt <description> [--profile default] [--iterations 5]
    Outputs structured generation prompt text incorporating the style profile,
    palette, structural rules, reference SVGs, and evaluation criteria.

tile-gen evaluate <svg-path> [--profile default] [--prompt <original-prompt>] [--blind-scores <json>]
    Rasterizes the SVG to PNG via resvg. Outputs evaluation prompt text
    incorporating the SVG source, rendered PNG, profile rubric, and
    (if provided) blind judge scores. Used by the informed evaluator.

tile-gen blind-judge <png-path>
    Outputs a blind judge prompt: only the PNG, no profile or prompt context.
    Returns a template for raw aesthetic + interpretability scoring.

tile-gen list
    List all tiles in the staging directory with their status and top-line scores.

tile-gen show <tile-id>
    Display full scores, evaluator feedback, and iteration history for a staged tile.

tile-gen promote <tile-id> [--to <subdirectory>]
    Copy a passing tile from staging into packages/game/assets/tiles/<subdirectory>.

tile-gen profiles
    List available style profiles.

tile-gen profile create <name>
    Scaffold a new style profile directory with template profile.yaml,
    empty style-guide.md, and references/ directory.
```

## Evaluation Criteria

Each tile is scored on 8 dimensions, on a 1-10 scale with configurable pass thresholds.

| # | Criterion | Input | Nature |
|---|---|---|---|
| 1 | **Palette compliance** | SVG source | Deterministic — extract hex values, compare against profile palette |
| 2 | **Structural correctness** | SVG source | Deterministic — viewBox, xmlns, `<defs>`, self-contained |
| 3 | **Scale fidelity** | SVG source | Semi-deterministic — element dimensions vs. world-scale rules |
| 4 | **Layer ordering** | SVG source | Semi-deterministic — SVG element order vs. profile layering spec |
| 5 | **Seamless tiling** | SVG source | Semi-deterministic — no prominent features within edge buffer |
| 6 | **Style consistency** | SVG + PNG + references | Subjective — stroke widths, opacity, texture density vs. references |
| 7 | **Aesthetics** | PNG | Subjective — visual appeal, compositional balance, color harmony |
| 8 | **Prompt fidelity** | PNG + original prompt | Subjective — does the tile depict what was requested? |

Criteria 1-2 are automatable checks. Criteria 3-5 are structural but require judgment. Criteria 6-8 are the subjective dimensions that justify the separate evaluator.

### Profile-Level Criteria Configuration

Profiles can override thresholds, disable criteria, or provide custom guidance:

```yaml
# profiles/cyberpunk/profile.yaml
name: cyberpunk
criteria:
  palette:
    threshold: 6
    palette:
      - "#0a0a2e"
      - "#ff00ff"
      # ...
  style_consistency:
    threshold: 5       # lenient — few references exist yet
  seamless_tiling:
    enabled: false     # standalone showcase tiles
  aesthetics:
    threshold: 7
    guidance: |
      Neon-soaked, high contrast. Glowing edges, dark backgrounds.
      Penalize: organic/natural feel, soft colors, painterly texture.
```

## Judge Architecture

### Three Roles

| Role | Context Given | Job |
|---|---|---|
| **Blind judge(s)** | PNG only | Raw aesthetic impressions + interpretability scores |
| **Informed evaluator** | SVG + PNG + profile + prompt + blind scores | Final scores on all 8 criteria, actionable revision feedback |
| **Generator** | Profile + prompt + evaluator feedback | Write or revise SVG |

### Blind Judges

Blind judges receive **only the rendered PNG** — no profile, no prompt, no SVG source. They score:

- General visual quality / appeal
- Whether they can identify what the tile depicts (unprompted)
- Overall impression

Multiple blind judges can run in parallel. Their agreement/disagreement patterns are surfaced to the informed evaluator: "2 of 3 blind judges couldn't identify this as a fire station" is a stronger signal than one judge's opinion.

### Informed Evaluator

The informed evaluator runs **after** the blind judges. It receives:

- The SVG source (for structural criteria 1-5)
- The rendered PNG (for visual criteria 6-8)
- The full style profile and reference tiles
- The original prompt
- The blind judges' scores and comments

The informed evaluator can contextualize blind feedback. A blind judge saying "the colors feel off" when the palette is intentionally muted for a desaturated profile — the informed evaluator can weigh that appropriately. But a blind judge saying "I can't tell what this building is" is hard to dismiss regardless of context.

The informed evaluator produces:
- Final scores for all 8 criteria (JSON)
- Actionable feedback for the generator if revision is needed
- An overall pass/fail determination

## Harness Loop

```
1.  CLI assembles generation prompt from profile
        tile-gen prompt "fire station, small" --profile default --iterations 5

2.  Generator agent produces SVG, saves to staging

3.  CLI rasterizes SVG → PNG
        tile-gen evaluate <svg-path> --profile default --prompt "fire station, small"

4.  Blind judge(s) score the PNG (parallel if multiple)

5.  Informed evaluator receives SVG + PNG + profile + blind scores
        → produces final scores + feedback

6.  If all criteria >= threshold → done, write final report to staging

7.  Else → generator receives feedback + previous SVG, revises
        → back to step 3

8.  After max iterations → stage the best-scoring iteration
```

## Agent Definition

`.claude/agents/tile-gen.md` encodes the loop above. It:

- Uses `tile-gen prompt` to get generation instructions
- Generates SVG following those instructions
- Uses `tile-gen evaluate` to get evaluation prompts
- Spawns blind judges (subagents with PNG-only context)
- Runs informed evaluation with blind scores as input
- Iterates or completes based on scores
- Writes all artifacts to staging

## Skill Entry Point

The `tile-author` skill is updated to be the human-facing interface. When invoked, it spawns the tile-gen agent with the user's request. The skill handles the conversational layer (confirming the prompt, selecting a profile) before handing off to the autonomous loop.

## Output & Promotion

### Staging

Generated tiles land in `packages/tile-gen/output/<profile>/<run-id>/`:

```
output/default/2026-03-28-fire-station/
├── tile.svg                # Best-scoring SVG
├── tile.png                # Rasterized version
├── iterations/
│   ├── 1.svg
│   ├── 1.png
│   ├── 1-scores.json       # { palette: 8, structure: 10, ... , blind: [...] }
│   ├── 2.svg
│   ├── 2.png
│   └── 2-scores.json
└── report.json             # Final scores, full iteration history, judge notes
```

### Promotion

`tile-gen promote <tile-id>` copies the best SVG into `packages/game/assets/tiles/` in the appropriate subdirectory (buildings, terrain, etc.). This is the human gate — no generated tile enters the game without an explicit promote step.

## Style Profiles

### Default Profile

The existing `tile-style.md` (331 lines) becomes the default profile's style guide. The 60+ named color tokens become the palette in `profile.yaml`. The 80 existing SVG tiles (or a curated subset) populate `references/`.

### Creating New Profiles

`tile-gen profile create <name>` scaffolds:

```
profiles/<name>/
├── profile.yaml       # Template with all criteria, empty palette
├── style-guide.md     # Empty, to be filled with style description
└── references/        # Empty, to be populated with reference tiles
```

New profiles start with lenient thresholds. As reference tiles are generated and curated, thresholds can be tightened.

## Dependencies

- `@resvg/resvg-js` — SVG → PNG rasterization (already used in the project)
- `commander` or `yargs` — CLI argument parsing
- `yaml` — profile.yaml parsing
- `glob` — file discovery in staging/profiles

No Anthropic SDK dependency. No external service dependency.
