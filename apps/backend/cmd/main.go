package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool" // <-- Import untuk koneksi DB
	"github.com/rs/cors"
	"golang.org/x/crypto/bcrypt" // <-- Import untuk hash password
)

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

func main() {
	// --- KONEKSI DATABASE ---
	// Ambil URL koneksi database dari environment variable yang kita set di docker-compose.yml
	dbUrl := os.Getenv("DB_SOURCE")
	if dbUrl == "" {
		dbUrl = "postgresql://user:password@localhost:5432/rekamedchain?sslmode=disable"
	}

	// Buat connection pool
	db, err := pgxpool.New(context.Background(), dbUrl)
	if err != nil {
		log.Fatalf("Tidak bisa terkoneksi ke database: %v\n", err)
	}
	defer db.Close() // Tutup koneksi saat program selesai
	log.Println("Berhasil terkoneksi ke database!")

	// --- ROUTING & HANDLER ---
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "RekamedChain API is alive! 🚀")
	})

	// Buat handler untuk registrasi
	mux.HandleFunc("POST /register", func(w http.ResponseWriter, r *http.Request) {
		var payload RegisterPayload

		// Decode JSON body dari request ke struct RegisterPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Request body tidak valid", http.StatusBadRequest)
			return
		}

		// Hash password user
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Gagal memproses password", http.StatusInternalServerError)
			return
		}

		// Simpan user baru ke database
		sql := `INSERT INTO users (name, email, hashed_password) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at`
		var userID string
		var createdAt, updatedAt time.Time

		err = db.QueryRow(context.Background(), sql, payload.Name, payload.Email, string(hashedPassword)).Scan(&userID, &createdAt, &updatedAt)
		if err != nil {
			log.Printf("Gagal menyimpan user: %v", err)
			http.Error(w, "Gagal menyimpan user", http.StatusInternalServerError)
			return
		}

		// Kirim respon sukses
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Registrasi berhasil",
			"userID":  userID,
		})
	})

	// --- Konfigurasi CORS & Start Server ---
	handler := cors.AllowAll().Handler(mux) // Kita izinkan semua untuk development

	log.Println("Backend server is starting on http://localhost:8080")

	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
