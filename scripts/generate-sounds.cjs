/*
 * Generates the four short UI sounds used by the chess app.
 *
 * The sounds are synthesized from scratch (sine waves, noise and envelopes),
 * so they are original works released as CC0 / public domain. No third-party
 * samples are used. Run with: node scripts/generate-sounds.cjs
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

let seed = 20261112;

function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

function noise() {
  return random() * 2 - 1;
}

function easeOut(t, decay) {
  return Math.exp(-t * decay);
}

function finish(samples, peak = 0.8) {
  const fade = Math.floor(SAMPLE_RATE * 0.004);
  let max = 0;

  for (let index = 0; index < samples.length; index += 1) {
    max = Math.max(max, Math.abs(samples[index]));
  }

  const scale = max > 0 ? peak / max : 0;

  for (let index = 0; index < samples.length; index += 1) {
    let value = samples[index] * scale;

    if (index < fade) {
      value *= index / fade;
    }

    if (index >= samples.length - fade) {
      value *= (samples.length - 1 - index) / fade;
    }

    samples[index] = value;
  }

  return samples;
}

function makeSamples(duration, render) {
  const length = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(length);

  for (let index = 0; index < length; index += 1) {
    samples[index] = render(index / SAMPLE_RATE);
  }

  return samples;
}

function writeWav(fileName, samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < samples.length; index += 1) {
    const value = Math.max(-1, Math.min(1, samples[index]));
    buffer.writeInt16LE(Math.round(value * 32767), 44 + index * 2);
  }

  fs.writeFileSync(path.join(OUT_DIR, fileName), buffer);
}

function makeMove() {
  return makeSamples(0.09, (t) => {
    const click = t < 0.008 ? noise() * (1 - t / 0.008) * 0.5 : 0;
    const wood = Math.sin(2 * Math.PI * 330 * t) * easeOut(t, 55) * 0.55;
    const body = Math.sin(2 * Math.PI * 520 * t) * easeOut(t, 90) * 0.25;

    return click + wood + body;
  });
}

function makeCapture() {
  return makeSamples(0.16, (t) => {
    const thud = Math.sin(2 * Math.PI * 150 * t) * easeOut(t, 30) * 0.7;
    const knock = Math.sin(2 * Math.PI * 260 * t) * easeOut(t, 45) * 0.3;
    const grit = t < 0.03 ? noise() * (1 - t / 0.03) * 0.35 : 0;

    return thud + knock + grit;
  });
}

function makeCheck() {
  return makeSamples(0.3, (t) => {
    const first = t < 0.11 ? Math.sin(2 * Math.PI * 740 * t) * easeOut(t, 26) * 0.5 : 0;
    const secondStart = 0.09;
    const second =
      t >= secondStart
        ? Math.sin(2 * Math.PI * 988 * (t - secondStart)) *
          easeOut(t - secondStart, 20) *
          0.55
        : 0;
    const shimmer =
      t >= secondStart
        ? Math.sin(2 * Math.PI * 1976 * (t - secondStart)) *
          easeOut(t - secondStart, 32) *
          0.12
        : 0;

    return first + second + shimmer;
  });
}

function makeGameOver() {
  return makeSamples(0.72, (t) => {
    const notes = [
      { start: 0, freq: 523.25 },
      { start: 0.16, freq: 392.0 },
      { start: 0.34, freq: 261.63 },
    ];

    let value = 0;

    for (const note of notes) {
      if (t < note.start) {
        continue;
      }

      const local = t - note.start;
      value += Math.sin(2 * Math.PI * note.freq * local) * easeOut(local, 5.5) * 0.42;
      value +=
        Math.sin(2 * Math.PI * note.freq * 2 * local) * easeOut(local, 9) * 0.08;
    }

    return value;
  });
}

fs.mkdirSync(OUT_DIR, { recursive: true });
writeWav('move.wav', finish(makeMove()));
writeWav('capture.wav', finish(makeCapture()));
writeWav('check.wav', finish(makeCheck()));
writeWav('game-over.wav', finish(makeGameOver()));
console.log('Generated sounds in', OUT_DIR);
