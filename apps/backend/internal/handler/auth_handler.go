package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/trifur/rekamedchain/backend/internal/auth"
	"github.com/trifur/rekamedchain/backend/internal/domain"
	"github.com/trifur/rekamedchain/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

// AuthHandler handles authentication-related HTTP requests.
type AuthHandler struct {
	userRepo repository.UserRepository
	jwtKey   []byte
}

// NewAuthHandler creates a new instance of AuthHandler.
func NewAuthHandler(userRepo repository.UserRepository, jwtKey []byte) *AuthHandler {
	return &AuthHandler{
		userRepo: userRepo,
		jwtKey:   jwtKey,
	}
}

// Register handles the user registration process.
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var payload domain.RegisterPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Gagal memproses password", http.StatusInternalServerError)
		return
	}

	role := payload.Role
	if payload.Role != "patient" {
		role = "doctor"
	}

	privateKey, err := auth.GenerateKeyPair()
	if err != nil {
		http.Error(w, "Gagal membuat kunci kriptografi", http.StatusInternalServerError)
		return
	}
	privateKeyHex := auth.PrivateKeyToHex(privateKey)
	publicKeyHex := auth.PublicKeyToHex(privateKey)

	newUser := &domain.User{
		Name:           payload.Name,
		Email:          payload.Email,
		HashedPassword: string(hashedPassword),
		Role:           role,
		PublicKey:      publicKeyHex,
		NIP:            payload.NIP,
		Phone:          payload.Phone,
		Specialization: payload.Specialization,
	}

	userID, err := h.userRepo.CreateUser(r.Context(), newUser)
	if err != nil {
		log.Printf("Gagal menyimpan user: %v", err)
		http.Error(w, "Gagal menyimpan user, mungkin email sudah terdaftar?", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message":     "Registrasi berhasil",
		"userID":      userID,
		"private_key": privateKeyHex,
	})
}

// Login handles the user login process.
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var payload domain.LoginPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	user, err := h.userRepo.GetUserByEmail(r.Context(), payload.Email)
	if err != nil {
		http.Error(w, "Email atau password salah", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(payload.Password))
	if err != nil {
		http.Error(w, "Email atau password salah", http.StatusUnauthorized)
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &domain.Claims{
		UserID: user.ID,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(h.jwtKey)
	if err != nil {
		http.Error(w, "Gagal membuat token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"token": tokenString,
		"role":  user.Role,
	})
}
