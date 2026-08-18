// Audio Synthesizer & Speech Utilities

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play pleasant short chime for task check or button action
  playChime(type: "success" | "pop" | "mic-on" | "mic-off" | "alert" | "timer-alarm") {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === "success") {
        // Two-tone rising harmonic chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";

        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

        osc2.frequency.setValueAtTime(659.25, now + 0.08);
        osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.25); // C6

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.08);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.4);
      } else if (type === "pop") {
        // Short subtle click/pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "mic-on") {
        // High soft blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "mic-off") {
        // Low soft blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(783.99, now); // G5
        osc.frequency.setValueAtTime(440, now + 0.08); // A4

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "timer-alarm") {
        // Repeating energetic cooking alarm pulse
        for (let i = 0; i < 3; i++) {
          const startTime = now + i * 0.22;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(880, startTime);
          osc.frequency.setValueAtTime(1174.66, startTime + 0.1);

          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.18);
        }
      } else if (type === "alert") {
        // Warning alert tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(349.23, now + 0.15); // F4

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // AudioContext might be blocked until user interaction
    }
  }
}

export const soundFx = new SoundSynthesizer();

// Text-To-Speech Controller
export function speakText(text: string, options: { rate?: number; onEnd?: () => void } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel();

    if (!text || text.trim() === "") return;

    // Clean text of markdown asterisks and URLs for cleaner pronunciation
    const cleanText = text
      .replace(/[*_#`~]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    if (options.onEnd) {
      utterance.onend = options.onEnd;
      utterance.onerror = options.onEnd;
    }

    // Try selecting high-quality natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha")) && v.lang.startsWith("en")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("TTS error:", err);
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
