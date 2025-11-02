# GPU Detection Strategy

## Overview

The LLM Helper now uses a comprehensive GPU database to accurately detect VRAM for both discrete and integrated GPUs.

## Architecture

### 1. GPU Database (`/public/data/gpu_database.json`)
- **Source**: Generated from `gpu_list.csv` (127 GPU entries)
- **Coverage**:
  - NVIDIA: RTX 50/40/30/20 series, GTX 16/10 series
  - AMD: Radeon RX 7000/6000/5000 series, integrated graphics
  - Intel: Arc series (discrete & mobile), Iris Xe, UHD Graphics
  - Covers both discrete and integrated GPUs

### 2. Detection Flow

```
1. Load GPU Database → 2. Detect System RAM → 3. Detect GPU Model → 4. Match to Database → 5. Calculate VRAM
```

#### Step 1: Load GPU Database
- Database loaded from `/data/gpu_database.json`
- Cached in memory after first load

#### Step 2: Detect System RAM
- Uses `navigator.deviceMemory` API
- **Critical for integrated GPUs** - used to calculate available VRAM

#### Step 3: Detect GPU Model
- **Primary**: WebGPU API (`navigator.gpu.requestAdapter()`)
  - Modern API with better GPU information
  - Returns detailed adapter info
- **Fallback**: WebGL API (`WEBGL_debug_renderer_info` extension)
  - Older but widely supported
  - Returns renderer string

#### Step 4: Match to Database
Fuzzy matching algorithm in `findGPUSpec()`:
1. Try exact match (manufacturer + model)
2. Try partial match (model name only)
3. Fall back to pattern matching if no database match

#### Step 5: Calculate VRAM

**For Discrete GPUs:**
- Use database value directly
- If multiple VRAM options exist (e.g., "8 GB / 16 GB"), use the highest value

**For Integrated GPUs (Shared Memory):**
Uses dynamic calculation based on system RAM:

| GPU Tier | Examples | VRAM Calculation | Max VRAM |
|----------|----------|------------------|----------|
| High-end | AMD 780M, 890M, 880M, Intel Iris Xe | 50% of system RAM | 16 GB |
| Mid-range | AMD 680M, 760M, 660M, Vega | 40% of system RAM | 12 GB |
| Basic | Intel UHD, HD Graphics | 25% of system RAM | 8 GB |
| Unknown iGPU | Generic integrated | 30% of system RAM | 8 GB |

**Example**: AMD Radeon 890M with 64GB system RAM
- Calculation: `min(64 * 0.5, 16) = 16 GB VRAM`

## Integrated GPU Strategy

### Why Percentage-Based?

Integrated GPUs dynamically share system RAM, so VRAM depends on:
1. Total system RAM available
2. GPU's memory controller capabilities
3. Operating system allocation policies

### Conservative Approach

We use conservative percentages to ensure:
- Models recommended will actually run
- User doesn't run out of system memory
- Room for OS and other applications

### Real-World Example

**User's System**: AMD Radeon 890M + 64GB RAM

**Old Behavior**:
- No database match → 0 GB VRAM
- No model recommendations

**New Behavior**:
- Database recognizes "Radeon 890M" as integrated
- Calculates: `min(64 * 0.5, 16) = 16 GB VRAM`
- Recommendations include:
  - Phi-3 Mini (Q4_K_M - 3GB VRAM)
  - Mistral 7B (Q4_K_M - 5GB VRAM)
  - Llama 3 8B (Q4_K_M - 6GB VRAM)
  - DeepSeek Coder (Q4_K_M - 5GB VRAM)

## Fallback Mechanisms

### Level 1: Database Match
Best accuracy - GPU found in database

### Level 2: Pattern Matching
Regex patterns for common GPUs (in `gpuDatabase.ts`)
- NVIDIA RTX series
- AMD RX series
- Apple Silicon (M1/M2/M3)

### Level 3: Type Detection
If GPU name includes keywords:
- "integrated", "intel", "uhd", "iris", "angle" → 8 GB (integrated)
- Unknown discrete GPU → 6 GB (conservative)

## Maintaining the Database

### Adding New GPUs

1. Edit `public/data/gpu_list.csv`
2. Add entry: `Manufacturer,Model,Type,VRAM_Amount_GB`
3. Regenerate JSON:
```bash
node -e "/* see script in gpuDatabase.ts parseGPUCSV() */"
```

### CSV Format

```csv
Manufacturer,Model,Type,VRAM_Amount_GB
NVIDIA,GeForce RTX 4090,Discrete,24 GB
AMD,Radeon 890M,Integrated,"Shared (Dynamically uses System RAM)"
Intel,Arc A770,Discrete,8 GB / 16 GB
```

**Types**:
- `Discrete`: Dedicated GPU with fixed VRAM
- `Integrated`: Shared memory GPU

**VRAM Formats**:
- Single value: `24 GB`
- Multiple options: `8 GB / 16 GB` (we use the max)
- Shared memory: `"Shared (Dynamically uses System RAM)"`

## Benefits

✅ **Accurate Detection**: 127 GPUs covered
✅ **Integrated GPU Support**: Dynamic VRAM calculation based on system RAM
✅ **Graceful Fallbacks**: Multiple detection levels ensure we always provide a value
✅ **Easy Maintenance**: Update CSV, regenerate JSON
✅ **Future-Proof**: Easy to add new GPUs as they're released

## Browser Compatibility

| API | Support | Fallback |
|-----|---------|----------|
| WebGPU | Chrome 113+, Edge 113+ | WebGL |
| WebGL | All modern browsers | Conservative estimate |
| `navigator.deviceMemory` | Chrome, Edge | Manual input |

## Privacy & Security

- All detection runs client-side
- No GPU data sent to external servers
- Uses standard browser APIs only
- Manual override always available
