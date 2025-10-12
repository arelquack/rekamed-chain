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
	// Ambil ID dokter yang sedang login dari token
	doctorID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Gagal mendapatkan ID dokter dari token", http.StatusInternalServerError)
		return
	}

	query := r.URL.Query().Get("q")
	if len(query) < 1 {
		// Jika Anda ingin tetap mengizinkan query < 3, hapus blok ini.
		// Namun, ini adalah praktik yang baik untuk performa.
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(make([]domain.PublicUser, 0))
		return
	}

	// Panggil repository dengan doctorID
	users, err := h.userRepo.SearchUsers(r.Context(), query, doctorID)
	if err != nil {
		log.Printf("Gagal mencari user: %v", err)
		http.Error(w, "Gagal mencari user", http.StatusInternalServerError)
		return
	}

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

func (h *UserHandler) HandleGetPatientProfile(w http.ResponseWriter, r *http.Request) {
	// 1. Ambil userID dari context yang sudah diisi oleh middleware
	// userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	// if !ok {
	// 	http.Error(w, "Gagal mendapatkan ID pengguna dari token", http.StatusInternalServerError)
	// 	return
	// }

	patientID := r.PathValue("patient_id")

	if patientID == "" {
		http.Error(w, "Patient ID dibutuhkan", http.StatusBadRequest)
		return
	}

	// 2. Panggil repository untuk mendapatkan detail user
	user, err := h.userRepo.GetUserByID(r.Context(), patientID)
	if err != nil {
		log.Printf("Gagal mengambil data profil untuk user %s: %v", patientID, err)
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
