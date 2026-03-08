# Game Manager App - Design Document

A lightweight webapp for managing RCity content and development.

---

## First Feature: Asset Generation & Library

Start with one thing and do it well: generate tiles with `img` and organize them into a usable asset library.

### User Stories (V1)

1. **Generate a tile** - Enter a prompt, set parameters, generate an image
2. **View generation** - See the result, compare to existing tiles
3. **Accept/reject** - Curate what goes into the library
4. **Browse library** - Filter and search existing assets
5. **Organize assets** - Tag, categorize, group variants
6. **Export for game** - Download assets or sprite sheets

---

## Architecture Principles

### 1. Feature Modules
Each feature is a self-contained module with its own:
- API routes
- Database schema (migrations)
- Frontend components
- Business logic

New features plug in without touching core infrastructure.

### 2. Event-Driven Core
Features communicate through events, not direct calls:
```
AssetGenerated → triggers → UpdateLibrary, NotifyUI
SpriteSheetBuilt → triggers → UpdateManifest
```

Enables loose coupling and future webhooks/automation.

### 3. File-First Storage
Assets are files on disk, not blobs in DB. Database stores metadata and relationships. This keeps things:
- Git-friendly (can version assets)
- Inspectable (browse filesystem directly)
- Portable (copy folder = backup)

### 4. API-First
All functionality exposed via REST/JSON API. Frontend is just one client. Enables:
- CLI tools
- Automation scripts
- Future integrations

---

## Tech Stack Recommendation

### Backend: **Go**

Why Go:
- Single binary deployment (no runtime deps)
- Fast startup, low memory
- Excellent for CLI + web hybrid (can shell out to `img`)
- Strong stdlib for HTTP, JSON, file handling
- Easy concurrency for background generation jobs

Alternatives considered:
- Node/TS: Shares language with frontend, but heavier runtime
- Python: Fast to write, but deployment more complex
- Rust: Overkill for this, slower iteration

### Database: **SQLite**

Why SQLite:
- Single file, zero config
- Excellent query performance for this scale
- Portable (copy file = backup)
- Full SQL for complex queries
- Good tooling (DB Browser, CLI)

Schema lives alongside code, migrations tracked in git.

### File Storage: **Local Filesystem**

Structure mirrors asset organization:
```
data/
├── rcity.db              # SQLite database
├── assets/
│   ├── raw/              # Generated images at full res
│   ├── processed/        # Resized, optimized
│   └── sheets/           # Packed sprite sheets
└── exports/              # Downloadable bundles
```

Future: Abstract to support S3-compatible storage if needed.

### Frontend: **Vite + TypeScript + Preact**

Why Preact over React:
- 3KB vs 40KB
- Same API (React compat)
- Matches "lightweight" goal

Styling: Tailwind CSS (utility-first, fast iteration)

---

## Project Structure

```
game-manager/
├── cmd/
│   └── server/
│       └── main.go           # Entry point
├── internal/
│   ├── app/
│   │   └── app.go            # App initialization, DI
│   ├── config/
│   │   └── config.go         # Configuration loading
│   ├── server/
│   │   ├── server.go         # HTTP server setup
│   │   ├── middleware.go     # Logging, CORS, auth
│   │   └── routes.go         # Route registration
│   ├── events/
│   │   └── bus.go            # Event bus implementation
│   ├── storage/
│   │   ├── db.go             # SQLite connection
│   │   ├── files.go          # File storage abstraction
│   │   └── migrations/       # SQL migration files
│   │
│   └── features/             # Feature modules
│       ├── assets/
│       │   ├── routes.go     # HTTP handlers
│       │   ├── service.go    # Business logic
│       │   ├── models.go     # Data structures
│       │   ├── repo.go       # Database queries
│       │   └── schema.sql    # Table definitions
│       │
│       ├── generation/
│       │   ├── routes.go
│       │   ├── service.go    # Calls img CLI
│       │   ├── queue.go      # Background job queue
│       │   └── schema.sql
│       │
│       └── sheets/           # (Future) Sprite sheet builder
│           └── ...
│
├── web/                      # Frontend (Vite project)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── api/              # API client
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── assets/
│   │   │   └── generation/
│   │   └── stores/           # State management
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── data/                     # Runtime data (gitignored)
│   ├── rcity.db
│   └── assets/
│
├── Makefile                  # Build, run, migrate commands
├── go.mod
└── README.md
```

