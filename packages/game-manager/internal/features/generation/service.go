package generation

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/rcity/game-manager/internal/features/assets"
	"github.com/rcity/game-manager/internal/storage"
)

type Generation struct {
	ID             string  `json:"id"`
	AssetID        string  `json:"assetId,omitempty"`
	TemplateID     string  `json:"templateId,omitempty"`
	Prompt         string  `json:"prompt"`
	NegativePrompt string  `json:"negativePrompt,omitempty"`
	Seed           int64   `json:"seed,omitempty"`
	Width          int     `json:"width,omitempty"`
	Height         int     `json:"height,omitempty"`
	Style          string  `json:"style,omitempty"`
	Steps          int     `json:"steps,omitempty"`
	Guidance       float64 `json:"guidance,omitempty"`
	ReferenceImage string  `json:"referenceImage,omitempty"`
	Strength       float64 `json:"strength,omitempty"`
	Status         string  `json:"status"`
	OutputPath     string  `json:"outputPath,omitempty"`
	Error          string  `json:"error,omitempty"`
	AutoApprove    bool    `json:"autoApprove,omitempty"`
	AutoName       string  `json:"autoName,omitempty"`
	AutoCategory   string  `json:"autoCategory,omitempty"`
	AutoTags       string  `json:"autoTags,omitempty"`
	CreatedAt      string  `json:"createdAt"`
	CompletedAt    string  `json:"completedAt,omitempty"`
}

type PromptTemplate struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Category       string `json:"category,omitempty"`
	Prompt         string `json:"prompt"`
	NegativePrompt string `json:"negativePrompt,omitempty"`
	Style          string `json:"style,omitempty"`
	Notes          string `json:"notes,omitempty"`
	CreatedAt      string `json:"createdAt"`
	UpdatedAt      string `json:"updatedAt"`
}

type CreateRequest struct {
	Prompt         string  `json:"prompt"`
	NegativePrompt string  `json:"negativePrompt,omitempty"`
	Seed           int64   `json:"seed,omitempty"`
	Width          int     `json:"width,omitempty"`
	Height         int     `json:"height,omitempty"`
	Style          string  `json:"style,omitempty"`
	Steps          int     `json:"steps,omitempty"`
	Guidance       float64 `json:"guidance,omitempty"`
	ReferenceImage string  `json:"referenceImage,omitempty"`
	Strength       float64 `json:"strength,omitempty"`
	TemplateID     string  `json:"templateId,omitempty"`
	AutoApprove    bool    `json:"autoApprove,omitempty"`
	Name           string  `json:"name,omitempty"`     // For auto-approve: asset name
	Category       string  `json:"category,omitempty"` // For auto-approve: asset category
	Tags           string  `json:"tags,omitempty"`     // For auto-approve: comma-separated tags
}

// LogRequest is for recording externally-run generations (CLI, agents, etc)
type LogRequest struct {
	Prompt         string  `json:"prompt"`
	NegativePrompt string  `json:"negativePrompt,omitempty"`
	Seed           int64   `json:"seed,omitempty"`
	Width          int     `json:"width,omitempty"`
	Height         int     `json:"height,omitempty"`
	Steps          int     `json:"steps,omitempty"`
	ReferenceImage string  `json:"referenceImage,omitempty"`
	Strength       float64 `json:"strength,omitempty"`
	OutputPath     string  `json:"outputPath"`
	Source         string  `json:"source,omitempty"` // "cli", "agent", etc
	Status         string  `json:"status,omitempty"` // defaults to "completed"
	Error          string  `json:"error,omitempty"`
}

type TemplateRequest struct {
	Name           string `json:"name"`
	Category       string `json:"category,omitempty"`
	Prompt         string `json:"prompt"`
	NegativePrompt string `json:"negativePrompt,omitempty"`
	Style          string `json:"style,omitempty"`
	Notes          string `json:"notes,omitempty"`
}

type Service struct {
	db          *storage.DB
	assetSvc    *assets.Service
	assetsDir   string
	queue       chan string
	stopCh      chan struct{}
	wg          sync.WaitGroup
}

func NewService(db *storage.DB, assetSvc *assets.Service, assetsDir string) *Service {
	return &Service{
		db:        db,
		assetSvc:  assetSvc,
		assetsDir: assetsDir,
		queue:     make(chan string, 100),
		stopCh:    make(chan struct{}),
	}
}

func (s *Service) StartWorker() {
	s.wg.Add(1)
	defer s.wg.Done()

	for {
		select {
		case <-s.stopCh:
			return
		case id := <-s.queue:
			s.processGeneration(id)
		}
	}
}

