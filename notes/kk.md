# KingKrusher — User Manual

The screenshots below are from the in-plugin help overlay, which you can open at any time by clicking the **?** button.

## Right Section
![kk-help1](help1.png)

## Left Section A
![kk-help2](help2.png)

## Left Section B
![kk-help3](help3.png)

## Basic Usage

1. Load KingKrusher in your DAW like any other VST3/AU plugin.
2. Use the Patch Name field and the Save/Load/Rand/Init buttons to manage presets.
3. Adjust parameters with the rotary knobs and toggle buttons in the three-column layout.
4. Click **?** for an in-plugin reference overlay.

## Features

- **Bitcrushing & Sample Rate Reduction:** Eight algorithms with anti-aliasing and soft quantization.
- **Frequency-Split Crush Mode:** Split the signal at a tunable crossover and crush only the low band while the highs pass clean.
- **Multi-Mode Filtering:** High-pass and low-pass filters with variable cutoff and resonance, plus live response graphs.
- **Saturation & Wave Folding:** Asymmetric tape-style drive with tilt EQ, switchable to triangle-wave folding with variable fold amount and symmetry.
- **Feedback Comb Filter:** Comb filter with LFO-modulated frequency and feedback.
- **Flanger:** Animated delay-line modulation with its own LFO.
- **Phaser:** Phase shifting with LFO modulation.
- **Tremolo & Vibrato:** Beat-synced tremolo with variable depth and shape, plus pitch vibrato.
- **Modulation Effects:** Wow+Flutter and Chorus for tape-style and ensemble movement.
- **Delay & Reverb:** Stereo tempo-synced delay and algorithmic reverb.
- **Noise and Stereo Width:** Blend in white noise and control stereo width.
- **Noise Gate:** Threshold-based gate for automated signal ducking.
- **Slew Limiting:** Soften staircase artifacts from sample-rate reduction.
- **Oversampling:** 2× oversampling for cleaner sound.
- **Routing:** 15 configurable signal chain orders with a drag-and-drop chain editor.
- **Per-Effect LFOs:** Each major effect has a dedicated LFO with rate, depth, mode, free-rate, phase, and shape controls.
- **Auto Gain:** Automatic level compensation for saturation and wave folding.
- **Presets:** Save, load, initialize, and randomize patches from the UI. Randomization never touches Output, Auto Gain, Limiter, Oversample, Bypass, Krush Mute, or Freeze — those stay as you set them.
- **Resizable UI:** 4:3 aspect ratio (640×480 minimum, 2560×1920 maximum); the interface scales cleanly at any size.
- **Real-Time Visualizers:** Stereo oscilloscope, HP/LP filter response plots, comb filter response, saturation/wave fold curve, tremolo LFO animation, reverb and flanger visuals.

## Signal Routing

KingKrusher features a **drag-and-drop 15-block signal chain**. Click the **ROUTE** button to open the chain overlay, then drag any block to a new position. Each block can also be muted individually.

| Label | Block        | Description |
|-------|--------------|-------------|
| **O** | Wow+Chorus   | Tape wow+flutter and stereo chorus |
| **T** | Tremolo      | LFO amplitude tremolo + pitch vibrato |
| **N** | Noise+Mono   | White noise blend and stereo width |
| **S** | Saturation   | Asymmetric drive + tilt EQ |
| **W** | Wave Fold    | Triangle-wave folder with symmetry |
| **H** | Highpass     | HP filter |
| **L** | Lowpass      | LP filter |
| **C** | Comb         | Feedback comb filter |
| **V** | Reverb       | Algorithmic reverb |
| **F** | Flanger      | Animated flanger (sine-wave delay modulation) |
| **G** | Gate         | Threshold-based noise gate |
| **K** | Krush+Split  | Bit depth, sample rate reduction, slew, frequency-split |
| **D** | Delay        | Stereo tempo-synced delay |
| **A** | Phaser       | Phase shifter |
| **Z** | Freeze       | Loop capture at chain position; pan follows delay width |

### Position matters

*Putting effects before Krush* means their output gets bitcrushed. For example, placing Saturation before Krush lets the drive harmonics get degraded by the reduction.

*Putting effects after Krush* means they process the already-crushed signal. Reverb placed after Krush smears the digital artifacts; placed before, the reverb tail gets crushed too.

The **Split** block has its own special interaction with chain position — see Frequency-Split Crush Mode.

## Krush

The main control: a single knob that reduces bit depth and sample rate together.

- **Krush:** 0.0 – 1.0
  - 0.0 — full 16-bit quality, no sample rate reduction.
  - 1.0 — 3-bit depth, 32× sample rate reduction.

