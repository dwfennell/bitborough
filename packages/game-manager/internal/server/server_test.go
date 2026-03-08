package server

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/rcity/game-manager/internal/features/assets"
	"github.com/rcity/game-manager/internal/features/generation"
	"github.com/rcity/game-manager/internal/storage"
)

func setupTestServer(t *testing.T) (http.Handler, func()) {
	t.Helper()

	tmpDir, err := os.MkdirTemp("", "server-test-*")
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

	assetSvc := assets.NewService(db, tmpDir)
	genSvc := generation.NewService(db, assetSvc, tmpDir)
	srv := New(assetSvc, genSvc, tmpDir)

	cleanup := func() {
		db.Close()
		os.RemoveAll(tmpDir)
	}

	return srv, cleanup
}

func TestAssetAPI(t *testing.T) {
	srv, cleanup := setupTestServer(t)
	defer cleanup()

	// Create asset
	body := `{"name":"Test Asset","category":"terrain","filename":"test.png"}`
	req := httptest.NewRequest("POST", "/api/assets", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
	}

	var created map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &created); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	id := created["id"].(string)
	if id == "" {
		t.Fatal("expected non-empty id")
	}

	// Get asset
	req = httptest.NewRequest("GET", "/api/assets/"+id, nil)
	w = httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var fetched map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &fetched); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if fetched["name"] != "Test Asset" {
		t.Errorf("expected name 'Test Asset', got '%v'", fetched["name"])
	}

	// List assets
	req = httptest.NewRequest("GET", "/api/assets", nil)
	w = httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var list []map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &list); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if len(list) != 1 {
		t.Errorf("expected 1 asset, got %d", len(list))
	}

	// Update asset
	body = `{"name":"Updated Asset"}`
	req = httptest.NewRequest("PUT", "/api/assets/"+id, bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	// Delete asset (need to create the file first so delete doesn't fail)
	req = httptest.NewRequest("DELETE", "/api/assets/"+id, nil)
	w = httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d: %s", w.Code, w.Body.String())
	}
}

func TestGenerationAPI(t *testing.T) {
	srv, cleanup := setupTestServer(t)
	defer cleanup()

	// Create generation
	body := `{"prompt":"A test tile","width":512,"height":512}`
	req := httptest.NewRequest("POST", "/api/generations", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
	}

	var created map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &created); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	id := created["id"].(string)
	if created["status"] != "pending" {
		t.Errorf("expected status 'pending', got '%v'", created["status"])
	}

	// Get generation
	req = httptest.NewRequest("GET", "/api/generations/"+id, nil)
	w = httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	// List generations
	req = httptest.NewRequest("GET", "/api/generations", nil)
	w = httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var list []map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &list); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if len(list) != 1 {
		t.Errorf("expected 1 generation, got %d", len(list))
	}
}

func TestTemplateAPI(t *testing.T) {
	srv, cleanup := setupTestServer(t)
	defer cleanup()

	// Create template
	body := `{"name":"Base Terrain","category":"terrain","prompt":"top-down, seamless"}`
	req := httptest.NewRequest("POST", "/api/templates", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
	}

	// List templates
	req = httptest.NewRequest("GET", "/api/templates", nil)
	w = httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var list []map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &list); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if len(list) != 1 {
		t.Errorf("expected 1 template, got %d", len(list))
	}
}

func TestCORS(t *testing.T) {
	srv, cleanup := setupTestServer(t)
	defer cleanup()

	req := httptest.NewRequest("OPTIONS", "/api/assets", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	req.Header.Set("Access-Control-Request-Method", "POST")
	w := httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Header().Get("Access-Control-Allow-Origin") != "http://localhost:5173" {
		t.Errorf("expected CORS header, got '%s'", w.Header().Get("Access-Control-Allow-Origin"))
	}
}