func (s *Service) Stop() {
	close(s.stopCh)
	s.wg.Wait()
}

func (s *Service) processGeneration(id string) {
	ctx := context.Background()

	gen, err := s.Get(ctx, id)
	if err != nil {
		return
	}

	// Update status to running
	s.updateStatus(ctx, id, "running", "", "")

	// Build output path
	outputFilename := fmt.Sprintf("gen_%s.png", id[:8])
	outputPath := filepath.Join(s.assetsDir, "generated", outputFilename)

	// Ensure directory exists
	os.MkdirAll(filepath.Dir(outputPath), 0755)

	// Build img command - prompt is positional, not a flag
	args := []string{
		gen.Prompt,
		"--output", outputPath,
	}

	if gen.NegativePrompt != "" {
		args = append(args, "--negative", gen.NegativePrompt)
	}
	if gen.Width > 0 {
		args = append(args, "--width", fmt.Sprintf("%d", gen.Width))
	}
	if gen.Height > 0 {
		args = append(args, "--height", fmt.Sprintf("%d", gen.Height))
	}
	if gen.Seed > 0 {
		args = append(args, "--seed", fmt.Sprintf("%d", gen.Seed))
	}
	if gen.Style != "" {
		args = append(args, "--style", gen.Style)
	}
	if gen.Steps > 0 {
		args = append(args, "--steps", fmt.Sprintf("%d", gen.Steps))
	}
	if gen.Guidance > 0 {
		args = append(args, "--guidance", fmt.Sprintf("%.1f", gen.Guidance))
	}
	if gen.ReferenceImage != "" {
		// Reference image path - could be relative to assets dir or absolute
		refPath := gen.ReferenceImage
		if !filepath.IsAbs(refPath) {
			refPath = filepath.Join(s.assetsDir, refPath)
		}
		args = append(args, "--image", refPath)
		if gen.Strength > 0 {
			args = append(args, "--strength", fmt.Sprintf("%.2f", gen.Strength))
		}
	}

	// Execute img CLI
	cmd := exec.CommandContext(ctx, "img", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		s.updateStatus(ctx, id, "failed", "", fmt.Sprintf("%v: %s", err, string(output)))
		return
	}

	// Success
	relativePath := filepath.Join("generated", outputFilename)
	s.updateStatus(ctx, id, "completed", relativePath, "")

	// Auto-accept if requested
	if gen.AutoApprove && gen.AutoName != "" && gen.AutoCategory != "" {
		s.Accept(ctx, id, gen.AutoName, gen.AutoCategory, gen.AutoTags)
	}
}

func (s *Service) updateStatus(ctx context.Context, id, status, outputPath, errMsg string) {
	query := `UPDATE generations SET status = ?, output_path = ?, error = ?`
	args := []any{status, outputPath, errMsg}

	if status == "completed" || status == "failed" {
		query += `, completed_at = ?`
		args = append(args, time.Now().UTC().Format(time.RFC3339))
	}

	query += ` WHERE id = ?`
	args = append(args, id)

	s.db.ExecContext(ctx, query, args...)
}

func (s *Service) List(ctx context.Context) ([]Generation, error) {
	query := `SELECT id, asset_id, template_id, prompt, negative_prompt, seed,
		width, height, style, steps, guidance, reference_image, strength, status, output_path, error,
		auto_approve, auto_name, auto_category, auto_tags, created_at, completed_at FROM generations ORDER BY created_at DESC LIMIT 100`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query generations: %w", err)
	}
	defer rows.Close()

	var gens []Generation
	for rows.Next() {
		g, err := scanGeneration(rows)
		if err != nil {
			return nil, err
		}
		gens = append(gens, *g)
	}

	if gens == nil {
		gens = []Generation{}
	}
	return gens, nil
}

func (s *Service) Get(ctx context.Context, id string) (*Generation, error) {
	query := `SELECT id, asset_id, template_id, prompt, negative_prompt, seed,
		width, height, style, steps, guidance, reference_image, strength, status, output_path, error,
		auto_approve, auto_name, auto_category, auto_tags, created_at, completed_at FROM generations WHERE id = ?`

	row := s.db.QueryRowContext(ctx, query, id)
	return scanGenerationRow(row)
}

