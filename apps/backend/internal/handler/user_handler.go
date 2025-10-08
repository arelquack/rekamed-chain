package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/trifur/rekamedchain/backend/internal/domain"
	"github.com/trifur/rekamedchain/backend/internal/repository"
)

// UserHandler handles user-related HTTP requests like searching.
type UserHandler struct {
	userRepo repository.UserRepository
}

// NewUserHandler creates a new instance of UserHandler.
func NewUserHandler(userRepo repository.UserRepository) *UserHandler {
	return &UserHandler{userRepo: userRepo}
}

// HandleSearchUsers handles searching for patients by name or email.
func (h *UserHandler) HandleSearchUsers(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if len(query) < 3 {
		http.Error(w, "Query pencarian minimal 3 karakter", http.StatusBadRequest)
		return
	}

	users, err := h.userRepo.SearchUsers(r.Context(), query)
	if err != nil {
		log.Printf("Gagal mencari user: %v", err)
		http.Error(w, "Gagal mencari user", http.StatusInternalServerError)
		return
	}

	// Ensure we return an empty array, not null
	if users == nil {
		users = make([]domain.PublicUser, 0)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
