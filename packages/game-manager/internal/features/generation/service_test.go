package generation

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/bitborough/game-manager/internal/features/assets"
	"github.com/bitborough/game-manager/internal/storage"
)

func setupTestDB(t *testing.T) (*storage.DB, string, func()) {
	t.Helper()

	tmpDir, err := os.MkdirTemp("", "generation-test-*")
	if err != nil {
		t.Fatalf("create temp dir: %v", err)
	}

	dbPath := filepath.Join(tmpDir, "test.db")
	db, err := storage.New(dbPath)
	if err != nil {
		os.RemoveAll(tmpDir)
		t.Fatalf("create db: %v", err)
	}

	if err := db.Migrate(); err != nil {
		db.Close()
		os.RemoveAll(tmpDir)
		t.Fatalf("migrate: %v", err)
	}

	cleanup := func() {
		db.Close()
		os.RemoveAll(tmpDir)
	}

	return db, tmpDir, cleanup
}

func TestService_Create(t *testing.T) {
	db, tmpDir, cleanup := setupTestDB(t)
	defer cleanup()

	assetSvc := assets.NewService(db, tmpDir)
	svc := NewService(db, assetSvc, tmpDir)
	ctx := context.Background()

	gen, err := svc.Create(ctx, CreateRequest{
		Prompt:   "A test prompt",
		Width:    512,
		Height:   512,
		Steps:    20,
		Guidance: 7.5,
	})
	if err != nil {
		t.Fatalf("create generation: %v", err)
	}

	if gen.Prompt != "A test prompt" {
		t.Errorf("expected prompt 'A test prompt', got '%s'", gen.Prompt)
	}
	if gen.Status != "pending" {
		t.Errorf("expected status 'pending', got '%s'", gen.Status)
	}
	if gen.Width != 512 {
		t.Errorf("expected width 512, got %d", gen.Width)
	}
}

func TestService_CreateDefaults(t *testing.T) {
	db, tmpDir, cleanup := setupTestDB(t)
	defer cleanup()

	assetSvc := assets.NewService(db, tmpDir)
	svc := NewService(db, assetSvc, tmpDir)
	ctx := context.Background()

	gen, err := svc.Create(ctx, CreateRequest{
		Prompt: "Minimal prompt",
	})
	if err != nil {
		t.Fatalf("create generation: %v", err)
	}

	// Check defaults were applied
	if gen.Width != 512 {
		t.Errorf("expected default width 512, got %d", gen.Width)
	}
	if gen.Height != 512 {
		t.Errorf("expected default height 512, got %d", gen.Height)
	}
	if gen.Steps != 20 {
		t.Errorf("expected default steps 20, got %d", gen.Steps)
	}
	if gen.Guidance != 7.5 {
		t.Errorf("expected default guidance 7.5, got %f", gen.Guidance)
	}
}

func TestService_List(t *testing.T) {
	db, tmpDir, cleanup := setupTestDB(t)
	defer cleanup()

	assetSvc := assets.NewService(db, tmpDir)
	svc := NewService(db, assetSvc, tmpDir)
	ctx := context.Background()

	// Create some generations
	_, err := svc.Create(ctx, CreateRequest{Prompt: "First"})
	if err != nil {
		t.Fatalf("create 1: %v", err)
	}
	_, err = svc.Create(ctx, CreateRequest{Prompt: "Second"})
	if err != nil {
		t.Fatalf("create 2: %v", err)
	}

	gens, err := svc.List(ctx)
	if err != nil {
		t.Fatalf("list: %v", err)
	}

	if len(gens) != 2 {
		t.Errorf("expected 2 generations, got %d", len(gens))
	}

	// Most recent should be first
	if gens[0].Prompt != "Second" {
		t.Errorf("expected 'Second' first, got '%s'", gens[0].Prompt)
	}
}

func TestService_Templates(t *testing.T) {
	db, tmpDir, cleanup := setupTestDB(t)
	defer cleanup()

	assetSvc := assets.NewService(db, tmpDir)
	svc := NewService(db, assetSvc, tmpDir)
	ctx := context.Background()

	tmpl, err := svc.CreateTemplate(ctx, TemplateRequest{
		Name:     "Terrain Base",
		Category: "terrain",
		Prompt:   "top-down view, seamless tile, game asset",
		Style:    "pixel-art",
	})
	if err != nil {
		t.Fatalf("create template: %v", err)
	}

	if tmpl.Name != "Terrain Base" {
		t.Errorf("expected name 'Terrain Base', got '%s'", tmpl.Name)
	}

	templates, err := svc.ListTemplates(ctx)
	if err != nil {
		t.Fatalf("list templates: %v", err)
	}

	if len(templates) != 1 {
		t.Errorf("expected 1 template, got %d", len(templates))
	}
}

func TestSplitTags(t *testing.T) {
	tests := []struct {
		input    string
		expected []string
	}{
		{"grass,dirt,sand", []string{"grass", "dirt", "sand"}},
		{"single", []string{"single"}},
		{"", []string{}},
		{"a, b, c", []string{"a", "b", "c"}},
	}

	for _, tc := range tests {
		result := splitTags(tc.input)
		if len(result) != len(tc.expected) {
			t.Errorf("splitTags(%q): expected %d items, got %d", tc.input, len(tc.expected), len(result))
			continue
		}
		for i, v := range result {
			// Trim spaces for comparison
			if v != tc.expected[i] {
				t.Errorf("splitTags(%q)[%d]: expected %q, got %q", tc.input, i, tc.expected[i], v)
			}
		}
	}
}