func (s *Service) Create(ctx context.Context, req CreateRequest) (*Generation, error) {
	id := uuid.New().String()
	now := time.Now().UTC().Format(time.RFC3339)

	// Set defaults
	width := req.Width
	if width == 0 {
		width = 512
	}
	height := req.Height
	if height == 0 {
		height = 512
	}
	steps := req.Steps
	if steps == 0 {
		steps = 20
	}
	guidance := req.Guidance
	if guidance == 0 {
		guidance = 7.5
	}

	query := `INSERT INTO generations (id, template_id, prompt, negative_prompt, seed,
		width, height, style, steps, guidance, reference_image, strength, status, auto_approve, auto_name, auto_category, auto_tags, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`

	// Use NULL for empty template_id to satisfy foreign key constraint
	var templateID any
	if req.TemplateID != "" {
		templateID = req.TemplateID
	}

	// Default strength for img2img
	strength := req.Strength
	if strength == 0 && req.ReferenceImage != "" {
		strength = 0.7
	}

	autoApprove := 0
	if req.AutoApprove {
		autoApprove = 1
	}

	_, err := s.db.ExecContext(ctx, query, id, templateID, req.Prompt, req.NegativePrompt,
		req.Seed, width, height, req.Style, steps, guidance, req.ReferenceImage, strength,
		autoApprove, req.Name, req.Category, req.Tags, now)
	if err != nil {
		return nil, fmt.Errorf("insert generation: %w", err)
	}

	// Add to queue
	s.queue <- id

	return s.Get(ctx, id)
}