### Bitcrush Algorithm

Eight algorithms control how quantization and downsampling are performed. Select one with the button grid below the Krush knob.

All algorithms that downsample include an anti-aliasing filter (toggle with the **AA** button) before downsampling, and all use smooth, gradual transitions between levels rather than hard steps.

| Button | Name             | Description |
|--------|------------------|-------------|
| STD    | Standard         | Classic sample-and-hold bitcrush with smooth rounding. |
| JIT    | Jitter           | Sample-and-hold with timing jitter on the sample clock. |
| RND    | Random Hold      | Randomly holds one of the last four captured values. |
| CUB    | Cubic            | Smoothly interpolates between captured samples — the smoothest of the eight. |
| BTK    | Bitcrush Only    | Quantization only, no downsampling. |
| DWN    | Downsample Only  | Downsampling only, no quantization. |
| COR    | Corrupt          | Bitcrush with bit masking for extra grit. |
| NSH    | Noise Shaped     | Shapes the quantization noise for a warmer, less harsh crunch. |

### Anti-Aliasing (AA)

A low-pass filter applied before downsampling. When **On**, a gentle filter at about 45% of the target sample rate removes frequencies that would otherwise alias. When **Off**, full aliasing is allowed for an aggressive crunch.

### Quant

Snaps the effective bit depth and downsample factor to whole numbers.

### Krush LFO

Modulates the krush amount. It has rate (beat-synced or free), depth, phase offset, and shape (sine/saw/triangle/square), plus a free-rate toggle. The Krush LFO has a single target: the krush amount itself.

## Slew

Slew rate limiting, applied after downsampling to soften the staircase edges of sample-rate reduction.

- **Slew:** 0.0 – 1.0. Blends between the dry signal and the smoothed version — 0.0 = no smoothing, 1.0 = fully smoothed.

## Oversampling

- **Oversampling:** On/Off (2×). When enabled, the saturation and bitcrush stages are processed at twice the session sample rate, which reduces aliasing when you push them hard.

## Filters

- **HP Cut:** 20 Hz – 1,200 Hz (default 20 Hz — effectively off). 12 dB/octave high-pass filter.
- **HP Res:** 0.1 – 2.0 (default 0.7). Resonance at the cutoff; above 1.0 it produces resonant bumps.
- **HP LFO:** Modulates cutoff, resonance, or both.
- **LP Cut:** 20 Hz – 20,000 Hz (default 20,000 Hz — effectively off). 12 dB/octave low-pass filter.
- **LP Res:** 0.1 – 2.0 (default 0.7). Resonance at the cutoff; above 1.0 it produces resonant bumps.
- **LP LFO:** Modulates cutoff, resonance, or both.

## Frequency-Split Crush Mode

Split mode splits the signal at a tunable crossover, crushes only the low band, and recombines it with the original clean highs.

### How it works

1. The signal is split at the Split Cut crossover using a low-pass filter.
2. The low band is bitcrushed with the full eight-algorithm pipeline.
3. An optional low-pass on the crushed low band (Split Filter) shapes it further.
4. The crushed low band is recombined with the clean highs.

### Split vs. Krush

Split and Krush are mutually exclusive. When Split is active, Krush+Slew is automatically muted. When Split is bypassed, Krush+Slew handles full-range crushing.

### Controls

- **Split Cut / Split Res:** Replace the HP Cut/Res knobs in split mode. Independent parameters.
- **Split Filter:** An extra low-pass on the crushed low band only.
- **Split LFO:** Modulates cutoff, resonance, or both.

## Saturation

Asymmetric tape-style drive.

- **Drive:** 0.0 – 1.0 (1× – 24× gain into asymmetric soft clipping). Adds even harmonics.
- **Tone:** 0.0 – 1.0 (0.5 = neutral). Tilt EQ: 0.0 = dark (around 400 Hz low-pass), 1.0 = bright (around 6 kHz high-pass).
- **Sat/WF LFO:** Modulates tone/fold or drive/symmetry, depending on the LFO mode.
- **Auto Gain (G):** On by default. Compensates level changes from saturation automatically.
- **Visualizer:** Shows the saturation curve, with sun and moon symbols indicating the dark/bright tone balance.

## Wave Folding

Fold the wave back in on itself instead of clipping.

- **Fold:** 0.0 – 1.0 (1× – 24× pre-fold gain). Triangle-wave folding.
- **Symmetry:** 0.0 – 1.0 (default 0.0 — symmetric). Offsets the signal before folding for asymmetric results.
- **WF LFO:** Modulates fold amount or symmetry, depending on the LFO mode.
- **Auto Gain (G):** On by default. Compensates level changes from wave folding automatically.
- **Visualizer:** Shows a sine wave after folding. Ghost curves show the LFO modulation range.