---

## Database Schema (V1)

### assets
```sql
CREATE TABLE assets (
    id TEXT PRIMARY KEY,           -- e.g., "terrain.grass.01"
    category TEXT NOT NULL,        -- terrain, building, vehicle, etc.
    subcategory TEXT,              -- residential, commercial, etc.
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected

    -- File references
    raw_path TEXT,                 -- path to raw generated image
    processed_path TEXT,           -- path to processed image

    -- Metadata
    width INTEGER,
    height INTEGER,
    tags TEXT,                     -- JSON array

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_category ON assets(category, subcategory);
CREATE INDEX idx_assets_status ON assets(status);
```

### generations
```sql
CREATE TABLE generations (
    id TEXT PRIMARY KEY,           -- UUID
    asset_id TEXT REFERENCES assets(id),

    -- Generation params (for reproducibility)
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    seed INTEGER,
    width INTEGER,
    height INTEGER,
    style TEXT,
    steps INTEGER,
    guidance REAL,

    -- Execution
    status TEXT DEFAULT 'pending', -- pending, running, completed, failed
    started_at DATETIME,
    completed_at DATETIME,
    error TEXT,

    -- Result
    output_path TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generations_status ON generations(status);
CREATE INDEX idx_generations_asset ON generations(asset_id);
```

### tags
```sql
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE asset_tags (
    asset_id TEXT REFERENCES assets(id),
    tag_id INTEGER REFERENCES tags(id),
    PRIMARY KEY (asset_id, tag_id)
);
```

---

## API Design (V1)

### Assets

```
GET    /api/assets              # List assets (with filters)
GET    /api/assets/:id          # Get single asset
POST   /api/assets              # Create asset entry
PATCH  /api/assets/:id          # Update asset (status, tags, etc.)
DELETE /api/assets/:id          # Delete asset

GET    /api/assets/:id/image    # Serve asset image
GET    /api/assets/:id/variants # Get related variants
```

### Generation

```
POST   /api/generate            # Queue a generation job
GET    /api/generate/:id        # Get job status
GET    /api/generate/:id/result # Get generated image
DELETE /api/generate/:id        # Cancel job

GET    /api/generate/queue      # List pending/running jobs
```

### Presets (for consistent generation)

```
GET    /api/presets             # List style presets
POST   /api/presets             # Create preset
PATCH  /api/presets/:id         # Update preset
DELETE /api/presets/:id         # Delete preset
```

---

## Event System

Simple in-process event bus for V1. Can evolve to message queue later.

```go
// Event types
type Event interface {
    Name() string
}

type AssetCreated struct {
    AssetID string
}

type GenerationCompleted struct {
    GenerationID string
    AssetID      string
    Success      bool
}

// Bus interface
type EventBus interface {
    Publish(event Event)
    Subscribe(eventName string, handler func(Event))
}
```

### Event Flow Example

```
User clicks "Generate"
    → POST /api/generate
    → GenerationQueued event
    → Queue picks up job
    → Runs `img` CLI
    → GenerationCompleted event
    → Asset updated with new image
    → AssetUpdated event
    → WebSocket pushes to UI
    → UI refreshes preview
```

---

## Frontend Architecture

### State Management

Use Zustand (lightweight) or vanilla Preact signals:

```typescript
// stores/assets.ts
interface AssetStore {
    assets: Asset[];
    loading: boolean;
    filters: AssetFilters;

    fetchAssets: () => Promise<void>;
    updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
    setFilters: (filters: AssetFilters) => void;
}
```

### Component Structure

```
components/
├── common/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── MainContent.tsx
└── features/
    ├── assets/
    │   ├── AssetGrid.tsx
    │   ├── AssetCard.tsx
    │   ├── AssetDetail.tsx
    │   └── AssetFilters.tsx
    └── generation/
        ├── GenerateForm.tsx
        ├── GenerationQueue.tsx
        └── GenerationPreview.tsx
```

### Real-time Updates

WebSocket connection for live updates:

```typescript
// Receive generation progress, new assets, etc.
ws.onmessage = (event) => {
    const { type, payload } = JSON.parse(event.data);
    switch (type) {
        case 'generation:progress':
            updateGenerationProgress(payload);
            break;
        case 'asset:created':
            addAssetToLibrary(payload);
            break;
    }
};
```

---

