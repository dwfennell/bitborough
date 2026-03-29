import type { Profile, BlindJudgeResult, CriterionConfig } from './types.js'

function formatPalette(palette: Record<string, string>): string {
  const lines = Object.entries(palette).map(
    ([token, hex]) => `  ${token}: ${hex}`,
  )
  return lines.join('\n')
}

function formatCriteria(
  criteria: Record<string, CriterionConfig>,
): string {
  const lines: string[] = []
  for (const [name, config] of Object.entries(criteria)) {
    if (!config.enabled) continue
    let line = `- **${name}**: threshold ${config.threshold}/10`
    if (config.guidance) {
      line += `\n  Guidance: ${config.guidance.trim()}`
    }
    lines.push(line)
  }
  return lines.join('\n')
}

function formatReferences(
  refs: Array<{ name: string; content: string }>,
): string {
  if (refs.length === 0) return 'No reference SVGs provided.'
  return refs
    .map(
      (ref) =>
        `### ${ref.name}\n\`\`\`svg\n${ref.content}\n\`\`\``,
    )
    .join('\n\n')
}

export function assembleGenerationPrompt(
  profile: Profile,
  description: string,
  iterations: number,
): string {
  return `# SVG Tile Generation

## Task

Generate an SVG tile depicting: **${description}**

You have up to **${iterations}** iterations to produce a tile that passes all evaluation criteria.

## Output Format

Write a complete, self-contained SVG file. The SVG must have:
- \`xmlns="http://www.w3.org/2000/svg"\`
- \`viewBox="${profile.defaults.viewBox}"\`
- All gradients defined in \`<defs>\`
- No external references

## Style Profile: ${profile.name}

${profile.description}

## Style Guide

${profile.styleGuide}

## Color Palette

Use ONLY these colors:

${formatPalette(profile.palette)}

## Evaluation Criteria

Your tile will be scored on these dimensions (1-10 scale). All must meet their threshold to pass:

${formatCriteria(profile.criteria as unknown as Record<string, CriterionConfig>)}

## Reference Tiles

Study these reference SVGs to match the style:

${formatReferences(profile.referenceSvgs)}

## Instructions

1. Generate the SVG tile for "${description}"
2. Save it as the current iteration's SVG file
3. The tile will be rasterized to PNG and evaluated by blind judges (who see only the image) and an informed evaluator (who sees everything)
4. If the evaluation fails, you will receive specific feedback and should revise
`
}

export function assembleBlindJudgePrompt(pngPath: string): string {
  return `# Blind Tile Evaluation

You are evaluating a game tile. You have NO context about what it's supposed to be or what style it should follow. Judge it purely on what you see.

## The Tile

Read the image at: ${pngPath}

## Instructions

Look at this tile image and answer:

1. **Visual quality** (1-10): How visually appealing is this tile? Consider color harmony, compositional balance, and overall polish.
2. **What do you identify this as?** Describe what you think this tile depicts, without any hints. Be specific.
3. **Overall impression**: In 1-2 sentences, describe your gut reaction to this tile.

## Response Format

Respond with JSON only:

\`\`\`json
{
  "quality": <1-10>,
  "identifiedAs": "<what you think this depicts>",
  "impression": "<1-2 sentence gut reaction>"
}
\`\`\`
`
}

export function assembleEvaluationPrompt(
  profile: Profile,
  svgPath: string,
  pngPath: string,
  originalPrompt: string,
  blindScores: BlindJudgeResult[],
): string {
  const blindSection =
    blindScores.length > 0
      ? `## Blind Judge Results

${blindScores.length} blind judge(s) evaluated this tile with NO context about the prompt or style guide:

${blindScores
  .map(
    (b, i) =>
      `### Judge ${i + 1}
- Quality: ${b.quality}/10
- Identified as: "${b.identifiedAs}"
- Impression: "${b.impression}"`,
  )
  .join('\n\n')}

Consider these blind impressions in your evaluation. A blind judge unable to identify what the tile depicts is a strong negative signal for prompt fidelity. A blind judge finding the colors "off" may or may not be valid depending on the profile's aesthetic goals.
`
      : `## Blind Judge Results

No blind judge scores provided for this iteration.
`

  return `# Informed Tile Evaluation

You are the informed evaluator. You have full context: the original prompt, style profile, reference tiles, and blind judge feedback. Score this tile rigorously.

## Original Prompt

"${originalPrompt}"

## Tile Under Review

- SVG source: Read the file at ${svgPath}
- Rendered PNG: Read the image at ${pngPath}

## Style Profile: ${profile.name}

${profile.description}

## Color Palette

${formatPalette(profile.palette)}

## Style Guide

${profile.styleGuide}

## Reference Tiles

${formatReferences(profile.referenceSvgs)}

${blindSection}

## Evaluation Criteria

Score each criterion on a 1-10 scale. A tile passes only when ALL enabled criteria meet their threshold.

${formatCriteria(profile.criteria as unknown as Record<string, CriterionConfig>)}

## Instructions

1. Read the SVG source file for structural analysis (palette compliance, structure, scale, layers, seamlessness)
2. View the rendered PNG for visual analysis (style consistency, aesthetics, prompt fidelity)
3. Consider the blind judge feedback in context
4. Score each criterion and provide specific, actionable feedback for any that fall below threshold

## Response Format

Respond with JSON only:

\`\`\`json
{
  "palette": { "score": <1-10>, "feedback": "<specific feedback>" },
  "structural_correctness": { "score": <1-10>, "feedback": "<specific feedback>" },
  "scale_fidelity": { "score": <1-10>, "feedback": "<specific feedback>" },
  "layer_ordering": { "score": <1-10>, "feedback": "<specific feedback>" },
  "seamless_tiling": { "score": <1-10>, "feedback": "<specific feedback>" },
  "style_consistency": { "score": <1-10>, "feedback": "<specific feedback>" },
  "aesthetics": { "score": <1-10>, "feedback": "<specific feedback>" },
  "prompt_fidelity": { "score": <1-10>, "feedback": "<specific feedback>" },
  "blindJudges": ${JSON.stringify(blindScores)},
  "overall": {
    "pass": <true|false>,
    "feedback": "<summary of what needs to change, or confirmation of passing quality>"
  }
}
\`\`\`
`
}
