package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5" // <-- IMPORT BARU UNTUK JWT
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"
	"golang.org/x/crypto/bcrypt"
)

// Kunci rahasia untuk JWT. Di aplikasi nyata, ini harus dari environment variable!
var jwtKey = []byte("kunci_rahasia_super_aman_jangan_ditiru")

type User struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Email          string    `json:"email"`
	HashedPassword string    `json:"-"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type RegisterPayload struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginPayload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Claims untuk JWT
type Claims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

func main() {
	// --- KONEKSI DATABASE ---
	dbUrl := os.Getenv("DB_SOURCE")
	if dbUrl == "" {
		dbUrl = "postgresql://user:password@localhost:5432/rekamedchain?sslmode=disable"
	}
	db, err := pgxpool.New(context.Background(), dbUrl)
	if err != nil {
		log.Fatalf("Tidak bisa terkoneksi ke database: %v\n", err)
	}
	defer db.Close()
	log.Println("Berhasil terkoneksi ke database!")

	// --- ROUTING & HANDLER ---
	mux := http.NewServeMux()

	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "RekamedChain API is alive! 🚀")
	})

	mux.HandleFunc("POST /register", func(w http.ResponseWriter, r *http.Request) {
		// ... (Kode registrasi dari sebelumnya, tidak berubah)
		var payload RegisterPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Request body tidak valid", http.StatusBadRequest)
			return
		}
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Gagal memproses password", http.StatusInternalServerError)
			return
		}
		sql := `INSERT INTO users (name, email, hashed_password) VALUES ($1, $2, $3) RETURNING id`
		var userID string
		err = db.QueryRow(context.Background(), sql, payload.Name, payload.Email, string(hashedPassword)).Scan(&userID)
		if err != nil {
			log.Printf("Gagal menyimpan user: %v", err)
			http.Error(w, "Gagal menyimpan user, mungkin email sudah terdaftar?", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "Registrasi berhasil", "userID": userID})
	})

	// --- ENDPOINT LOGIN BARU ---
	mux.HandleFunc("POST /login", func(w http.ResponseWriter, r *http.Request) {
		var payload LoginPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Request body tidak valid", http.StatusBadRequest)
			return
		}

		// 1. Cari user berdasarkan email
		var user User
		sql := `SELECT id, name, email, hashed_password FROM users WHERE email = $1`
		err := db.QueryRow(context.Background(), sql, payload.Email).Scan(&user.ID, &user.Name, &user.Email, &user.HashedPassword)
		if err != nil {
			// Jika user tidak ditemukan atau error lain
			http.Error(w, "Email atau password salah", http.StatusUnauthorized)
			return
		}

		// 2. Bandingkan password yang dikirim dengan hash di database
		err = bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(payload.Password))
		if err != nil {
			// Jika password tidak cocok
			http.Error(w, "Email atau password salah", http.StatusUnauthorized)
			return
		}

		// 3. Jika cocok, buat JWT
		expirationTime := time.Now().Add(24 * time.Hour) // Token berlaku 24 jam
		claims := &Claims{
			UserID: user.ID,
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(expirationTime),
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString(jwtKey)
		if err != nil {
			http.Error(w, "Gagal membuat token", http.StatusInternalServerError)
			return
		}

		// 4. Kirim token sebagai respon
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
	})

	// --- Konfigurasi CORS & Start Server ---
	handler := cors.AllowAll().Handler(mux)
	log.Println("Backend server is starting on http://localhost:8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