## Comb Filter

A feedback comb filter with a variable-length delay line.

- **Comb Freq:** 0.0 – 1.0 (about 0.1 – 30 ms delay time).
- **Comb Feedback:** 0.0 – 1.0 (maximum 0.99).
- **Comb LFO:** Modulates the comb frequency (mode 0), feedback (mode 1), or both (mode 2). Mode 3 bypasses the LFO.
- **Visualizer:** Shows the comb filter's frequency response for the current settings. When the LFO modulates feedback, ghost curves show the modulation range.

## Flanger

An animated flanger driven by delay-line modulation.

- **Depth:** 0.0 – 1.0. Modulation depth of the delay line. Also controls the wet/dry mix — 0.0 = dry only, so at zero depth the flanger is silent.
- **Rate:** 0.01 – 20 Hz. Sweep rate.
- **Flanger LFO:** Modulates depth (mode 0), rate (mode 1), or both (mode 2). Mode 3 bypasses the LFO.
- **Visualizer:** Animated sine waves whose spread oscillates with the sweep — a live view of the delay-line modulation.

## Phaser

Phase shifting with LFO modulation.

- **Depth:** 0.0 – 1.0. Modulation depth.
- **Rate:** 0.01 – 20 Hz. Sweep rate.
- **Phaser LFO:** Modulates depth (mode 0), rate (mode 1), or both (mode 2). Mode 3 bypasses the LFO.

## Noise Gate

A threshold-based noise gate.

- **Gate:** 0.0 – 1.0. Threshold from -80 dB to 0 dB. At 0.0 the gate is off (always open). Attack and release are fixed, with smooth gain transitions.

## Stereo & Noise

- **Width:** 0.0 – 1.0 (default 0.5). Mid-side processing — 0.0 = mono, 0.5 = normal stereo, 1.0 = widened.
- **Noise:** 0.0 – 1.0. White noise and crackle pops, scaled by the input level.
- **Noise High-Pass:** Fixed high-pass filter at 140 Hz on the generated noise only.
- **Noise LFO:** Modulates noise level, width, or both.

## Tremolo

- **Tremolo Depth:** 0.0 – 1.0. Amplitude modulation depth.
- **Vibrato Depth:** Pitch modulation depth.
- **Tremolo Shape:** 0.0 – 1.0 — 0.0 = saw down, 0.5 = sine, 1.0 = saw up.
- **Tremolo Rate:** Beat-synced subdivision index, 0 – 10 (1 bar down to 1/128).
- **Tremolo Free:** Free-rate mode toggle.
- **Tremolo Phase:** Phase offset for the tremolo LFO.

## Wow+Flutter & Chorus

- **Wow+Flutter:** 0.0 – 1.0. Tape-style pitch modulation.
- **Chorus:** 0.0 – 1.0. Depth and mix are coupled — both increase together. The rate (0.2 – 5.0 Hz) is set by FX Speed.
- **FX Speed:** 0.0 – 1.0 (default 0.5). Runs the two Wow+Flutter LFOs and sets the chorus rate.
- **Wow LFO:** Modulates wow, chorus, or both.

## Delay

Stereo delay with independent left and right channels, tempo-synced to the host BPM and modeled after a tape echo.

- **Delay Time L / R:** 0.0 – 7.0. Delay time for each channel.
- **Delay Mix L / R:** 0.0 – 1.0. Wet level per channel; feedback follows the mix level.
- **Slow Delay:** Halves the delay time on both channels.
- **Link:** Four modes — Off, LNK1 (time + mix), LNK2 (mix only), LNK3 (time only).
- **Delay Width:** 0.0 – 1.0 (default 0.5). Stereo cross-feed width.
- **Delay Free Mode:** Toggles between stepped (button grid) and continuous (slider) control of Delay Time L/R.
- **Freeze:** Captures the delay and loops it indefinitely.

**Shift-click** a delay time button to mirror both channels. **Shift-drag** a delay mix slider to mirror both channels.

## Reverb

- **Reverb Size:** 0.0 – 1.0. Room size.
- **Reverb Mix:** 0.0 – 1.0. Wet level.
- **Reverb LFO:** Modulates size, mix, or both.
- **Visualizer:** Shows the current room size and mix settings.

## LFO Modulation System

Each major effect has a dedicated LFO with the following parameters:

