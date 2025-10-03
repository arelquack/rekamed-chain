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

// --- STRUCTS ---
type User struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Email          string    `json:"email"`
	Role           string    `json:"role"`
	HashedPassword string    `json:"-"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type RegisterPayload struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"` // Role sekarang bisa diinput saat registrasi
}

type LoginPayload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type CreateRecordPayload struct {
	PatientID string `json:"patient_id"`
	Diagnosis string `json:"diagnosis"`
	Notes     string `json:"notes"`
}

type MedicalRecord struct {
	ID         string    `json:"id"`
	PatientID  string    `json:"patient_id"`
	DoctorName string    `json:"doctor_name"`
	Diagnosis  string    `json:"diagnosis"`
	Notes      string    `json:"notes"`
	CreatedAt  time.Time `json:"created_at"`
}

// --- MIDDLEWARES ---
func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Header Authorization dibutuhkan", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Token tidak valid", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "userID", claims.UserID)
		ctx = context.WithValue(ctx, "role", claims.Role)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func doctorMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		role, ok := r.Context().Value("role").(string)
		if !ok || role != "doctor" {
			http.Error(w, "Akses ditolak: Hanya untuk dokter", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
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

		// Tentukan role, default ke 'patient' jika tidak diisi atau tidak valid
		role := "patient"
		if payload.Role == "doctor" {
			role = "doctor"
		}

		sql := `INSERT INTO users (name, email, hashed_password, role) VALUES ($1, $2, $3, $4) RETURNING id`
		var userID string
		err = db.QueryRow(context.Background(), sql, payload.Name, payload.Email, string(hashedPassword), role).Scan(&userID)
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
		sql := `SELECT id, name, email, role, hashed_password FROM users WHERE email = $1`
		err := db.QueryRow(context.Background(), sql, payload.Email).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.HashedPassword)
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
			Role:   user.Role,
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
		json.NewEncoder(w).Encode(map[string]string{
			"token": tokenString,
			"role":  user.Role,
		})
	})

	createRecordHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		doctorID := r.Context().Value("userID").(string)

		var payload CreateRecordPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Request body tidak valid", http.StatusBadRequest)
			return
		}

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

	getRecordsHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		patientID := r.Context().Value("userID").(string)

		sql := `SELECT id, patient_id, doctor_name, diagnosis, notes, created_at FROM medical_records WHERE patient_id = $1 ORDER BY created_at DESC`
		rows, err := db.Query(context.Background(), sql, patientID)
		if err != nil {
			log.Printf("Gagal mengambil rekam medis: %v", err)
			http.Error(w, "Gagal mengambil data", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		records := make([]MedicalRecord, 0)
		for rows.Next() {
			var record MedicalRecord
			if err := rows.Scan(&record.ID, &record.PatientID, &record.DoctorName, &record.Diagnosis, &record.Notes, &record.CreatedAt); err != nil {
				log.Printf("Gagal memindai baris data: %v", err)
				http.Error(w, "Gagal memproses data", http.StatusInternalServerError)
				return
			}
			records = append(records, record)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(records)
	})

	mux.Handle("POST /records", authMiddleware(doctorMiddleware(createRecordHandler)))
	mux.Handle("GET /records", authMiddleware(getRecordsHandler))

	// --- Konfigurasi CORS & Start Server ---
	handler := cors.AllowAll().Handler(mux)
	log.Println("Backend server is starting on http://localhost:8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
