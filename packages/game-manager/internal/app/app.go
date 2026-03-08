package app

import (
	"context"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/bitborough/game-manager/internal/features/assets"
	"github.com/bitborough/game-manager/internal/features/generation"
	"github.com/bitborough/game-manager/internal/server"
	"github.com/bitborough/game-manager/internal/storage"
)

type Config struct {
	Addr      string
	DBPath    string
	AssetsDir string
}

type App struct {
	config     Config
	db         *storage.DB
	httpServer *http.Server
	genService *generation.Service
}

func New(cfg Config) (*App, error) {
	// Ensure directories exist
	if err := os.MkdirAll(filepath.Dir(cfg.DBPath), 0755); err != nil {
		return nil, err
	}
	if err := os.MkdirAll(cfg.AssetsDir, 0755); err != nil {
		return nil, err
	}

	// Initialize database
	db, err := storage.New(cfg.DBPath)
	if err != nil {
		return nil, err
	}

	if err := db.Migrate(); err != nil {
		return nil, err
	}

	// Initialize services
	assetService := assets.NewService(db, cfg.AssetsDir)
	genService := generation.NewService(db, assetService, cfg.AssetsDir)

	// Create HTTP server
	srv := server.New(assetService, genService, cfg.AssetsDir)

	return &App{
		config: cfg,
		db:     db,
		httpServer: &http.Server{
			Addr:    cfg.Addr,
			Handler: srv,
		},
		genService: genService,
	}, nil
}

func (a *App) Run() error {
	// Start generation worker
	go a.genService.StartWorker()

	return a.httpServer.ListenAndServe()
}

func (a *App) Shutdown() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	a.genService.Stop()

	if err := a.httpServer.Shutdown(ctx); err != nil {
		return err
	}

	return a.db.Close()
}