// Log records an externally-run generation (CLI, agent, etc) so it appears in the queue
func (s *Service) Log(ctx context.Context, req LogRequest) (*Generation, error) {
	id := uuid.New().String()
	now := time.Now().UTC().Format(time.RFC3339)

	status := req.Status
	if status == "" {
		status = "completed"
	}

	width := req.Width
	if width == 0 {
		width = 128
	}
	height := req.Height
	if height == 0 {
		height = 128
	}

	query := `INSERT INTO generations (id, prompt, negative_prompt, seed,
		width, height, steps, reference_image, strength, status, output_path, error, created_at, completed_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := s.db.ExecContext(ctx, query, id, req.Prompt, req.NegativePrompt,
		req.Seed, width, height, req.Steps, req.ReferenceImage, req.Strength,
		status, req.OutputPath, req.Error, now, now)
	if err != nil {
		return nil, fmt.Errorf("insert logged generation: %w", err)
	}

	return s.Get(ctx, id)
}

func (s *Service) Accept(ctx context.Context, id, name, category, tags string) (*assets.Asset, error) {
	gen, err := s.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	if gen.Status != "completed" {
		return nil, fmt.Errorf("generation not completed")
	}

	// Create asset
	var tagSlice []string
	if tags != "" {
		for _, t := range splitTags(tags) {
			tagSlice = append(tagSlice, t)
		}
	}

	asset, err := s.assetSvc.Create(ctx, assets.CreateRequest{
		Name:           name,
		Category:       category,
		Filename:       gen.OutputPath,
		Width:          gen.Width,
		Height:         gen.Height,
		Tags:           tagSlice,
		Prompt:         gen.Prompt,
		NegativePrompt: gen.NegativePrompt,
		Seed:           gen.Seed,
		Style:          gen.Style,
		Steps:          gen.Steps,
		Guidance:       gen.Guidance,
		GenerationID:   id,
	})
	if err != nil {
		return nil, err
	}

	// Update generation with asset_id
	s.db.ExecContext(ctx, "UPDATE generations SET asset_id = ? WHERE id = ?", asset.ID, id)

	return asset, nil
}

func (s *Service) Reject(ctx context.Context, id string) error {
	gen, err := s.Get(ctx, id)
	if err != nil {
		return err
	}

	// Delete output file if exists
	if gen.OutputPath != "" {
		os.Remove(filepath.Join(s.assetsDir, gen.OutputPath))
	}

	// Mark as rejected (keep the record for history)
	_, err = s.db.ExecContext(ctx, "UPDATE generations SET status = 'rejected' WHERE id = ?", id)
	return err
}

func (s *Service) ListTemplates(ctx context.Context) ([]PromptTemplate, error) {
	query := `SELECT id, name, category, prompt, negative_prompt, style, notes,
		created_at, updated_at FROM prompt_templates ORDER BY name`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query templates: %w", err)
	}
	defer rows.Close()

	var templates []PromptTemplate
	for rows.Next() {
		var t PromptTemplate
		var category, negPrompt, style, notes sql.NullString
		err := rows.Scan(&t.ID, &t.Name, &category, &t.Prompt, &negPrompt, &style, &notes,
			&t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("scan template: %w", err)
		}
		t.Category = category.String
		t.NegativePrompt = negPrompt.String
		t.Style = style.String
		t.Notes = notes.String
		templates = append(templates, t)
	}

	if templates == nil {
		templates = []PromptTemplate{}
	}
	return templates, nil
}

func (s *Service) CreateTemplate(ctx context.Context, req TemplateRequest) (*PromptTemplate, error) {
	id := uuid.New().String()
	now := time.Now().UTC().Format(time.RFC3339)

	query := `INSERT INTO prompt_templates (id, name, category, prompt, negative_prompt, style, notes, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := s.db.ExecContext(ctx, query, id, req.Name, req.Category, req.Prompt,
		req.NegativePrompt, req.Style, req.Notes, now, now)
	if err != nil {
		return nil, fmt.Errorf("insert template: %w", err)
	}

	return &PromptTemplate{
		ID:             id,
		Name:           req.Name,
		Category:       req.Category,
		Prompt:         req.Prompt,
		NegativePrompt: req.NegativePrompt,
		Style:          req.Style,
		Notes:          req.Notes,
		CreatedAt:      now,
		UpdatedAt:      now,
	}, nil
}

func scanGeneration(rows *sql.Rows) (*Generation, error) {
	var g Generation
	var assetID, templateID, negPrompt, style, refImage, outputPath, errMsg sql.NullString
	var autoName, autoCategory, autoTags, completedAt sql.NullString
	var seed, width, height, steps, autoApprove sql.NullInt64
	var guidance, strength sql.NullFloat64

	err := rows.Scan(&g.ID, &assetID, &templateID, &g.Prompt, &negPrompt, &seed,
		&width, &height, &style, &steps, &guidance, &refImage, &strength, &g.Status, &outputPath, &errMsg,
		&autoApprove, &autoName, &autoCategory, &autoTags, &g.CreatedAt, &completedAt)
	if err != nil {
		return nil, fmt.Errorf("scan generation: %w", err)
	}

	g.AssetID = assetID.String
	g.TemplateID = templateID.String
	g.NegativePrompt = negPrompt.String
	g.Seed = seed.Int64
	g.Width = int(width.Int64)
	g.Height = int(height.Int64)
	g.Style = style.String
	g.Steps = int(steps.Int64)
	g.Guidance = guidance.Float64
	g.ReferenceImage = refImage.String
	g.Strength = strength.Float64
	g.OutputPath = outputPath.String
	g.Error = errMsg.String
	g.AutoApprove = autoApprove.Int64 == 1
	g.AutoName = autoName.String
	g.AutoCategory = autoCategory.String
	g.AutoTags = autoTags.String
	g.CompletedAt = completedAt.String

	return &g, nil
}

func scanGenerationRow(row *sql.Row) (*Generation, error) {
	var g Generation
	var assetID, templateID, negPrompt, style, refImage, outputPath, errMsg sql.NullString
	var autoName, autoCategory, autoTags, completedAt sql.NullString
	var seed, width, height, steps, autoApprove sql.NullInt64
	var guidance, strength sql.NullFloat64

	err := row.Scan(&g.ID, &assetID, &templateID, &g.Prompt, &negPrompt, &seed,
		&width, &height, &style, &steps, &guidance, &refImage, &strength, &g.Status, &outputPath, &errMsg,
		&autoApprove, &autoName, &autoCategory, &autoTags, &g.CreatedAt, &completedAt)
	if err != nil {
		return nil, err
	}

	g.AssetID = assetID.String
	g.TemplateID = templateID.String
	g.NegativePrompt = negPrompt.String
	g.Seed = seed.Int64
	g.Width = int(width.Int64)
	g.Height = int(height.Int64)
	g.Style = style.String
	g.Steps = int(steps.Int64)
	g.Guidance = guidance.Float64
	g.ReferenceImage = refImage.String
	g.Strength = strength.Float64
	g.OutputPath = outputPath.String
	g.Error = errMsg.String
	g.AutoApprove = autoApprove.Int64 == 1
	g.AutoName = autoName.String
	g.AutoCategory = autoCategory.String
	g.AutoTags = autoTags.String
	g.CompletedAt = completedAt.String

	return &g, nil
}

func splitTags(s string) []string {
	if s == "" {
		return []string{}
	}

	var parts []string
	current := ""
	for _, c := range s {
		if c == ',' {
			trimmed := trimSpace(current)
			if trimmed != "" {
				parts = append(parts, trimmed)
			}
			current = ""
		} else {
			current += string(c)
		}
	}
	trimmed := trimSpace(current)
	if trimmed != "" {
		parts = append(parts, trimmed)
	}
	return parts
}

func trimSpace(s string) string {
	start := 0
	end := len(s)
	for start < end && s[start] == ' ' {
		start++
	}
	for end > start && s[end-1] == ' ' {
		end--
	}
	return s[start:end]
}
