/**
 * AniPac Dynamic Web Audio Synthesizer & SFX Engine
 * Evolves dynamically with game difficulty, state, and special moves.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.55;
  private sfxVolume: number = 0.7;
  private isMusicPlaying: boolean = false;
  private musicIntervalId: number | null = null;

  // Music state
  private step: number = 0;
  private tempo: number = 128; // BPM
  private currentLevel: number = 1;
  private isPowerMode: boolean = false;
  private isDomainMode: boolean = false;
  private isDangerMode: boolean = false; // 1 life left

  // Japanese anime scale notes (Hz)
  // Hirajoshi / Insen anime synth scale in A minor: A, B, C, E, F, A
  private readonly scaleA = [
    110, 123.47, 130.81, 164.81, 174.61, 220, // Low oct
    220, 246.94, 261.63, 329.63, 349.23, 440, // Mid oct
    440, 493.88, 523.25, 659.25, 698.46, 880, // High oct
  ];

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx) {
      this.stopMusic();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolumes(music: number, sfx: number) {
    this.musicVolume = Math.max(0, Math.min(1, music));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
  }

  public setGameState(level: number, isPower: boolean, isDomain: boolean, isDanger: boolean) {
    this.currentLevel = level;
    this.isPowerMode = isPower;
    this.isDomainMode = isDomain;
    this.isDangerMode = isDanger;

    // Tempo escalates with level progression: 128 BPM -> up to 164 BPM
    const levelBonus = Math.min(30, Math.floor((level - 1) * 1.5));
    const powerBonus = isPower ? 14 : 0;
    const dangerBonus = isDanger ? 8 : 0;
    const targetTempo = 128 + levelBonus + powerBonus + dangerBonus;
    this.tempo = isDomain ? 80 : targetTempo;
  }

  public startMusic() {
    if (this.isMuted || this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    this.step = 0;
    this.scheduleNextTick();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      window.clearTimeout(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  private scheduleNextTick() {
    if (!this.isMusicPlaying || !this.ctx || this.isMuted) return;

    const secondsPerBeat = 60.0 / this.tempo;
    const stepDuration = (secondsPerBeat / 4) * 1000; // 16th note in ms

    this.playMusicStep(this.step);
    this.step = (this.step + 1) % 64; // 4 bar loop

    this.musicIntervalId = window.setTimeout(() => {
      this.scheduleNextTick();
    }, stepDuration);
  }

  private playMusicStep(step: number) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const bar = Math.floor(step / 16);
    const stepInBar = step % 16;

    // 1. Kick Drum (On beats 0, 4, 8, 12 - 4 on the floor)
    if (stepInBar % 4 === 0) {
      this.synthesizeKick(now);
    }

    // 2. Snare / Clap (On beats 4, 12)
    if (stepInBar === 4 || stepInBar === 12) {
      this.synthesizeSnare(now);
    }

    // 3. Hi-Hat (Every odd 16th note, or all 16ths on power mode)
    if (stepInBar % 2 === 1 || (this.isPowerMode && stepInBar % 2 === 0)) {
      this.synthesizeHiHat(now, stepInBar % 4 === 2);
    }

    // 4. Bassline Synth (Driving rolling 16th synthwave bass)
    if (stepInBar % 2 === 0 || this.isPowerMode) {
      const rootOffset = bar === 0 ? 0 : bar === 1 ? 4 : bar === 2 ? 2 : 5;
      const bassFreq = this.scaleA[rootOffset % this.scaleA.length];
      this.synthesizeBass(now, bassFreq);
    }

    // 5. Arpeggio / Lead Melody
    // Plays melodic patterns that shift with bars
    const leadPatterns = [
      [6, 8, 9, 11, 8, 9, 11, 13, 11, 9, 8, 6, 8, 9, 11, 13],
      [11, 13, 14, 16, 14, 13, 11, 9, 11, 13, 14, 16, 14, 13, 11, 9],
      [9, 11, 13, 14, 13, 11, 9, 8, 9, 11, 13, 14, 13, 11, 9, 8],
      [13, 14, 16, 17, 16, 14, 13, 11, 13, 14, 16, 14, 13, 11, 9, 6],
    ];

    const currentPattern = leadPatterns[bar % leadPatterns.length];
    const noteIndex = currentPattern[stepInBar];
    if (noteIndex !== undefined && (stepInBar % 2 === 0 || this.isPowerMode)) {
      const freq = this.scaleA[noteIndex % this.scaleA.length] * (this.isPowerMode ? 1.5 : 1.0);
      this.synthesizeLead(now, freq);
    }
  }

  // --- SYNTHESIZED INSTRUMENTS ---

  private synthesizeKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.7 * this.musicVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  private synthesizeSnare(time: number) {
    if (!this.ctx) return;
    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4 * this.musicVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.13);
  }

  private synthesizeHiHat(time: number, isAccent: boolean) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime((isAccent ? 0.25 : 0.12) * this.musicVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  private synthesizeBass(time: number, freq: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq / 2, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(this.isPowerMode ? 1200 : 600, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + 0.12);

    gain.gain.setValueAtTime(0.35 * this.musicVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.13);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.14);
  }

  private synthesizeLead(time: number, freq: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = this.isPowerMode ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(this.isDomainMode ? 800 : 2200, time);
    filter.Q.setValueAtTime(2.5, time);

    gain.gain.setValueAtTime(0.2 * this.musicVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.16);
  }

  // --- SOUND EFFECTS (SFX) ---

  public playDotChomp(index: number = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const pitch = index % 2 === 0 ? 587.33 : 659.25; // D5 / E5 anime blip
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, now + 0.05);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playPowerOrb() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playGhostEaten(comboCount: number = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const baseFreq = 400 * Math.min(3, comboCount);
    
    // 2-tone victory glissando
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + i * 0.06;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq * (1 + i * 0.3), startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * (1.5 + i * 0.4), startTime + 0.08);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    }
  }

  public playKamehameha() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 1. Charging sub-rumble
    const rumble = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(80, now);
    rumble.frequency.linearRampToValueAtTime(320, now + 0.4);
    rumbleGain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    rumbleGain.gain.linearRampToValueAtTime(0.7 * this.sfxVolume, now + 0.4);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    rumble.connect(rumbleGain);
    rumbleGain.connect(this.ctx.destination);
    rumble.start(now);
    rumble.stop(now + 1.3);

    // 2. High laser energy blast sweep
    const laser = this.ctx.createOscillator();
    const laserGain = this.ctx.createGain();
    laser.type = 'sawtooth';
    laser.frequency.setValueAtTime(1400, now + 0.35);
    laser.frequency.exponentialRampToValueAtTime(200, now + 1.1);
    laserGain.gain.setValueAtTime(0.5 * this.sfxVolume, now + 0.35);
    laserGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    laser.connect(laserGain);
    laserGain.connect(this.ctx.destination);
    laser.start(now + 0.35);
    laser.stop(now + 1.3);
  }

  public playDomainExpansion() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Deep cosmic bell sound
    [220, 330, 440, 660].forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime((0.35 / (idx + 1)) * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.6);
    });
  }

  public playBankaiSlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Metallic slice whoosh
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.Q.setValueAtTime(4.0, now);

    gain.gain.setValueAtTime(0.6 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playRasengan() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.3);
    osc.frequency.linearRampToValueAtTime(450, now + 0.6);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  public playGear5Bounce() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playBonusItem() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.14);
    });
  }

  public playLevelClear() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Japanese arcade fanfare
    const fanfare = [
      { f: 440, d: 0.12 },
      { f: 554.37, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 880, d: 0.35 },
      { f: 783.99, d: 0.15 },
      { f: 880, d: 0.5 },
    ];

    let t = now;
    fanfare.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.4 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + n.d + 0.05);

      t += n.d;
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 415.3, 392.0, 369.99, 329.63];
    let t = now;
    notes.forEach((f) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.28);

      t += 0.22;
    });
  }

  public playFeverStart() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Rainbow chime ascending arpeggio
    const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
    let t = now;
    arpeggio.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const dur = 0.09;
      gain.gain.setValueAtTime(0.45 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += 0.045;
    });
  }

  public playFeverChomp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const randF = 600 + Math.random() * 400;
    osc.frequency.setValueAtTime(randF, now);
    osc.frequency.exponentialRampToValueAtTime(randF * 1.5, now + 0.06);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }
}

export const audioEngine = new AudioEngine();

