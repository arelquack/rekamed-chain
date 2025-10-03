package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"
	"golang.org/x/crypto/bcrypt"
)

// Kunci rahasia untuk JWT. Di aplikasi nyata, ini harus dari environment variable!
var jwtKey = []byte("kunci_rahasia_super_aman_jangan_ditiru")

// Definisikan struktur data untuk user
type User struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Email          string    `json:"email"`
	HashedPassword string    `json:"-"` // Jangan kirim hashed password ke client
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// Definisikan struktur untuk request body registrasi
type RegisterPayload struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Definisikan struktur untuk request body login
type LoginPayload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Claims untuk JWT
type Claims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

// Definisikan struktur untuk payload rekam medis baru
type CreateRecordPayload struct {
	PatientID string `json:"patient_id"`
	Diagnosis string `json:"diagnosis"`
	Notes     string `json:"notes"`
}

// --- MIDDLEWARE OTENTIKASI (SATPAM) ---
func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Ambil header Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Header Authorization dibutuhkan", http.StatusUnauthorized)
			return
		}

		// 2. Pisahkan "Bearer" dari token-nya
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims := &Claims{}

		// 3. Parse dan validasi token
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Token tidak valid", http.StatusUnauthorized)
			return
		}

		// Jika token valid, tambahkan user ID ke context request
		ctx := context.WithValue(r.Context(), "userID", claims.UserID)

		// Lanjutkan ke handler berikutnya dengan request yang sudah dimodifikasi
		next.ServeHTTP(w, r.WithContext(ctx))
	})
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

	mux.HandleFunc("POST /login", func(w http.ResponseWriter, r *http.Request) {
		var payload LoginPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Request body tidak valid", http.StatusBadRequest)
			return
		}

		var user User
		sql := `SELECT id, name, email, hashed_password FROM users WHERE email = $1`
		err := db.QueryRow(context.Background(), sql, payload.Email).Scan(&user.ID, &user.Name, &user.Email, &user.HashedPassword)
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

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
	})

	// --- ENDPOINT UNTUK MEMBUAT REKAM MEDIS ---
	createRecordHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		doctorID := r.Context().Value("userID").(string)

		var payload CreateRecordPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Request body tidak valid", http.StatusBadRequest)
			return
		}

		// Untuk MVP, kita pakai ID dokter sebagai nama dokter
		sql := `INSERT INTO medical_records (patient_id, doctor_name, diagnosis, notes) VALUES ($1, $2, $3, $4) RETURNING id`
		var recordID string
		err := db.QueryRow(context.Background(), sql, payload.PatientID, "dr. "+doctorID, payload.Diagnosis, payload.Notes).Scan(&recordID)
		if err != nil {
			log.Printf("Gagal menyimpan rekam medis: %v", err)
			http.Error(w, "Gagal menyimpan rekam medis", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{
			"message":  "Rekam medis berhasil ditambahkan",
			"recordID": recordID,
		})
	})

	// Terapkan middleware ke handler rekam medis
	mux.Handle("POST /records", authMiddleware(createRecordHandler))

	// --- Konfigurasi CORS & Start Server ---
	handler := cors.AllowAll().Handler(mux)
	log.Println("Backend server is starting on http://localhost:8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
