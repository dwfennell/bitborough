.PHONY: dev build clean test run-backend run-frontend

# Development - runs both backend and frontend
dev:
	@echo "Starting development servers..."
	@make -j2 run-backend run-frontend

run-backend:
	@echo "Starting Go backend on :8080..."
	go run ./cmd/server

run-frontend:
	@echo "Starting Vite frontend on :5173..."
	cd web && npm run dev

# Build
build: build-backend build-frontend

build-backend:
	go build -o bin/server ./cmd/server

build-frontend:
	cd web && npm run build

# Install dependencies
deps:
	go mod download
	cd web && npm install

# Test
test:
	go test ./...
	cd web && npm test

# Clean
clean:
	rm -rf bin/
	rm -rf web/dist/

# Database
db-reset:
	rm -f data/game-manager.db
