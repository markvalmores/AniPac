import { Direction, ShonenPowerType } from './types';

export class InputManager {
  private currentDirection: Direction = 'NONE';
  private queuedDirection: Direction = 'NONE';
  private onTriggerPowerCallback: ((power: ShonenPowerType) => void) | null = null;
  private onTogglePauseCallback: (() => void) | null = null;
  private lastGamepadPoll: number = 0;
  private isGamepadConnected: boolean = false;
  private gamepadName: string = '';

  constructor() {
    this.initKeyboard();
    this.initGamepad();
  }

  public setOnTriggerPower(cb: (power: ShonenPowerType) => void) {
    this.onTriggerPowerCallback = cb;
  }

  public setOnTogglePause(cb: () => void) {
    this.onTogglePauseCallback = cb;
  }

  private initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Prevent scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        // Directions
        case 'ArrowUp':
        case 'KeyW':
          this.setDirection('UP');
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.setDirection('RIGHT');
          break;

        // Shonen Special Moves Hotkeys
        case 'Space':
          this.onTriggerPowerCallback?.('SUPER_SAIYAN');
          break;
        case 'KeyJ':
        case 'Digit1':
          this.onTriggerPowerCallback?.('KAMEHAMEHA');
          break;
        case 'KeyK':
        case 'Digit2':
          this.onTriggerPowerCallback?.('DOMAIN_EXPANSION');
          break;
        case 'KeyL':
        case 'Digit3':
          this.onTriggerPowerCallback?.('BANKAI_SLASH');
          break;
        case 'KeyU':
        case 'Digit4':
          this.onTriggerPowerCallback?.('RASENGAN_VACUUM');
          break;
        case 'KeyI':
        case 'Digit5':
          this.onTriggerPowerCallback?.('GEAR_5_BOUNCE');
          break;

        // Pause
        case 'Escape':
        case 'KeyP':
          this.onTogglePauseCallback?.();
          break;
      }
    });
  }

  private initGamepad() {
    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      this.isGamepadConnected = true;
      this.gamepadName = e.gamepad.id || 'Controller';
      console.log('Gamepad connected:', e.gamepad.id);
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.isGamepadConnected = false;
      this.gamepadName = '';
      console.log('Gamepad disconnected');
    });
  }

  public pollGamepad() {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;

      this.isGamepadConnected = true;
      this.gamepadName = gp.id;

      // 1. D-Pad & Analog Stick Navigation
      const deadZone = 0.35;
      const axisX = gp.axes[0] || 0;
      const axisY = gp.axes[1] || 0;

      const dpadUp = gp.buttons[12]?.pressed;
      const dpadDown = gp.buttons[13]?.pressed;
      const dpadLeft = gp.buttons[14]?.pressed;
      const dpadRight = gp.buttons[15]?.pressed;

      if (dpadUp || axisY < -deadZone) {
        this.setDirection('UP');
      } else if (dpadDown || axisY > deadZone) {
        this.setDirection('DOWN');
      } else if (dpadLeft || axisX < -deadZone) {
        this.setDirection('LEFT');
      } else if (dpadRight || axisX > deadZone) {
        this.setDirection('RIGHT');
      }

      // 2. Buttons triggers (with throttle to prevent spam)
      const now = performance.now();
      if (now - this.lastGamepadPoll > 200) {
        // A / Cross (Button 0) -> Super Saiyan
        if (gp.buttons[0]?.pressed) {
          this.onTriggerPowerCallback?.('SUPER_SAIYAN');
          this.lastGamepadPoll = now;
        }
        // X / Square (Button 2) -> Kamehameha
        else if (gp.buttons[2]?.pressed) {
          this.onTriggerPowerCallback?.('KAMEHAMEHA');
          this.lastGamepadPoll = now;
        }
        // Y / Triangle (Button 3) -> Domain Expansion
        else if (gp.buttons[3]?.pressed) {
          this.onTriggerPowerCallback?.('DOMAIN_EXPANSION');
          this.lastGamepadPoll = now;
        }
        // B / Circle (Button 1) -> Bankai
        else if (gp.buttons[1]?.pressed) {
          this.onTriggerPowerCallback?.('BANKAI_SLASH');
          this.lastGamepadPoll = now;
        }
        // LB / L1 (Button 4) -> Rasengan
        else if (gp.buttons[4]?.pressed) {
          this.onTriggerPowerCallback?.('RASENGAN_VACUUM');
          this.lastGamepadPoll = now;
        }
        // RB / R1 (Button 5) -> Gear 5
        else if (gp.buttons[5]?.pressed) {
          this.onTriggerPowerCallback?.('GEAR_5_BOUNCE');
          this.lastGamepadPoll = now;
        }
        // Start (Button 9) -> Pause
        else if (gp.buttons[9]?.pressed) {
          this.onTogglePauseCallback?.();
          this.lastGamepadPoll = now;
        }
      }
    }
  }

  public triggerHaptics(duration = 150, weak = 0.5, strong = 0.5) {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
        try {
          gp.vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration,
            weakMagnitude: weak,
            strongMagnitude: strong,
          });
        } catch {
          // ignore
        }
      }
    }
  }

  public setDirection(dir: Direction) {
    this.queuedDirection = dir;
  }

  public getQueuedDirection(): Direction {
    return this.queuedDirection;
  }

  public getGamepadInfo() {
    return {
      connected: this.isGamepadConnected,
      name: this.gamepadName,
    };
  }
}
