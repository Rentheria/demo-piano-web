// Web Audio API Piano
// Built for Meetup GDL - cursor-native-agent demo

class Piano {
    constructor() {
        this.audioContext = null;
        this.activeOscillators = new Map();
        this.initializeAudio();
        this.setupEventListeners();
    }

    initializeAudio() {
        // Create audio context on user interaction (browser security requirement)
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });

        document.addEventListener('keydown', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });

        document.addEventListener('touchstart', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    }

    // Note frequencies (equal temperament tuning)
    getFrequency(note) {
        const frequencies = {
            'C3': 130.81,
            'C#3': 138.59,
            'D3': 146.83,
            'D#3': 155.56,
            'E3': 164.81,
            'F3': 174.61,
            'F#3': 185.00,
            'G3': 196.00,
            'G#3': 207.65,
            'A3': 220.00,
            'A#3': 233.08,
            'B3': 246.94,
            'C4': 261.63,
            'C#4': 277.18,
            'D4': 293.66,
            'D#4': 311.13,
            'E4': 329.63,
            'F4': 349.23,
            'F#4': 369.99,
            'G4': 392.00,
            'G#4': 415.30,
            'A4': 440.00,
            'A#4': 466.16,
            'B4': 493.88,
            'C5': 523.25
        };
        return frequencies[note] || 440;
    }

    playNote(note) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Don't play if already playing
        if (this.activeOscillators.has(note)) {
            return;
        }

        const now = this.audioContext.currentTime;
        
        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine'; // Smooth piano-like sound
        oscillator.frequency.setValueAtTime(this.getFrequency(note), now);

        // Create gain node for envelope (ADSR)
        const gainNode = this.audioContext.createGain();
        
        // Attack
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        
        // Decay to sustain
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Start oscillator
        oscillator.start(now);

        // Store reference
        this.activeOscillators.set(note, { oscillator, gainNode });
    }

    stopNote(note) {
        const nodes = this.activeOscillators.get(note);
        if (!nodes) return;

        const { oscillator, gainNode } = nodes;
        const now = this.audioContext.currentTime;

        // Release envelope
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);

        // Stop and cleanup after release
        oscillator.stop(now + 0.3);
        
        this.activeOscillators.delete(note);
    }

    setupEventListeners() {
        const keys = document.querySelectorAll('.key');
        
        // Mouse events
        keys.forEach(key => {
            const note = key.dataset.note;
            
            key.addEventListener('mousedown', () => {
                this.playNote(note);
                key.classList.add('active');
            });

            key.addEventListener('mouseup', () => {
                this.stopNote(note);
                key.classList.remove('active');
            });

            key.addEventListener('mouseleave', () => {
                this.stopNote(note);
                key.classList.remove('active');
            });

            // Touch events for mobile
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playNote(note);
                key.classList.add('active');
            });

            key.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.stopNote(note);
                key.classList.remove('active');
            });
        });

        // Keyboard events
        const keyMap = new Map();
        keys.forEach(key => {
            const keyCode = key.dataset.key;
            if (keyCode) {
                keyMap.set(keyCode.toLowerCase(), key);
            }
        });

        const activeKeys = new Set();

        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            // Prevent repeat firing when key is held
            if (activeKeys.has(key)) return;
            
            const keyElement = keyMap.get(key);
            if (keyElement) {
                e.preventDefault();
                const note = keyElement.dataset.note;
                this.playNote(note);
                keyElement.classList.add('active');
                activeKeys.add(key);
            }
        });

        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            const keyElement = keyMap.get(key);
            
            if (keyElement) {
                e.preventDefault();
                const note = keyElement.dataset.note;
                this.stopNote(note);
                keyElement.classList.remove('active');
                activeKeys.delete(key);
            }
        });
    }
}

// Initialize piano when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Piano();
});