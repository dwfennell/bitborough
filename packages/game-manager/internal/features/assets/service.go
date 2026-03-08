package assets

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/rcity/game-manager/internal/storage"
)

type Asset struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Category       string   `json:"category"`
	Filename       string   `json:"filename"`
	Width          int      `json:"width,omitempty"`
	Height         int      `json:"height,omitempty"`
	Tags           []string `json:"tags,omitempty"`
	Prompt         string   `json:"prompt,omitempty"`
	NegativePrompt string   `json:"negativePrompt,omitempty"`
	Seed           int64    `json:"seed,omitempty"`
	Style          string   `json:"style,omitempty"`
	Steps          int      `json:"steps,omitempty"`
	Guidance       float64  `json:"guidance,omitempty"`
	GenerationID   string   `json:"generationId,omitempty"`
	CreatedAt      string   `json:"createdAt"`
	UpdatedAt      string   `json:"updatedAt"`
}

type CreateRequest struct {
	Name           string   `json:"name"`
	Category       string   `json:"category"`
	Filename       string   `json:"filename"`
	Width          int      `json:"width,omitempty"`
	Height         int      `json:"height,omitempty"`
	Tags           []string `json:"tags,omitempty"`
	Prompt         string   `json:"prompt,omitempty"`
	NegativePrompt string   `json:"negativePrompt,omitempty"`
	Seed           int64    `json:"seed,omitempty"`
	Style          string   `json:"style,omitempty"`
	Steps          int      `json:"steps,omitempty"`
	Guidance       float64  `json:"guidance,omitempty"`
	GenerationID   string   `json:"generationId,omitempty"`
}

type UpdateRequest struct {
	Name     *string   `json:"name,omitempty"`
	Category *string   `json:"category,omitempty"`
	Tags     *[]string `json:"tags,omitempty"`
}

type Service struct {
	db        *storage.DB
	assetsDir string
}

func NewService(db *storage.DB, assetsDir string) *Service {
	return &Service{db: db, assetsDir: assetsDir}
}

func (s *Service) List(ctx context.Context, category, search string) ([]Asset, error) {
	query := `SELECT id, name, category, filename, width, height, tags,
		prompt, negative_prompt, seed, style, steps, guidance, generation_id,
		created_at, updated_at FROM assets WHERE 1=1`
	args := []any{}

	if category != "" {
		query += " AND category = ?"
		args = append(args, category)
	}
	if search != "" {
		query += " AND (name LIKE ? OR tags LIKE ?)"
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern, searchPattern)
	}

	query += " ORDER BY created_at DESC"

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query assets: %w", err)
	}
	defer rows.Close()

	var assets []Asset
	for rows.Next() {
		var a Asset
		var tags, prompt, negPrompt, style, genID sql.NullString
		var width, height, seed, steps sql.NullInt64
		var guidance sql.NullFloat64

		err := rows.Scan(&a.ID, &a.Name, &a.Category, &a.Filename,
			&width, &height, &tags, &prompt, &negPrompt, &seed, &style,
			&steps, &guidance, &genID, &a.CreatedAt, &a.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("scan asset: %w", err)
		}

		a.Width = int(width.Int64)
		a.Height = int(height.Int64)
		if tags.Valid && tags.String != "" {
			a.Tags = strings.Split(tags.String, ",")
		}
		a.Prompt = prompt.String
		a.NegativePrompt = negPrompt.String
		a.Seed = seed.Int64
		a.Style = style.String
		a.Steps = int(steps.Int64)
		a.Guidance = guidance.Float64
		a.GenerationID = genID.String

		assets = append(assets, a)
	}

	if assets == nil {
		assets = []Asset{}
	}
	return assets, nil
}

func (s *Service) Get(ctx context.Context, id string) (*Asset, error) {
	query := `SELECT id, name, category, filename, width, height, tags,
		prompt, negative_prompt, seed, style, steps, guidance, generation_id,
		created_at, updated_at FROM assets WHERE id = ?`

	var a Asset
	var tags, prompt, negPrompt, style, genID sql.NullString
	var width, height, seed, steps sql.NullInt64
	var guidance sql.NullFloat64

	err := s.db.QueryRowContext(ctx, query, id).Scan(&a.ID, &a.Name, &a.Category, &a.Filename,
		&width, &height, &tags, &prompt, &negPrompt, &seed, &style,
		&steps, &guidance, &genID, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}

	a.Width = int(width.Int64)
	a.Height = int(height.Int64)
	if tags.Valid && tags.String != "" {
		a.Tags = strings.Split(tags.String, ",")
	}
	a.Prompt = prompt.String
	a.NegativePrompt = negPrompt.String
	a.Seed = seed.Int64
	a.Style = style.String
	a.Steps = int(steps.Int64)
	a.Guidance = guidance.Float64
	a.GenerationID = genID.String

	return &a, nil
}

func (s *Service) Create(ctx context.Context, req CreateRequest) (*Asset, error) {
	id := uuid.New().String()
	now := time.Now().UTC().Format(time.RFC3339)
	tags := strings.Join(req.Tags, ",")

	query := `INSERT INTO assets (id, name, category, filename, width, height, tags,
		prompt, negative_prompt, seed, style, steps, guidance, generation_id, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := s.db.ExecContext(ctx, query, id, req.Name, req.Category, req.Filename,
		req.Width, req.Height, tags, req.Prompt, req.NegativePrompt, req.Seed,
		req.Style, req.Steps, req.Guidance, req.GenerationID, now, now)
	if err != nil {
		return nil, fmt.Errorf("insert asset: %w", err)
	}

	return s.Get(ctx, id)
}

func (s *Service) Update(ctx context.Context, id string, req UpdateRequest) (*Asset, error) {
	updates := []string{}
	args := []any{}

	if req.Name != nil {
		updates = append(updates, "name = ?")
		args = append(args, *req.Name)
	}
	if req.Category != nil {
		updates = append(updates, "category = ?")
		args = append(args, *req.Category)
	}
	if req.Tags != nil {
		updates = append(updates, "tags = ?")
		args = append(args, strings.Join(*req.Tags, ","))
	}

	if len(updates) == 0 {
		return s.Get(ctx, id)
	}

	updates = append(updates, "updated_at = ?")
	args = append(args, time.Now().UTC().Format(time.RFC3339))
	args = append(args, id)

	query := fmt.Sprintf("UPDATE assets SET %s WHERE id = ?", strings.Join(updates, ", "))
	_, err := s.db.ExecContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("update asset: %w", err)
	}

	return s.Get(ctx, id)
}

func (s *Service) Delete(ctx context.Context, id string) error {
	asset, err := s.Get(ctx, id)
	if err != nil {
		return err
	}

	// Delete file
	filePath := filepath.Join(s.assetsDir, asset.Filename)
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("delete file: %w", err)
	}

	// Delete from database
	_, err = s.db.ExecContext(ctx, "DELETE FROM assets WHERE id = ?", id)
	return err
}

func (s *Service) GetAssetsDir() string {
	return s.assetsDir
}