| Parameter | Range   | Description |
|-----------|---------|-------------|
| LFO Rate  | 0 – 16  | BPM-synced rate index (or Hz in free mode) |
| LFO Depth | 0.0 – 1.0 | Modulation depth |
| LFO Mode  | 0 – 3   | 0 = target A, 1 = target B, 2 = both, 3 = bypass |
| LFO Free  | On/Off  | Free-rate mode (continuous Hz instead of stepped beat divisions) |
| LFO Phase | 0.0 – 1.0 | Phase offset (0 – 360°) |
| LFO Shape | 0 – 4   | 0 = sine, 1 = saw up, 2 = saw down, 3 = triangle, 4 = square |

The rate indexes map to beat subdivisions: 16 bars, 8 bars, 6 bars, 4 bars, 2 bars, 1 bar, 3/4, 1/2, 1/4, 1/8, 1/12, 1/16, 1/20, 1/24, 1/32, 1/64, 1/128.

Effects with LFO modulation:
- **Krush LFO** — krush amount (single target)
- **HP LFO** — cutoff / resonance
- **LP LFO** — cutoff / resonance
- **Split LFO** — split cutoff / resonance
- **Sat/WF LFO** — tone/fold / drive/symmetry
- **WF LFO** — fold / symmetry
- **Noise LFO** — noise / width
- **Wow LFO** — wow / chorus
- **Comb LFO** — comb frequency / feedback
- **Flanger LFO** — flanger depth / rate
- **Phaser LFO** — phaser depth / rate
- **Reverb LFO** — size / mix

## Output

- **Auto Gain:** Compares the dry and processed levels after crushing and adjusts automatically.
- **Mix:** 0.0 – 1.0. Final dry/wet blend. At 0.0 the dry signal passes through unchanged.
- **Output Limiter:** Analog-style soft clipper. Signals below the threshold pass clean; peaks are rounded smoothly.
- **Bypass:** Full plugin bypass. The oscilloscope keeps running.

## Patch Management

- **Patch Name:** Text field at the top left; saved with the patch.
- **Save:** Saves the current state to a `.king` file.
- **Load:** Loads a previously saved `.king` file.
- **Rand:** Randomizes all parameters.
- **Init (X):** Resets all parameters to defaults.

### Patch & Settings Locations

Patches and settings are stored in platform-standard directories:

| Item | macOS | Windows | Linux |
|------|-------|---------|-------|
| **Patches** | `~/Library/Audio/Presets/ReplicatAudio/KingKrusher/` | `%APPDATA%/ReplicatAudio/KingKrusher/` | `~/.config/ReplicatAudio/KingKrusher/` |
| **Settings** | `~/Library/Audio/Presets/ReplicatAudio/KingKrusher.raset` | `%APPDATA%/ReplicatAudio/KingKrusher.raset` | `~/.config/ReplicatAudio/KingKrusher.raset` |

Patches use the `.king` extension. Settings are stored in a separate `.raset` file alongside the patch directory.

## Visualizers

| Visualizer | Location | Shows |
|------------|----------|-------|
| Stereo Oscilloscope | Right side, full height | Live stereo waveform |
| Highpass Plot | Center column | HP filter response (LP-style curve in split mode) |
| Lowpass Plot | Center column | LP filter response |
| Saturation / Wave Fold Plot | Center column | Saturation curve or folded sine wave |
| Comb Filter Plot | Center column | Comb filter frequency response with LFO ghost curves |
| Tremolo / Scope | Center column | Tremolo LFO waveform with BPM-locked playhead |
| Reverb Plot | Center column | Reverb room size / mix visualization |
| Flanger Plot | Center column | Animated sine waves (spread oscillation) |

## Tips

- **Subtle degradation:** Set Krush to 0.1 – 0.3 with the Noise Shaped algorithm.
- **Warm saturation:** Moderate Drive (0.3 – 0.6) for tube-like warmth.
- **Ambient textures:** High Reverb Size/Mix with Wow+Flutter for large evolving spaces.
- **Frequency-split lo-fi:** Enable Split mode with a low Split Cut (400 – 800 Hz) to crush only the bass.
- **Comb resonance:** Moderate feedback with LFO modulation for evolving comb textures.
- **Flanger sweeps:** Automate the flanger rate or use the Flanger LFO for rhythmic sweeps.
- **Rhythmic echoes:** Different Delay Time L/R for ping-pong patterns.
- **Gated textures:** Raise the Gate threshold for rhythmic ducking.
- **Auto Gain:** Enable it when using heavy crushing or saturation.
- **Slew + LP:** Combine Slew with a low LP Cut to soften harsh digital artifacts.
- **Frozen textures:** Freeze + Reverb for evolving pads.
- **Shift-click sync:** Hold Shift on delay controls to mirror both channels.
