export type MusicMode = 'none' | 'title' | 'overworld' | 'combat' | 'victory';

interface StepNote {
  /** MIDI note number (omit/null = rest) */
  lead?: number | null;
  /** Duration in 16th-note steps */
  leadDur?: number;
  /** Bass MIDI note */
  bass?: number | null;
  /** Chord root/fifth pad stab MIDI notes */
  chord?: number[];
  /** Percussion flags */
  kick?: boolean;
  snare?: boolean;
  snareSoft?: boolean;
}

function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// 32-step (2-bar x 16th notes) original heroic Vietnamese revolutionary march patterns
// 1. Title / Solemn Patriotic March (D Major pentatonic-march, proud & noble)
const TITLE_PATTERN: readonly StepNote[] = [
  { lead: 62, leadDur: 3, bass: 50, kick: true }, // D4
  {},
  {},
  { lead: 66, leadDur: 1, snareSoft: true }, // F#4
  { lead: 69, leadDur: 4, bass: 45, chord: [62, 66, 69], snare: true }, // A4
  {},
  {},
  {},
  { lead: 74, leadDur: 3, bass: 50, kick: true }, // D5
  {},
  {},
  { lead: 71, leadDur: 1, snareSoft: true }, // B4
  { lead: 69, leadDur: 4, bass: 45, chord: [62, 66, 69], snare: true }, // A4
  {},
  {},
  { snareSoft: true },

  { lead: 71, leadDur: 3, bass: 43, kick: true }, // B4 (G major)
  {},
  {},
  { lead: 74, leadDur: 1, snareSoft: true }, // D5
  { lead: 76, leadDur: 4, bass: 45, chord: [64, 69, 73], snare: true }, // E5 (A major)
  {},
  {},
  {},
  { lead: 74, leadDur: 2, bass: 50, kick: true }, // D5
  {},
  { lead: 71, leadDur: 2, snareSoft: true }, // B4
  {},
  { lead: 69, leadDur: 4, bass: 45, chord: [62, 66, 69], snare: true }, // A4
  {},
  {},
  {}
];

// 2. Overworld / Marching Column (Hành Quân — D Major upbeat 2/4 march, 64 steps = 4 bars)
const OVERWORLD_PATTERN: readonly StepNote[] = [
  // Bar 1: D -> A
  { lead: 62, leadDur: 2, bass: 50, kick: true },
  {},
  { lead: 62, leadDur: 1, snareSoft: true },
  { lead: 66, leadDur: 1 },
  { lead: 69, leadDur: 3, bass: 45, chord: [62, 66], snare: true },
  {},
  {},
  { lead: 66, leadDur: 1, snareSoft: true },
  { lead: 69, leadDur: 2, bass: 50, kick: true },
  {},
  { lead: 71, leadDur: 2, snareSoft: true },
  {},
  { lead: 74, leadDur: 4, bass: 45, chord: [62, 66, 69], snare: true },
  {},
  {},
  { snareSoft: true },

  // Bar 2: G -> A -> D
  { lead: 76, leadDur: 2, bass: 43, kick: true },
  {},
  { lead: 74, leadDur: 2, snareSoft: true },
  {},
  { lead: 71, leadDur: 2, bass: 43, chord: [62, 67, 71], snare: true },
  {},
  { lead: 69, leadDur: 2, snareSoft: true },
  {},
  { lead: 66, leadDur: 2, bass: 45, kick: true },
  {},
  { lead: 69, leadDur: 2, snareSoft: true },
  {},
  { lead: 69, leadDur: 4, bass: 45, chord: [64, 69], snare: true },
  {},
  {},
  { snareSoft: true },

  // Bar 3: Heroic rising leap (Vượt Trường Sơn motif)
  { lead: 74, leadDur: 3, bass: 50, kick: true },
  {},
  {},
  { lead: 74, leadDur: 1, snareSoft: true },
  { lead: 76, leadDur: 2, bass: 45, chord: [62, 66, 69], snare: true },
  {},
  { lead: 74, leadDur: 2, snareSoft: true },
  {},
  { lead: 71, leadDur: 3, bass: 47, kick: true },
  {},
  {},
  { lead: 69, leadDur: 1, snareSoft: true },
  { lead: 66, leadDur: 4, bass: 45, chord: [62, 66], snare: true },
  {},
  {},
  { snareSoft: true },

  // Bar 4: Cadence resolve to D
  { lead: 67, leadDur: 2, bass: 43, kick: true },
  {},
  { lead: 69, leadDur: 2, snareSoft: true },
  {},
  { lead: 71, leadDur: 2, bass: 45, chord: [64, 69, 73], snare: true },
  {},
  { lead: 73, leadDur: 2, snareSoft: true },
  {},
  { lead: 74, leadDur: 6, bass: 50, chord: [62, 66, 69], kick: true },
  {},
  { snareSoft: true },
  { snareSoft: true },
  { bass: 45, snare: true },
  {},
  { snareSoft: true },
  {}
];

