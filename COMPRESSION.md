# Compressing Beat Patterns into URLs

How BeatURL encodes an 8x256 binary grid into a URL hash shorter than most tweet URLs, and the information theory behind why it works.

## Prerequisites: Information Theory Basics

### Bits and Information

A **bit** is the smallest unit of information — a yes/no answer. If you flip a fair coin, you need 1 bit to record the result. If you roll a 6-sided die, you need ~2.58 bits (log2(6)). The key insight: **the less predictable something is, the more bits you need to describe it**.

### Shannon Entropy

In 1948, Claude Shannon defined **entropy** as the theoretical minimum number of bits needed to encode a message. For a source that produces symbols with probabilities p1, p2, ..., pn:

```
H = -sum(pi * log2(pi))
```

For a binary source (just 0s and 1s) with probability p of seeing a 1:

```
H = -(p * log2(p) + (1-p) * log2(1-p))
```

Some examples:
- p = 0.5 (fair coin): H = 1.0 bit per symbol — maximum uncertainty
- p = 0.1 (rare 1s): H = 0.47 bits per symbol — mostly 0s, very predictable
- p = 0.0 (all zeros): H = 0.0 bits per symbol — no information at all

This means if your data is 90% zeros, you theoretically need less than half a bit per cell. Fixed-length encoding (1 bit per cell) wastes more than half the space.

### Conditional Entropy and Context

Entropy drops further when symbols are **correlated**. If knowing the previous bit helps predict the next one, the **conditional entropy** H(X|context) < H(X).

In a beat pattern, if step 4 is a kick, step 5 is very likely NOT a kick. The context "previous bit was 1" makes "next bit is 0" more probable. An encoder that tracks these conditional probabilities can exploit this correlation.

### The Source Coding Theorem

Shannon proved that **no lossless encoding can do better than the entropy rate**. This gives us a hard floor — we can measure how close any compressor gets to optimal.

## The Problem

BeatURL stores drum patterns in the URL hash. The grid is 8 tracks x N steps (4 to 256), where each cell is on or off. With metadata (BPM, swing, kit, volumes), we need to pack all of this into a URL that's short enough to share.

### What We're Encoding

```
8 tracks x 256 steps = 2048 binary cells = 256 bytes raw
+ BPM (40-240)
+ Swing (0-80)
+ Kit (6 options)
+ 8 volume levels (0-100 each)
```

A naive encoding at max grid size would be 256+ bytes, which base64url-expands to 342+ characters. The old hex-per-row format with dot separators was even worse: 515 characters for a 236-step beat.

## Algorithms We Tested

### 1. Raw Bitpacking

The simplest approach: pack each cell as one bit, 8 cells per byte.

- 8 x 16 grid = 16 bytes
- 8 x 256 grid = 256 bytes
- No compression at all — every cell costs exactly 1 bit regardless of content

### 2. Run-Length Encoding (RLE)

Encode consecutive runs of 0s and 1s as (value, count) pairs.

- Works well for long runs (e.g., an empty track is just "0, 256")
- Terrible for beat patterns — a typical kick pattern like `1000100010001000` has short alternating runs
- A 16-step beat encoded to 66 bytes (worse than raw!)

### 3. Deflate (zlib) and Brotli

General-purpose compressors used in HTTP, ZIP files, etc.

- Deflate uses LZ77 (sliding window dictionary) + Huffman coding
- Brotli adds a pre-built dictionary and context modeling
- Both have significant **framing overhead** — headers, Huffman tables, block markers
- At our data sizes (16-256 bytes), this overhead dominates

Results on a real 16-step beat:
- Deflate: 31 bytes (worse than raw 16 bytes!)
- Brotli: 23 bytes (still worse than raw)

These compressors are designed for kilobytes-to-megabytes. At our scale, they're anti-compressors.

### 4. Arithmetic Coding

Instead of assigning fixed-length codes (like Huffman), arithmetic coding represents the **entire message as a single number** in the interval [0, 1). Each symbol narrows the interval based on its probability. More probable symbols narrow it less (fewer bits), less probable symbols narrow it more.

The interval shrinks multiplicatively:
```
Start: [0.0, 1.0)
After encoding "0" (prob 0.8): [0.0, 0.8)
After encoding "0" (prob 0.8): [0.0, 0.64)
After encoding "1" (prob 0.2): [0.512, 0.64)
...
```

