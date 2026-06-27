// Advanced Web Audio API Synth Engine for the Reward Chart Arcade HUD

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSound = {
  click: () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  },

  hover: () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.03);
      
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  },

  success: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Majestic major pentatonic arpeggio chime chord
      const chords = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = idx * 0.05;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        
        gain.gain.setValueAtTime(0.06, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.28);
      });
    } catch (e) {}
  },

  levelUp: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Heroic triumphant video game level-up chord progression (C-major -> G-major polyphonic sweep)
      const freqs = [
        // C-Major block
        [261.63, 329.63, 392.00, 523.25], 
        // E-Major transition
        [329.63, 415.30, 493.88, 659.25],
        // High sparkling cascade
        [523.25, 659.25, 783.99, 1046.50, 1318.51]
      ];

      freqs.forEach((chord, stepIdx) => {
        const stepDelay = stepIdx * 0.15;
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + stepDelay);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + stepDelay + 0.3);
          
          gain.gain.setValueAtTime(0.04, now + stepDelay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + stepDelay + 0.35);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + stepDelay);
          osc.stop(now + stepDelay + 0.38);
        });
      });
    } catch (e) {}
  },

  pinSuccess: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Sci-fi computerized double-chirp
      const notes = [600, 1200]; 
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = idx * 0.08;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        
        gain.gain.setValueAtTime(0.1, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.2);
      });
    } catch (e) {}
  },

  pinError: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(140, now + 0.1);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  },

  evolution: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Majestic synthesizer sweeps with ascending resonance effects
      const biquad = ctx.createBiquadFilter();
      biquad.type = 'peaking';
      biquad.frequency.setValueAtTime(100, now);
      biquad.frequency.exponentialRampToValueAtTime(4000, now + 1.8);
      biquad.Q.setValueAtTime(15, now);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, now);
      osc1.frequency.exponentialRampToValueAtTime(660, now + 1.8);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(115, now);
      osc2.frequency.exponentialRampToValueAtTime(990, now + 1.8);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc1.connect(biquad);
      osc2.connect(biquad);
      biquad.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.9);
      osc2.stop(now + 1.9);
    } catch (e) {}
  },

  purchase: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Happy high pitched "cha-ching" / double coin clink
      const freqs = [1200, 1600]; 
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = idx * 0.12;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + delay + 0.1);
        
        gain.gain.setValueAtTime(0.08, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.25);
      });
    } catch (e) {}
  }
};
