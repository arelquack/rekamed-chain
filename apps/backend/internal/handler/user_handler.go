package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/trifur/rekamedchain/backend/internal/domain"
	"github.com/trifur/rekamedchain/backend/internal/middleware"
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
	if len(query) < 1 {
		http.Error(w, "Query pencarian minimal 1 karakter", http.StatusBadRequest)
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

// HandleGetMyProfile retrieves the profile of the currently authenticated user.
func (h *UserHandler) HandleGetMyProfile(w http.ResponseWriter, r *http.Request) {
	// 1. Ambil userID dari context yang sudah diisi oleh middleware
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Gagal mendapatkan ID pengguna dari token", http.StatusInternalServerError)
		return
	}

	// 2. Panggil repository untuk mendapatkan detail user
	user, err := h.userRepo.GetUserByID(r.Context(), userID)
	if err != nil {
		log.Printf("Gagal mengambil data profil untuk user %s: %v", userID, err)
		http.Error(w, "Gagal mengambil data profil", http.StatusNotFound)
		return
	}

	// 3. Buat "formatted_id"
	// Format: MED-TAHUN-4_DIGIT_TERAKHIR_UUID
	year := time.Now().Year()
	lastFour := "0000"
	if len(user.ID) > 4 {
		lastFour = user.ID[len(user.ID)-4:]
	}
	formattedID := fmt.Sprintf("MED-%d-%s", year, strings.ToUpper(lastFour))

	// 4. Siapkan respons
	userProfile := domain.UserProfile{
		ID:             user.ID,
		Name:           user.Name,
		Email:          user.Email,
		Role:           user.Role,
		FormattedID:    formattedID,
		NIP:            user.NIP,
		Phone:          user.Phone,
		Specialization: user.Specialization,
	}

	// 5. Kirim respons JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userProfile)
}
