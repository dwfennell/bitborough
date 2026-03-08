package main

import (
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/bitborough/game-manager/internal/app"
)

func main() {
	addr := flag.String("addr", ":8080", "HTTP server address")
	dbPath := flag.String("db", "data/game-manager.db", "SQLite database path")
	assetsDir := flag.String("assets", "data/assets", "Assets storage directory")
	flag.Parse()

	cfg := app.Config{
		Addr:      *addr,
		DBPath:    *dbPath,
		AssetsDir: *assetsDir,
	}

	application, err := app.New(cfg)
	if err != nil {
		log.Fatalf("failed to create app: %v", err)
	}

	go func() {
		log.Printf("Starting server on %s", cfg.Addr)
		if err := application.Run(); err != nil {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down...")
	if err := application.Shutdown(); err != nil {
		log.Printf("shutdown error: %v", err)
	}
}