// 3. Combat / Xung Phong Quyết Chiến (D Minor urgent driving battle march, 32 steps)
const COMBAT_PATTERN: readonly StepNote[] = [
  { lead: 62, leadDur: 2, bass: 50, kick: true }, // D4
  {},
  { lead: 65, leadDur: 1, snareSoft: true }, // F4
  { lead: 69, leadDur: 1 }, // A4
  { lead: 74, leadDur: 2, bass: 50, chord: [62, 65, 69], snare: true }, // D5
  {},
  { lead: 72, leadDur: 2, kick: true }, // C5
  {},
  { lead: 70, leadDur: 2, bass: 46, kick: true }, // Bb4
  {},
  { lead: 69, leadDur: 2, snareSoft: true }, // A4
  {},
  { lead: 67, leadDur: 3, bass: 43, chord: [62, 67, 70], snare: true }, // G4
  {},
  { snareSoft: true },
  { lead: 69, leadDur: 1, snareSoft: true }, // A4

  { lead: 70, leadDur: 2, bass: 46, kick: true }, // Bb4
  {},
  { lead: 72, leadDur: 2, snareSoft: true }, // C5
  {},
  { lead: 74, leadDur: 2, bass: 48, chord: [64, 67, 72], snare: true }, // D5
  {},
  { lead: 76, leadDur: 2, kick: true }, // E5
  {},
  { lead: 77, leadDur: 2, bass: 45, kick: true }, // F5
  {},
  { lead: 76, leadDur: 2, snareSoft: true }, // E5
  {},
  { lead: 73, leadDur: 3, bass: 45, chord: [64, 69, 73], snare: true }, // C#5 (A7 tension -> D minor)
  {},
  { snareSoft: true },
  { lead: 69, leadDur: 1, snare: true }
];

// 4. Victory / Khúc Khải Hoàn 30/4 (Soaring F Major triumph fanfare march, 32 steps)
const VICTORY_PATTERN: readonly StepNote[] = [
  { lead: 65, leadDur: 2, bass: 53, kick: true }, // F4
  {},
  { lead: 69, leadDur: 1, snareSoft: true }, // A4
  { lead: 72, leadDur: 1 }, // C5
  { lead: 77, leadDur: 4, bass: 48, chord: [65, 69, 72], snare: true }, // F5
  {},
  {},
  { lead: 74, leadDur: 1, snareSoft: true }, // D5
  { lead: 72, leadDur: 2, bass: 53, kick: true }, // C5
  {},
  { lead: 74, leadDur: 2, snareSoft: true }, // D5
  {},
  { lead: 77, leadDur: 4, bass: 48, chord: [65, 69, 72], snare: true }, // F5
  {},
  {},
  { snareSoft: true },

  { lead: 79, leadDur: 3, bass: 46, kick: true }, // G5 (Bb major)
  {},
  {},
  { lead: 77, leadDur: 1, snareSoft: true }, // F5
  { lead: 74, leadDur: 2, bass: 46, chord: [65, 70, 74], snare: true }, // D5
  {},
  { lead: 72, leadDur: 2, snareSoft: true }, // C5
  {},
  { lead: 74, leadDur: 2, bass: 48, kick: true }, // D5 (C7)
  {},
  { lead: 76, leadDur: 2, snareSoft: true }, // E5
  {},
  { lead: 77, leadDur: 4, bass: 53, chord: [65, 69, 72], snare: true }, // F5
  {},
  {},
  {}
];

