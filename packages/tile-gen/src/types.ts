export interface CriterionConfig {
  threshold: number
  enabled: boolean
  guidance?: string
}

export interface ProfileCriteria {
  palette: CriterionConfig
  structural_correctness: CriterionConfig
  scale_fidelity: CriterionConfig
  layer_ordering: CriterionConfig
  seamless_tiling: CriterionConfig
  style_consistency: CriterionConfig
  aesthetics: CriterionConfig
  prompt_fidelity: CriterionConfig
}

export interface Profile {
  name: string
  description: string
  defaults: {
    iterations: number
    viewBox: string
    tileSize: number
  }
  criteria: ProfileCriteria
  palette: Record<string, string>
  styleGuide: string
  referenceSvgs: Array<{ name: string; content: string }>
}

export interface CriterionScore {
  score: number
  feedback: string
}

export interface BlindJudgeResult {
  quality: number
  identifiedAs: string
  impression: string
}

export interface EvaluationScores {
  palette: CriterionScore
  structural_correctness: CriterionScore
  scale_fidelity: CriterionScore
  layer_ordering: CriterionScore
  seamless_tiling: CriterionScore
  style_consistency: CriterionScore
  aesthetics: CriterionScore
  prompt_fidelity: CriterionScore
  blindJudges: BlindJudgeResult[]
  overall: {
    pass: boolean
    feedback: string
  }
}

export interface IterationRecord {
  iteration: number
  svgPath: string
  pngPath: string
  scores: EvaluationScores | null
}

export interface RunReport {
  runId: string
  profile: string
  prompt: string
  iterations: IterationRecord[]
  bestIteration: number
  finalScores: EvaluationScores | null
  createdAt: string
}
