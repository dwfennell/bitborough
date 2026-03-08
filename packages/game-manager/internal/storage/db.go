package storage

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	*sql.DB
}

func New(path string) (*DB, error) {
	db, err := sql.Open("sqlite3", path+"?_foreign_keys=on&_journal_mode=WAL")
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return &DB{db}, nil
}

func (db *DB) Migrate() error {
	migrations := []string{
		migrationAssets,
		migrationPromptTemplates,
		migrationGenerations,
	}

	for _, m := range migrations {
		if _, err := db.Exec(m); err != nil {
			return fmt.Errorf("migration error: %w", err)
		}
	}

	// Run optional migrations that may fail if columns already exist
	for _, m := range migrationsAutoApprove {
		db.Exec(m) // Ignore errors - column may already exist
	}

	return nil
}

const migrationAssets = `
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    filename TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    tags TEXT,
    prompt TEXT,
    negative_prompt TEXT,
    seed INTEGER,
    style TEXT,
    steps INTEGER,
    guidance REAL,
    generation_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);
`

const migrationPromptTemplates = `
CREATE TABLE IF NOT EXISTS prompt_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    style TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prompt_fragments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    fragment TEXT NOT NULL,
    usage TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`

const migrationGenerations = `
CREATE TABLE IF NOT EXISTS generations (
    id TEXT PRIMARY KEY,
    asset_id TEXT,
    template_id TEXT,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    seed INTEGER,
    width INTEGER,
    height INTEGER,
    style TEXT,
    steps INTEGER,
    guidance REAL,
    reference_image TEXT,
    strength REAL,
    status TEXT DEFAULT 'pending',
    output_path TEXT,
    error TEXT,
    auto_approve INTEGER DEFAULT 0,
    auto_name TEXT,
    auto_category TEXT,
    auto_tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (template_id) REFERENCES prompt_templates(id)
);

CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);
`

// Migrations to add auto_approve columns to existing databases (run individually, may fail if exists)
var migrationsAutoApprove = []string{
	`ALTER TABLE generations ADD COLUMN auto_approve INTEGER DEFAULT 0`,
	`ALTER TABLE generations ADD COLUMN auto_name TEXT`,
	`ALTER TABLE generations ADD COLUMN auto_category TEXT`,
	`ALTER TABLE generations ADD COLUMN auto_tags TEXT`,
}