The final interval width determines how many bits we need to identify a point within it: ceil(-log2(width)) bits. This gets within 1-2 bits of the Shannon entropy.

### 5. Adaptive Arithmetic Coding (What We Use)

"Adaptive" means the probability model **updates as it encodes**. It starts knowing nothing and learns the statistics of the data on the fly. The decoder mirrors the same learning process, so no probability tables need to be stored in the output.

## Context Models We Tested

The **context model** determines what information the encoder uses to predict the next bit. Better predictions = smaller output.

### Order-1: Previous bit

```
Context = previous bit (0 or 1)
2 possible contexts
```

### Order-2: Previous 2 bits (what we chose)

```
Context = prev2 + prev1 (e.g., "01", "10", "00", "11")
4 possible contexts + startup context
```

### Order-3: Previous 3 bits

```
Context = prev3 + prev2 + prev1
8 possible contexts + startup contexts
```

### Period-4: Beat-aligned lookback

```
Context = bit at step (s - 4)
Exploits the musical fact that beats repeat every 4 steps
```

### Period-4+8+prev: Multi-period with local context

```
Context = bit at (s-4) + bit at (s-8) + previous bit
Captures both quarter-note and half-note periodicity
```

### Results on Real Beat Patterns

Grid entropy in bytes (lower = better), grid data only:

```
Pattern               order-1  order-2  order-3  period-4  p4+8+prev  raw
---------------------------------------------------------------------------
Real beat 16-step          12       12       13        13         13    16
4-on-floor 16               9        9       10        10         10    16
4-on-floor 64              22       22       20        19         15    64
4-on-floor 256             76       71       56        57         30   256
Breakbeat 16                9       10       11        11         10    16
Trap 32                    12       12       12        12         13    32
Polyrhythm 128             81       70       60        73         56   128
Empty 16                    6        6        7         8          8    16
Empty 256                   9       10       11        12         12   256
Pseudo-random 64           60       54       33        40         44    64
```

### Key Findings

**No single context model wins everywhere.** The results split by grid size:

**Short grids (4-16 steps):** Order-1 and order-2 are tied or best. Higher-order and period-aware models have too many contexts for the small amount of data — the Laplace prior overhead per context dominates. With only 16 bits per track, there simply isn't enough data to train a complex model.

**Medium grids (32-64 steps):** Order-2 and order-3 do well. Period-4 starts helping on repetitive patterns but hurts on irregular ones.

**Long repetitive grids (128-256 steps):** Period-4+8+prev dominates — it directly encodes the musical structure (beats repeat every 4 steps). A 256-step 4-on-floor pattern compresses to 30 bytes vs 71 for order-2.

**Long non-repetitive grids:** Order-3 edges ahead. For the 236-step hand-drawn beat (non-periodic, 19% density), order-3 achieved 113 bytes vs order-2's 119 — only a 5% improvement.

### Why We Chose Order-2

1. **Best or tied-for-best on short grids** — which is the common case (most beats are 16-32 steps)
2. **Within 5% of optimal on long grids** — the cases where period-aware models win are exactly the cases where order-2 is already very compact
3. **Simple implementation** — one code path, no mode flags, no step-count-dependent branching
4. **Minimal context fragmentation** — only 4 contexts (00, 01, 10, 11) + startup, so the model adapts quickly even on short tracks

The maximum theoretical gain from switching to the best-possible model for each pattern would be ~8 characters on a 236-step beat. Not worth the complexity.

## Implementation Details

### Binary Payload Format

```
Byte 0:    bpm - 40              (0-200, maps to BPM 40-240)
Byte 1:    swing                 (0-80)
Byte 2:    kitIdx | volFlag<<7   (bit 7 = 1 if all volumes are default 80)
Byte 3:    stepCount / 4         (1-64, maps to 4-256 steps)
Bytes 4-11: volumes              (only present if volFlag = 0, each 0-100)
Remaining:  arithmetic-coded grid bitstream
```

The header is 4 bytes when all volumes are default (common case), or 12 bytes with custom volumes.

### Range Coder

We use a 48-bit precision range coder implemented with BigInt. The algorithm maintains an interval [lo, hi) that narrows with each encoded bit:

