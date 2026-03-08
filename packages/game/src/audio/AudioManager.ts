export class AudioManager {
  private ctx: AudioContext | null = null
  private enabled = true

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    return this.ctx
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  playPlace(): void {
    this.playTone(440, 0.05, 'square')
  }

  playBulldoze(): void {
    this.playTone(220, 0.08, 'sawtooth')
  }

  playZone(): void {
    this.playTone(330, 0.04, 'sine')
  }

  playError(): void {
    this.playTone(150, 0.1, 'square')
  }

  private playTone(freq: number, duration: number, type: OscillatorType): void {
    if (!this.enabled) return
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.value = 0.1
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  }
}
