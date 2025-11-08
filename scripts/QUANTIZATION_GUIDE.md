# Quantization Formats Guide

This document lists all supported quantization formats in the LLM Helper model discovery tool.

## GGUF/GGML Quantization Formats

GGUF (and older GGML) formats are the most common for local LLM inference with llama.cpp and Ollama.

### 2-bit Quantization
- **Q2_K** - Extreme compression, lowest quality (2.5 bits/param)
  - Use for: Very large models (70B+) on limited hardware
  - Trade-off: Significant quality loss

### 3-bit Quantization
- **Q3_K_S** - Small, aggressive compression (3.0 bits/param)
- **Q3_K_M** - Medium, balanced 3-bit (3.5 bits/param)
- **Q3_K_L** - Large, higher quality 3-bit (3.75 bits/param)
  - Use for: Large models (40B+) when 4-bit won't fit
  - Trade-off: Moderate quality loss

### 4-bit Quantization (Most Popular)
- **Q4_0** - Legacy 4-bit format (4.0 bits/param)
- **Q4_1** - Improved 4-bit format (4.5 bits/param)
- **Q4_K_S** - Small, fast 4-bit (4.0 bits/param)
- **Q4_K_M** - Medium, recommended 4-bit (4.5 bits/param) ⭐ **RECOMMENDED**
  - Use for: Most models, best quality/size balance
  - Trade-off: Minimal quality loss, excellent compression

### 5-bit Quantization
- **Q5_0** - Legacy 5-bit format (5.0 bits/param)
- **Q5_1** - Improved 5-bit format (5.5 bits/param)
- **Q5_K_S** - Small 5-bit (5.0 bits/param)
- **Q5_K_M** - Medium 5-bit (5.5 bits/param) ⭐ **HIGH QUALITY**
  - Use for: When you want better quality than Q4
  - Trade-off: Larger file size, better quality

### 6-bit Quantization
- **Q6_K** - High quality 6-bit (6.5 bits/param)
  - Use for: When quality is more important than size
  - Trade-off: Larger files, near-original quality

### 8-bit Quantization
- **Q8_0** - 8-bit quantization (8.5 bits/param)
  - Use for: When you need maximum quality with quantization
  - Trade-off: Large files, minimal quality loss

## Standard Precision Formats

### Full Precision
- **FP32** - 32-bit floating point (32 bits/param)
  - Original model precision, largest size
- **FP16** - 16-bit floating point (16 bits/param) ⭐ **FULL QUALITY**
  - Standard for modern models, no quality loss
- **BF16** - BFloat16 (16 bits/param)
  - Better range than FP16, used in training

### Integer Quantization
- **INT8** - 8-bit integer (8 bits/param)
  - Good for inference acceleration
- **INT4** - 4-bit integer (4 bits/param)
  - Aggressive compression

## Advanced Quantization Methods

### AWQ (Activation-aware Weight Quantization)
- **AWQ** - 4-bit AWQ (4.0 bits/param)
- **W4A16** - 4-bit weights, 16-bit activations (4.5 bits/param)
  - Use for: GPU inference with quality focus
  - Better quality than standard 4-bit

### GPTQ (Post-Training Quantization)
- **GPTQ** - General GPTQ format (4.0 bits/param)
- **GPTQ-4bit** - 4-bit GPTQ (4.0 bits/param)
- **GPTQ-8bit** - 8-bit GPTQ (8.0 bits/param)
  - Use for: GPU inference, good quality/speed
  - Requires GPTQ-compatible inference

### Unquantized
- **Full** / **full** - Full precision (16 bits/param)
- **None** / **none** - No quantization (16 bits/param)

## Size Recommendations by Model

### Small Models (< 3B parameters)
- **Recommended**: Q4_K_M, Q5_K_M, Q8_0
- **Reasoning**: Small models compress well, fewer options needed

### Medium Models (3-10B parameters)
- **Recommended**: Q4_0, Q4_K_M, Q5_K_M, Q8_0
- **Reasoning**: Most popular size range, standard options

### Large Models (10-20B parameters)
- **Recommended**: Q3_K_M, Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0
- **Reasoning**: Need aggressive compression options for VRAM constraints

### Very Large Models (20-40B parameters)
- **Recommended**: Q2_K, Q3_K_M, Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0
- **Reasoning**: Q2_K enables running on consumer hardware

### Extra Large Models (40B+ parameters)
- **Recommended**: Q2_K, Q3_K_S, Q3_K_M, Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0
- **Reasoning**: Full range with S/M variants for fine-tuning

## Quick Selection Guide

| Priority | 7B Model | 13B Model | 30B Model | 70B Model |
|----------|----------|-----------|-----------|-----------|
| **Max Quality** | Q8_0 (8.5GB) | Q8_0 (14GB) | Q6_K (25GB) | Q5_K_M (45GB) |
| **Balanced** | Q5_K_M (5.6GB) | Q5_K_M (9.6GB) | Q4_K_M (18GB) | Q4_K_M (35GB) |
| **Max Compression** | Q4_K_M (4.7GB) | Q4_0 (7GB) | Q3_K_M (13GB) | Q2_K (22GB) |

## VRAM Requirements (Approximate)

| Quantization | 7B Model | 13B Model | 30B Model | 70B Model |
|--------------|----------|-----------|-----------|-----------|
| Q2_K | 4 GB | 5 GB | 10 GB | 22 GB |
| Q3_K_M | 5 GB | 7 GB | 13 GB | 29 GB |
| Q4_0 | 5 GB | 7 GB | 15 GB | 35 GB |
| Q4_K_M | 6 GB | 9 GB | 18 GB | 40 GB |
| Q5_K_M | 7 GB | 12 GB | 21 GB | 50 GB |
| Q6_K | 8 GB | 13 GB | 25 GB | 57 GB |
| Q8_0 | 9 GB | 18 GB | 32 GB | 75 GB |
| FP16 | 14 GB | 26 GB | 60 GB | 140 GB |

## Tips

1. **Start with Q4_K_M** - Best balance for most use cases
2. **Use Q5_K_M** if you have extra VRAM and want better quality
3. **Try Q3_K_M** for large models on limited hardware
4. **Avoid Q2_K** unless absolutely necessary (significant quality loss)
5. **Q8_0 is near-identical** to FP16 for most tasks
6. **AWQ/GPTQ** require specific inference engines but offer better quality at same size

## Validation

All formats listed above are validated by the model discovery tool. The validator accepts:
- GGUF formats: Q2-Q8 with K variants (S/M/L)
- Standard formats: FP16, FP32, BF16, INT4, INT8
- Advanced formats: AWQ, GPTQ with variants
- Special cases: Full, None (both case-insensitive)