## Generation Service

The bridge to `img` CLI:

```go
type GenerationService struct {
    queue    chan GenerationJob
    workers  int
    imgPath  string
    outputDir string
}

func (s *GenerationService) Generate(params GenerationParams) (string, error) {
    // Build command
    args := []string{
        params.Prompt,
        "--width", strconv.Itoa(params.Width),
        "--height", strconv.Itoa(params.Height),
        "--seed", strconv.Itoa(params.Seed),
        "--output", outputPath,
    }

    if params.NegativePrompt != "" {
        args = append(args, "--negative", params.NegativePrompt)
    }

    if params.Style != "" {
        args = append(args, "--style", params.Style)
    }

    // Execute
    cmd := exec.Command(s.imgPath, args...)
    output, err := cmd.CombinedOutput()

    // Handle result...
}
```

### Queue System

Simple in-memory queue for V1:

```go
type GenerationQueue struct {
    jobs     chan *GenerationJob
    results  map[string]*GenerationResult
    mu       sync.RWMutex
}

func (q *GenerationQueue) Submit(job *GenerationJob) string {
    job.ID = uuid.New().String()
    job.Status = "pending"
    q.jobs <- job
    return job.ID
}

func (q *GenerationQueue) Worker() {
    for job := range q.jobs {
        job.Status = "running"
        result := q.service.Generate(job.Params)
        job.Status = "completed"
        q.eventBus.Publish(GenerationCompleted{...})
    }
}
```

---

## Configuration

```yaml
# config.yaml
server:
  port: 8080
  host: "127.0.0.1"

database:
  path: "./data/rcity.db"

storage:
  assets_dir: "./data/assets"
  exports_dir: "./data/exports"

generation:
  img_path: "img"              # Path to img CLI
  workers: 2                   # Concurrent generations
  default_width: 256
  default_height: 256
  default_seed: 42

presets:
  terrain:
    style: "top-down game tile, flat colors, seamless"
    negative: "blurry, text, watermark, 3D render, isometric"
  building:
    style: "top-down game tile, flat colors, clean edges"
    negative: "blurry, text, watermark, 3D render, isometric"
```

---

## Development Workflow

### Commands

```makefile
# Makefile

.PHONY: dev build migrate

# Run backend + frontend in dev mode
dev:
	@echo "Starting backend..."
	go run ./cmd/server &
	@echo "Starting frontend..."
	cd web && npm run dev

# Build production
build:
	go build -o bin/game-manager ./cmd/server
	cd web && npm run build

# Run database migrations
migrate:
	go run ./cmd/migrate

# Generate a test tile
test-generate:
	curl -X POST http://localhost:8080/api/generate \
		-H "Content-Type: application/json" \
		-d '{"prompt": "grass terrain", "preset": "terrain"}'
```

---

## Future Features (Pluggable)

Each as a new feature module:

| Feature | Module | Depends On |
|---------|--------|------------|
| Sprite sheet packer | `features/sheets` | assets |
| Map editor | `features/maps` | assets, sheets |
| Scenario builder | `features/scenarios` | maps |
| Style presets | `features/presets` | generation |
| Asset comparison | `features/compare` | assets |
| Export bundles | `features/export` | assets, sheets |
| Version history | `features/history` | assets |

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Project setup (Go mod, Vite, folder structure)
- [ ] SQLite connection + migrations
- [ ] Basic HTTP server with CORS
- [ ] Asset CRUD API
- [ ] Minimal frontend: list assets

### Phase 2: Generation (Week 2)
- [ ] Generation service (calls `img`)
- [ ] Job queue (in-memory)
- [ ] Generation API endpoints
- [ ] Frontend: generate form
- [ ] Frontend: generation queue view

### Phase 3: Library UX (Week 3)
- [ ] Asset preview modal
- [ ] Accept/reject workflow
- [ ] Tagging system
- [ ] Filter and search
- [ ] Category organization

### Phase 4: Polish (Week 4)
- [ ] WebSocket for live updates
- [ ] Preset management
- [ ] Comparison view (side-by-side)
- [ ] Basic export (zip download)
- [ ] Error handling & loading states

---

## Open Questions

- [ ] Authentication needed? (probably not for local dev tool)
- [ ] Multi-user support? (probably not V1)
- [ ] Cloud deployment option? (nice to have)
- [ ] Integration with game hot-reload?
