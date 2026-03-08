package assets

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/rcity/game-manager/internal/storage"
)

func setupTestDB(t *testing.T) (*storage.DB, string, func()) {
	t.Helper()

	tmpDir, err := os.MkdirTemp("", "assets-test-*")
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

	svc := NewService(db, tmpDir)
	ctx := context.Background()

	asset, err := svc.Create(ctx, CreateRequest{
		Name:     "Test Tile",
		Category: "terrain",
		Filename: "test.png",
		Width:    512,
		Height:   512,
		Tags:     []string{"grass", "green"},
		Prompt:   "A grass tile",
	})
	if err != nil {
		t.Fatalf("create asset: %v", err)
	}

	if asset.Name != "Test Tile" {
		t.Errorf("expected name 'Test Tile', got '%s'", asset.Name)
	}
	if asset.Category != "terrain" {
		t.Errorf("expected category 'terrain', got '%s'", asset.Category)
	}
	if len(asset.Tags) != 2 {
		t.Errorf("expected 2 tags, got %d", len(asset.Tags))
	}
}

func TestService_List(t *testing.T) {
	db, tmpDir, cleanup := setupTestDB(t)
	defer cleanup()

	svc := NewService(db, tmpDir)
	ctx := context.Background()

	// Create test assets
	_, err := svc.Create(ctx, CreateRequest{
		Name:     "Grass",
		Category: "terrain",
		Filename: "grass.png",
		Tags:     []string{"grass"},
	})
	if err != nil {
		t.Fatalf("create asset 1: %v", err)
	}

	_, err = svc.Create(ctx, CreateRequest{
		Name:     "House",
		Category: "building",
		Filename: "house.png",
		Tags:     []string{"house"},
	})
	if err != nil {
		t.Fatalf("create asset 2: %v", err)
	}

	// Test list all
	assets, err := svc.List(ctx, "", "")
	if err != nil {
		t.Fatalf("list all: %v", err)
	}
	if len(assets) != 2 {
		t.Errorf("expected 2 assets, got %d", len(assets))
	}

	// Test filter by category
	assets, err = svc.List(ctx, "terrain", "")
	if err != nil {
		t.Fatalf("list terrain: %v", err)
	}
	if len(assets) != 1 {
		t.Errorf("expected 1 terrain asset, got %d", len(assets))
	}

	// Test search
	assets, err = svc.List(ctx, "", "grass")
	if err != nil {
		t.Fatalf("search grass: %v", err)
	}
	if len(assets) != 1 {
		t.Errorf("expected 1 result for 'grass', got %d", len(assets))
	}
}

func TestService_Update(t *testing.T) {
	db, tmpDir, cleanup := setupTestDB(t)
	defer cleanup()

	svc := NewService(db, tmpDir)
	ctx := context.Background()

	asset, err := svc.Create(ctx, CreateRequest{
		Name:     "Original",
		Category: "terrain",
		Filename: "test.png",
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	newName := "Updated"
	newTags := []string{"updated", "tag"}
	updated, err := svc.Update(ctx, asset.ID, UpdateRequest{
		Name: &newName,
		Tags: &newTags,
	})
	if err != nil {
		t.Fatalf("update: %v", err)
	}

	if updated.Name != "Updated" {
		t.Errorf("expected name 'Updated', got '%s'", updated.Name)
	}
	if len(updated.Tags) != 2 {
		t.Errorf("expected 2 tags, got %d", len(updated.Tags))
	}
}

func TestService_Delete(t *testing.T) {
	db, tmpDir, cleanup := setupTestDB(t)
	defer cleanup()

	svc := NewService(db, tmpDir)
	ctx := context.Background()

	// Create a test file
	testFile := filepath.Join(tmpDir, "delete-test.png")
	if err := os.WriteFile(testFile, []byte("test"), 0644); err != nil {
		t.Fatalf("create test file: %v", err)
	}

	asset, err := svc.Create(ctx, CreateRequest{
		Name:     "ToDelete",
		Category: "terrain",
		Filename: "delete-test.png",
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	err = svc.Delete(ctx, asset.ID)
	if err != nil {
		t.Fatalf("delete: %v", err)
	}

	// Verify asset is gone
	_, err = svc.Get(ctx, asset.ID)
	if err == nil {
		t.Error("expected error getting deleted asset")
	}

	// Verify file is gone
	if _, err := os.Stat(testFile); !os.IsNotExist(err) {
		t.Error("expected file to be deleted")
	}
}