```
1. Divide the interval proportionally: mid = lo + range * p0 / total
2. If encoding 0: hi = mid
3. If encoding 1: lo = mid
4. Renormalize: shift out MSBs when lo and hi agree on them
```

The "pending bits" mechanism handles the case where lo and hi straddle the midpoint — these bits are deferred until the next unambiguous output.

48-bit precision (vs 32-bit) avoids precision loss during the range * p0 / total calculation, which matters when encoding long sequences.

### Adaptive Model

Each track gets its own context model. The model is a map from context string to [count0, count1]:

```
Context "S"  → [count of 0s, count of 1s] (startup, first 2 bits)
Context "00" → [count of 0s, count of 1s] (after seeing two 0s)
Context "01" → [count of 0s, count of 1s]
Context "10" → [count of 0s, count of 1s]
Context "11" → [count of 0s, count of 1s]
```

Each context starts with a Laplace prior of [1, 1] (equal probability). As bits are encoded, the counts update, and predictions improve. The decoder runs the identical model, updating in the same order, so it stays in sync without any side information.

### Base64url Encoding

The binary payload is encoded as base64url (RFC 4648 Section 5) for URL safety:
- Standard base64 with `+` → `-`, `/` → `_`, padding stripped
- 4:3 expansion ratio (3 bytes → 4 characters)
- Pure JS implementation using `btoa`/`atob` — no dependencies

### Format Detection

Old URLs (hex-per-row with dot separators) are still supported:
- Hash contains `.` → old format decoder
- Hash has no `.` → new arithmetic format decoder

Old URLs auto-convert on load: the app decodes the old format, then re-encodes with the new format, updating the URL bar automatically.

## Compression Results

### Measured on Real Beats

| Beat | Raw bits | Raw bitpack | Arithmetic (order-2) | URL chars |
|------|----------|-------------|---------------------|-----------|
| 16-step pattern | 128 | 16 B | 13 B | 22 |
| 32-step trap | 256 | 32 B | ~12 B | ~22 |
| 64-step periodic | 512 | 64 B | 14 B | 24 |
| 236-step complex | 1888 | 236 B | 119 B | 164 |
| 256-step random | 2048 | 256 B | ~176 B | 240 |
| Empty 16-step | 128 | 16 B | 7 B | 14 |
| Empty 256-step | 2048 | 256 B | ~7 B | 14 |

### Distance from Theoretical Limits

For a real 16-step beat (17% density):
- Shannon entropy floor: ~11 bytes (85 bits)
- Our encoder output: 13 bytes (grid portion)
- Gap: **2 bytes** (1 byte = arithmetic coder flush overhead, ~1 byte = Laplace prior cost on small data)

For a 236-step beat (19% density):
- Shannon entropy floor (order-2): ~112 bytes
- Our encoder output: 119 bytes
- Gap: **7 bytes** (~6% overhead)

### Why Other Compressors Lose

On the 16-step beat (128 bits of grid data):

| Method | Grid bytes | Why |
|--------|-----------|-----|
| **Arithmetic (ours)** | **13** | Near-optimal, ~1 byte flush overhead |
| Raw bitpack | 16 | No compression, 1 bit per cell |
| Brotli (quality 11) | 23 | Dictionary + framing overhead > data |
| Deflate (level 9) | 31 | LZ77 window + Huffman tables > data |
| RLE | 66 | Short alternating runs, 2 bytes per run |

General-purpose compressors break even around 500-1000 bytes of input. Below that, their metadata overhead exceeds the compression savings. Our arithmetic coder has zero framing overhead — the only cost is the ~1 byte flush at the end of the bitstream.

## Further Reading

- [Shannon, "A Mathematical Theory of Communication" (1948)](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf) — the paper that started it all
- [Arithmetic Coding for Data Compression](https://en.wikipedia.org/wiki/Arithmetic_coding) — Wikipedia overview with worked examples
- [Data Compression Explained](http://mattmahoney.net/dc/dce.html) — Matt Mahoney's comprehensive guide covering entropy, Huffman, arithmetic coding, and context modeling
- [Introduction to Data Compression](https://www.cs.cmu.edu/~guyb/realworld/compression.pdf) — CMU lecture notes on the math behind compression
- [Range encoding](https://en.wikipedia.org/wiki/Range_coding) — the practical variant of arithmetic coding we implement (avoids patent issues with the original)
