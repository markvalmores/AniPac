import { Particle, FloatingCombatText, KamehamehaBeam, Direction } from './types';

export class VFXEngine {
  public particles: Particle[] = [];
  public floatingTexts: FloatingCombatText[] = [];
  public kamehameha: KamehamehaBeam = {
    active: false,
    startX: 0,
    startY: 0,
    dir: 'RIGHT',
    length: 0,
    width: 24,
    timer: 0,
    maxTimer: 1.8,
  };
  public screenShake: number = 0;
  public slashArcs: Array<{
    x: number;
    y: number;
    angle: number;
    radius: number;
    color: string;
    life: number;
    maxLife: number;
  }> = [];

  public update(dt: number) {
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 15);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.rotation !== undefined && p.rotSpeed !== undefined) {
        p.rotation += p.rotSpeed * dt;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating combat texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt * 60;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update slash arcs
    for (let i = this.slashArcs.length - 1; i >= 0; i--) {
      const arc = this.slashArcs[i];
      arc.life -= dt;
      if (arc.life <= 0) {
        this.slashArcs.splice(i, 1);
      }
    }

    // Update Kamehameha
    if (this.kamehameha.active) {
      this.kamehameha.timer -= dt;
      if (this.kamehameha.timer <= 0) {
        this.kamehameha.active = false;
      } else {
        // Spawn beam particles
        this.spawnKamehamehaParticles();
      }
    }
  }

  public triggerScreenShake(intensity = 8) {
    this.screenShake = Math.max(this.screenShake, intensity);
  }

  public addFloatingText(
    text: string,
    x: number,
    y: number,
    color = '#FACC15',
    subtext?: string,
    size = 18
  ) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      subtext,
      x,
      y,
      color,
      size,
      life: 1.2,
      maxLife: 1.2,
      vy: -0.8,
    });
  }

  public spawnDotAbsorb(x: number, y: number, color = '#FACC15') {
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.5;
      const speed = 0.5 + Math.random() * 1.2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        color,
        alpha: 1,
        life: 0.25,
        maxLife: 0.25,
        shape: 'circle',
      });
    }
  }

  public spawnGhostEatenBurst(x: number, y: number, color = '#38BDF8') {
    this.triggerScreenShake(6);
    // Rings and sparks
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18;
      const speed = 1.5 + Math.random() * 3.0;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: i % 2 === 0 ? color : '#FFFFFF',
        alpha: 1,
        life: 0.6,
        maxLife: 0.6,
        shape: 'spark',
        rotation: angle,
      });
    }
  }

  public spawnSuperSaiyanAura(x: number, y: number) {
    // Upward golden flame sparks
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() * 16 - 8),
        y: y + (Math.random() * 16 - 4),
        vx: (Math.random() - 0.5) * 0.8,
        vy: -1.2 - Math.random() * 1.5,
        size: 2 + Math.random() * 3.5,
        color: Math.random() > 0.3 ? '#FACC15' : '#FEF08A',
        alpha: 1,
        life: 0.35,
        maxLife: 0.35,
        shape: 'spark',
      });
    }
  }

  public triggerKamehameha(startX: number, startY: number, dir: Direction, length: number) {
    this.kamehameha = {
      active: true,
      startX,
      startY,
      dir,
      length,
      width: 28,
      timer: 1.8,
      maxTimer: 1.8,
    };
    this.triggerScreenShake(12);
  }

  private spawnKamehamehaParticles() {
    const { startX, startY, dir, length } = this.kamehameha;
    let dx = 0;
    let dy = 0;
    if (dir === 'RIGHT') dx = 1;
    if (dir === 'LEFT') dx = -1;
    if (dir === 'DOWN') dy = 1;
    if (dir === 'UP') dy = -1;

    for (let i = 0; i < 6; i++) {
      const dist = Math.random() * length;
      const px = startX + dx * dist + (Math.random() - 0.5) * 16;
      const py = startY + dy * dist + (Math.random() - 0.5) * 16;
      this.particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.4 ? '#06B6D4' : '#E0F2FE',
        alpha: 1,
        life: 0.25,
        maxLife: 0.25,
        shape: 'spark',
      });
    }
  }

  public triggerBankaiSlash(x: number, y: number, angle: number) {
    this.slashArcs.push({
      x,
      y,
      angle,
      radius: 40,
      color: '#EF4444',
      life: 0.3,
      maxLife: 0.3,
    });
    this.triggerScreenShake(7);

    // Red and black getsuga blade particles
    for (let i = 0; i < 16; i++) {
      const spread = angle - Math.PI / 3 + (Math.PI * 2 * i) / 24;
      const speed = 2 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(spread) * speed,
        vy: Math.sin(spread) * speed,
        size: 2.5 + Math.random() * 3.5,
        color: i % 2 === 0 ? '#EF4444' : '#18181B',
        alpha: 1,
        life: 0.4,
        maxLife: 0.4,
        shape: 'spark',
      });
    }
  }

  public spawnRasenganVortex(x: number, y: number, count = 2) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 20;
      this.particles.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        vx: -Math.sin(angle) * 2.5,
        vy: Math.cos(angle) * 2.5,
        size: 2 + Math.random() * 3,
        color: '#38BDF8',
        alpha: 0.9,
        life: 0.28,
        maxLife: 0.28,
        shape: 'circle',
      });
    }
  }

  public spawnGear5JoySparks(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      const colors = ['#F472B6', '#FBBF24', '#38BDF8', '#A78BFA', '#34D399'];
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0.35,
        maxLife: 0.35,
        shape: 'circle',
      });
    }
  }

  public spawnWeatherParticles(type: string, canvasWidth: number, canvasHeight: number) {
    if (this.particles.length > 120) return; // Keep high performance
    if (type === 'sakura') {
      if (Math.random() > 0.6) {
        this.particles.push({
          x: Math.random() * canvasWidth,
          y: -10,
          vx: 0.5 + Math.random() * 0.8,
          vy: 1.0 + Math.random() * 1.2,
          size: 4 + Math.random() * 3,
          color: '#FBCFE8',
          alpha: 0.8,
          life: 8,
          maxLife: 8,
          shape: 'petal',
          rotation: Math.random() * Math.PI,
          rotSpeed: 0.8 + Math.random() * 1.2,
        });
      }
    } else if (type === 'cyber_rain') {
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          x: Math.random() * canvasWidth,
          y: -10,
          vx: -0.3,
          vy: 5 + Math.random() * 4,
          size: 1.5,
          color: '#06B6D4',
          alpha: 0.6,
          life: 3,
          maxLife: 3,
          shape: 'spark',
        });
      }
    } else if (type === 'embers') {
      if (Math.random() > 0.5) {
        this.particles.push({
          x: Math.random() * canvasWidth,
          y: canvasHeight + 10,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -1.2 - Math.random() * 1.5,
          size: 2.5 + Math.random() * 2,
          color: Math.random() > 0.4 ? '#F97316' : '#EF4444',
          alpha: 0.9,
          life: 5,
          maxLife: 5,
          shape: 'circle',
        });
      }
    } else if (type === 'stardust') {
      if (Math.random() > 0.7) {
        this.particles.push({
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: 1.5 + Math.random() * 2,
          color: '#C084FC',
          alpha: 0.7,
          life: 4,
          maxLife: 4,
          shape: 'circle',
        });
      }
    }
  }

  public spawnRainbowFeverSparks(x: number, y: number, count = 3) {
    const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3', '#00FFFF', '#FF00FF'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      const color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color,
        alpha: 1,
        life: 0.45,
        maxLife: 0.45,
        shape: 'spark',
      });
    }
  }

  public spawnRainbowTrail(x: number, y: number) {
    const hue = (performance.now() * 0.4) % 360;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: 4 + Math.random() * 4,
      color: `hsl(${hue}, 100%, 65%)`,
      alpha: 0.85,
      life: 0.35,
      maxLife: 0.35,
      shape: 'circle',
    });
  }
}