const MODE_CONFIG: Record<
  Exclude<MusicMode, 'none'>,
  { bpm: number; pattern: readonly StepNote[]; gain: number }
> = {
  title: { bpm: 96, pattern: TITLE_PATTERN, gain: 0.2 },
  overworld: { bpm: 112, pattern: OVERWORLD_PATTERN, gain: 0.2 },
  combat: { bpm: 132, pattern: COMBAT_PATTERN, gain: 0.22 },
  victory: { bpm: 116, pattern: VICTORY_PATTERN, gain: 0.23 }
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicBus: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private musicMode: MusicMode = 'none';
  private schedulerId: number | null = null;
  private stepIndex = 0;
  private nextNoteTime = 0;

  muted = false;

  unlock(): void {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupMusicGraph();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    this.ensureScheduler();
  }

  private setupMusicGraph(): void {
    if (!this.ctx) return;
    this.musicFilter = this.ctx.createBiquadFilter();
    this.musicFilter.type = 'lowpass';
    this.musicFilter.frequency.value = 2350;
    this.musicFilter.Q.value = 0.7;

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.muted ? 0 : this.getTargetMusicGain();

    this.musicFilter.connect(this.musicBus);
    this.musicBus.connect(this.ctx.destination);

    // Pre-generate crisp white noise buffer for marching snare drum
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * 0.25);
    this.noiseBuffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  private getTargetMusicGain(): number {
    if (this.musicMode === 'none') return 0;
    return MODE_CONFIG[this.musicMode].gain;
  }

  setMusicMode(mode: MusicMode): void {
    if (this.musicMode === mode) return;
    this.musicMode = mode;
    this.stepIndex = 0;
    if (this.ctx) {
      this.nextNoteTime = this.ctx.currentTime + 0.06;
      this.applyMusicGain();
      this.ensureScheduler();
    }
  }

  private applyMusicGain(): void {
    if (!this.ctx || !this.musicBus) return;
    const target = this.muted ? 0 : this.getTargetMusicGain();
    this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicBus.gain.setTargetAtTime(target, this.ctx.currentTime, 0.04);
  }

  private ensureScheduler(): void {
    if (this.schedulerId !== null) return;
    if (!this.ctx) return;
    this.nextNoteTime = this.ctx.currentTime + 0.06;
    this.schedulerId = window.setInterval(() => this.scheduleAhead(), 75);
  }

  private scheduleAhead(): void {
    if (!this.ctx || this.ctx.state !== 'running' || this.musicMode === 'none') return;
    const cfg = MODE_CONFIG[this.musicMode];
    const stepDur = 60 / cfg.bpm / 4; // 16th-note duration

    // Catch up cleanly if tab was backgrounded
    if (this.nextNoteTime < this.ctx.currentTime - 0.3) {
      this.nextNoteTime = this.ctx.currentTime + 0.05;
    }

    const lookAhead = 0.22;
    while (this.nextNoteTime < this.ctx.currentTime + lookAhead) {
      const note = cfg.pattern[this.stepIndex % cfg.pattern.length];
      this.scheduleStep(note, this.nextNoteTime, stepDur);
      this.nextNoteTime += stepDur;
      this.stepIndex = (this.stepIndex + 1) % cfg.pattern.length;
    }
  }

  private scheduleStep(step: StepNote, t: number, stepDur: number): void {
    if (!this.ctx || !this.musicFilter) return;

    if (step.lead !== undefined && step.lead !== null) {
      const dur = (step.leadDur ?? 2) * stepDur * 0.92;
      this.playBrassLead(midiToHz(step.lead), t, dur);
    }

    if (step.bass !== undefined && step.bass !== null) {
      this.playMarchBass(midiToHz(step.bass), t, stepDur * 3.2);
    }

    if (step.chord && step.chord.length > 0) {
      for (const m of step.chord) {
        this.playChordVoice(midiToHz(m), t, stepDur * 2.1);
      }
    }

    if (step.kick) {
      this.playKick(t);
    }
    if (step.snare) {
      this.playSnare(t, 0.22);
    } else if (step.snareSoft) {
      this.playSnare(t, 0.09);
    }
  }

  /** Warm heroic bugle/brass voice (sawtooth + triangle with gentle brass filter swell) */
  private playBrassLead(freq: number, t: number, dur: number): void {
    if (!this.ctx || !this.musicFilter) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filt = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 1.003, t); // Warm chorus detune

    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(650, t);
    filt.frequency.exponentialRampToValueAtTime(2200, t + 0.055);
    filt.frequency.exponentialRampToValueAtTime(1400, t + dur);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.19, t + 0.02);
    gain.gain.setValueAtTime(0.16, t + Math.max(0.03, dur - 0.04));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc1.connect(filt);
    osc2.connect(filt);
    filt.connect(gain);
    gain.connect(this.musicFilter);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + dur + 0.02);
    osc2.stop(t + dur + 0.02);
  }

  private playMarchBass(freq: number, t: number, dur: number): void {
    if (!this.ctx || !this.musicFilter) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(this.musicFilter);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private playChordVoice(freq: number, t: number, dur: number): void {
    if (!this.ctx || !this.musicFilter) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.065, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(this.musicFilter);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private playKick(t: number): void {
    if (!this.ctx || !this.musicFilter) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(128, t);
    osc.frequency.exponentialRampToValueAtTime(44, t + 0.12);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.36, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.musicFilter);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  private playSnare(t: number, vol: number): void {
    if (!this.ctx || !this.musicFilter || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'bandpass';
    hp.frequency.value = 1750;
    hp.Q.value = 0.9;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.095);

    src.connect(hp);
    hp.connect(gain);
    gain.connect(this.musicFilter);
    src.start(t);
    src.stop(t + 0.11);
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    this.applyMusicGain();
    return this.muted;
  }

  private tone(
    freq: number,
    durationSec: number,
    type: OscillatorType,
    gainVal: number,
    delaySec = 0,
    endFreq?: number
  ): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delaySec;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + durationSec);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  playMorse(closeness01: number): void {
    const c = Math.max(0, Math.min(1, closeness01));
    if (c > 0.68) {
      this.tone(920, 0.055, 'sine', 0.09, 0);
      this.tone(920, 0.055, 'sine', 0.09, 0.09);
      this.tone(920, 0.055, 'sine', 0.09, 0.18);
    } else if (c > 0.35) {
      this.tone(760, 0.06, 'sine', 0.075, 0);
      this.tone(760, 0.15, 'sine', 0.075, 0.11);
    } else {
      this.tone(620, 0.14, 'sine', 0.055, 0);
    }
  }

  playRadarPing(): void {
    this.tone(540, 0.22, 'sine', 0.06, 0, 880);
  }

  playShoot(): void {
    this.tone(540, 0.042, 'triangle', 0.022, 0, 310);
  }

  playHit(): void {
    this.tone(180, 0.16, 'sawtooth', 0.12, 0, 52);
  }

  playBombWarn(): void {
    this.tone(680, 0.14, 'sine', 0.055, 0, 420);
  }

  playBombExplosion(): void {
    this.tone(115, 0.38, 'sawtooth', 0.14, 0, 30);
    this.tone(75, 0.42, 'triangle', 0.12, 0.03, 26);
  }

  playEnemyDefeat(): void {
    this.tone(260, 0.2, 'sawtooth', 0.1, 0, 70);
    this.tone(520, 0.22, 'triangle', 0.09, 0.1, 780);
  }

  playAmbushAlarm(): void {
    this.tone(440, 0.11, 'square', 0.08, 0);
    this.tone(330, 0.14, 'square', 0.08, 0.13);
  }

  playPickup(): void {
    this.tone(660, 0.07, 'sine', 0.065, 0);
    this.tone(990, 0.12, 'sine', 0.07, 0.07);
  }

  playDopamineFanfare(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.tone(n, 0.26, 'triangle', 0.1, idx * 0.095);
    });
  }

  playGateCrash(): void {
    this.tone(130, 0.45, 'sawtooth', 0.17, 0, 34);
    this.tone(90, 0.55, 'square', 0.13, 0.06, 28);
    this.playDopamineFanfare();
  }
}
