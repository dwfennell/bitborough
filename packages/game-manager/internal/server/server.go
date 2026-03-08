package server

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/rcity/game-manager/internal/features/assets"
	"github.com/rcity/game-manager/internal/features/generation"
)

func New(assetSvc *assets.Service, genSvc *generation.Service, assetsDir string) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// API routes
	r.Route("/api", func(r chi.Router) {
		r.Route("/assets", func(r chi.Router) {
			r.Get("/", assetListHandler(assetSvc))
			r.Post("/", assetCreateHandler(assetSvc))
			r.Get("/{id}", assetGetHandler(assetSvc))
			r.Put("/{id}", assetUpdateHandler(assetSvc))
			r.Delete("/{id}", assetDeleteHandler(assetSvc))
		})

		r.Route("/generations", func(r chi.Router) {
			r.Get("/", generationListHandler(genSvc))
			r.Post("/", generationCreateHandler(genSvc))
			r.Post("/log", generationLogHandler(genSvc))
			r.Get("/{id}", generationGetHandler(genSvc))
			r.Post("/{id}/accept", generationAcceptHandler(genSvc))
			r.Post("/{id}/reject", generationRejectHandler(genSvc))
		})

		r.Route("/templates", func(r chi.Router) {
			r.Get("/", templateListHandler(genSvc))
			r.Post("/", templateCreateHandler(genSvc))
		})
	})

	// Serve asset files
	fileServer := http.FileServer(http.Dir(assetsDir))
	r.Handle("/files/*", http.StripPrefix("/files/", fileServer))

	return r
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// Asset handlers
func assetListHandler(svc *assets.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		category := r.URL.Query().Get("category")
		search := r.URL.Query().Get("search")

		list, err := svc.List(r.Context(), category, search)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, list)
	}
}

func assetCreateHandler(svc *assets.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req assets.CreateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		asset, err := svc.Create(r.Context(), req)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, asset)
	}
}

func assetGetHandler(svc *assets.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		asset, err := svc.Get(r.Context(), id)
		if err != nil {
			writeError(w, http.StatusNotFound, "asset not found")
			return
		}
		writeJSON(w, http.StatusOK, asset)
	}
}

func assetUpdateHandler(svc *assets.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		var req assets.UpdateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		asset, err := svc.Update(r.Context(), id, req)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, asset)
	}
}

func assetDeleteHandler(svc *assets.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		if err := svc.Delete(r.Context(), id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

// Generation handlers
func generationListHandler(svc *generation.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		list, err := svc.List(r.Context())
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, list)
	}
}

func generationCreateHandler(svc *generation.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req generation.CreateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		gen, err := svc.Create(r.Context(), req)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, gen)
	}
}

func generationGetHandler(svc *generation.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		gen, err := svc.Get(r.Context(), id)
		if err != nil {
			writeError(w, http.StatusNotFound, "generation not found")
			return
		}
		writeJSON(w, http.StatusOK, gen)
	}
}

func generationAcceptHandler(svc *generation.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		var req struct {
			Name     string `json:"name"`
			Category string `json:"category"`
			Tags     string `json:"tags"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		asset, err := svc.Accept(r.Context(), id, req.Name, req.Category, req.Tags)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, asset)
	}
}

func generationRejectHandler(svc *generation.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		if err := svc.Reject(r.Context(), id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func generationLogHandler(svc *generation.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req generation.LogRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		gen, err := svc.Log(r.Context(), req)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, gen)
	}
}

// Template handlers
func templateListHandler(svc *generation.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		list, err := svc.ListTemplates(r.Context())
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, list)
	}
}

func templateCreateHandler(svc *generation.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req generation.TemplateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		tmpl, err := svc.CreateTemplate(r.Context(), req)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, tmpl)
	}
}
