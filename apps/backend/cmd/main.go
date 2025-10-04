package main

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/ipfs/boxo/files"
	ipfshttp "github.com/ipfs/kubo/client/rpc"
	iface "github.com/ipfs/kubo/core/coreiface"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"
	"golang.org/x/crypto/bcrypt"
)

// Kunci rahasia untuk JWT
var jwtKey = []byte("kunci_rahasia_super_aman_jangan_ditiru")

// --- Tipe & Kunci Konteks ---
type contextKey string

const userIDKey = contextKey("userID")
const userRoleKey = contextKey("userRole")

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
	Role     string `json:"role"`
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
	PatientID     string `json:"patient_id"`
	Diagnosis     string `json:"diagnosis"`
	Notes         string `json:"notes"`
	AttachmentCID string `json:"attachment_cid"`
}

type MedicalRecord struct {
	ID            string    `json:"id"`
	PatientID     string    `json:"patient_id"`
	DoctorName    string    `json:"doctor_name"`
	Diagnosis     string    `json:"diagnosis"`
	Notes         string    `json:"notes"`
	AttachmentCID string    `json:"attachment_cid"`
	CreatedAt     time.Time `json:"created_at"`
}

type ConsentRequestPayload struct {
	PatientID string `json:"patient_id"`
}

type ConsentRequest struct {
	ID        string    `json:"id"`
	DoctorID  string    `json:"doctor_id"`
	PatientID string    `json:"patient_id"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type LedgerBlock struct {
	BlockID      int       `json:"block_id"`
	RecordID     string    `json:"record_id"`
	DataHash     string    `json:"data_hash"`
	PreviousHash string    `json:"previous_hash"`
	CreatedAt    time.Time `json:"created_at"`
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
		ctx := context.WithValue(r.Context(), userIDKey, claims.UserID)
		ctx = context.WithValue(ctx, userRoleKey, claims.Role)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func doctorMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		role, ok := r.Context().Value(userRoleKey).(string)
		if !ok || role != "doctor" {
			http.Error(w, "Akses ditolak: Hanya untuk dokter", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func consentMiddleware(db *pgxpool.Pool, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Ambil ID dokter dari token
		doctorID := r.Context().Value(userIDKey).(string)
		// Ambil ID pasien dari URL
		patientID := r.PathValue("patient_id")

		if doctorID == "" || patientID == "" {
			http.Error(w, "ID Dokter atau Pasien tidak valid", http.StatusBadRequest)
			return
		}

		// Cek ke database apakah ada izin yang 'granted'
		var status string
		sql := `SELECT status FROM consent_requests WHERE doctor_id = $1 AND patient_id = $2 AND status = 'granted' LIMIT 1`
		err := db.QueryRow(r.Context(), sql, doctorID, patientID).Scan(&status)

		if err != nil {
			// Jika tidak ada baris yang ditemukan, atau statusnya bukan 'granted'
			http.Error(w, "Akses ditolak: Anda tidak memiliki izin dari pasien ini", http.StatusForbidden)
			return
		}

		// Jika izin ditemukan dan statusnya 'granted', lanjutkan
		next.ServeHTTP(w, r)
	})
}

func main() {
	// --- KONEKSI ---
	dbUrl := os.Getenv("DB_SOURCE")
	if dbUrl == "" {
		dbUrl = "postgresql://user:password@db:5432/rekamedchain?sslmode=disable"
	}
	db, err := pgxpool.New(context.Background(), dbUrl)
	if err != nil {
		log.Fatalf("DB connection error: %v\n", err)
	}
	defer db.Close()
	log.Println("DB connected!")

	ipfsURL := os.Getenv("IPFS_API")
	if ipfsURL == "" {
		ipfsURL = "http://ipfs:5001"
	}
	httpClient := &http.Client{Timeout: 60 * time.Second}
	ipfsClient, err := ipfshttp.NewURLApiWithClient(ipfsURL, httpClient)
	if err != nil {
		log.Fatalf("IPFS connection error: %v\n", err)
	}
	log.Println("IPFS node connected!")

	// --- ROUTING & HANDLER ---
	apiMux := http.NewServeMux()

	apiMux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "RekamedChain API is alive! 🚀")
	})

	apiMux.HandleFunc("POST /register", func(w http.ResponseWriter, r *http.Request) {
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
		role := "patient"
		if payload.Role == "doctor" {
			role = "doctor"
		}
		sqlQuery := `INSERT INTO users (name, email, hashed_password, role) VALUES ($1, $2, $3, $4) RETURNING id`
		var userID string
		err = db.QueryRow(context.Background(), sqlQuery, payload.Name, payload.Email, string(hashedPassword), role).Scan(&userID)
		if err != nil {
			log.Printf("Gagal menyimpan user: %v", err)
			http.Error(w, "Gagal menyimpan user, mungkin email sudah terdaftar?", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "Registrasi berhasil", "userID": userID})
	})

	apiMux.HandleFunc("POST /login", func(w http.ResponseWriter, r *http.Request) {
		var payload LoginPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Request body tidak valid", http.StatusBadRequest)
			return
		}
		var user User
		sqlQuery := `SELECT id, name, email, role, hashed_password FROM users WHERE email = $1`
		err := db.QueryRow(context.Background(), sqlQuery, payload.Email).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.HashedPassword)
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
			UserID:           user.ID,
			Role:             user.Role,
			RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(expirationTime)},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString(jwtKey)
		if err != nil {
			http.Error(w, "Gagal membuat token", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"token": tokenString, "role": user.Role})
	})

	createRecordHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		doctorID := r.Context().Value(userIDKey).(string)
		var payload CreateRecordPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Request body tidak valid", http.StatusBadRequest)
			return
		}
		sqlQuery := `INSERT INTO medical_records (patient_id, doctor_name, diagnosis, notes, attachment_cid) VALUES ($1, $2, $3, $4, $5) RETURNING id`
		var recordID string
		err := db.QueryRow(r.Context(), sqlQuery, payload.PatientID, "dr. "+doctorID, payload.Diagnosis, payload.Notes, payload.AttachmentCID).Scan(&recordID)
		if err != nil {
			log.Printf("Gagal menyimpan rekam medis: %v", err)
			http.Error(w, "Gagal menyimpan rekam medis", http.StatusInternalServerError)
			return
		}
		var previousHash string
		err = db.QueryRow(r.Context(), `SELECT data_hash FROM blockchain_ledger ORDER BY block_id DESC LIMIT 1`).Scan(&previousHash)
		if err != nil {
			if err == pgx.ErrNoRows {
				previousHash = strings.Repeat("0", 64)
			} else {
				http.Error(w, "Gagal mendapatkan blok sebelumnya", http.StatusInternalServerError)
				return
			}
		}
		recordData := fmt.Sprintf("%s%s%s%s%s%s", recordID, payload.PatientID, "dr. "+doctorID, payload.Diagnosis, payload.Notes, payload.AttachmentCID)
		dataHash := fmt.Sprintf("%x", sha256.Sum256([]byte(recordData)))
		_, err = db.Exec(r.Context(), `INSERT INTO blockchain_ledger (record_id, data_hash, previous_hash) VALUES ($1, $2, $3)`, recordID, dataHash, previousHash)
		if err != nil {
			log.Printf("Gagal menyimpan blok ke ledger: %v", err)
			http.Error(w, "Gagal mencatat ke blockchain ledger", http.StatusInternalServerError)
			return
		}
		log.Printf("Blok baru ditambahkan ke ledger. Hash: %s", dataHash)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{
			"message":   "Rekam medis berhasil ditambahkan dan dicatat di ledger",
			"recordID":  recordID,
			"blockHash": dataHash,
		})
	})

	getRecordsHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		patientID := r.Context().Value(userIDKey).(string)
		sqlQuery := `SELECT id, patient_id, doctor_name, diagnosis, notes, attachment_cid, created_at FROM medical_records WHERE patient_id = $1 ORDER BY created_at DESC`
		rows, err := db.Query(context.Background(), sqlQuery, patientID)
		if err != nil {
			log.Printf("Gagal mengambil rekam medis: %v", err)
			http.Error(w, "Gagal mengambil data", http.StatusInternalServerError)
			return
		}
		defer rows.Close()
		records := make([]MedicalRecord, 0)
		for rows.Next() {
			var record MedicalRecord
			var attachmentCID sql.NullString
			if err := rows.Scan(&record.ID, &record.PatientID, &record.DoctorName, &record.Diagnosis, &record.Notes, &attachmentCID, &record.CreatedAt); err != nil {
				log.Printf("Gagal memindai baris data: %v", err)
				http.Error(w, "Gagal memproses data", http.StatusInternalServerError)
				return
			}
			if attachmentCID.Valid {
				record.AttachmentCID = attachmentCID.String
			}
			records = append(records, record)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(records)
	})

	uploadHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var api iface.CoreAPI = ipfsClient
		r.ParseMultipartForm(10 << 20)
		file, _, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Gagal membaca file dari request", http.StatusBadRequest)
			return
		}
		defer file.Close()
		fileNode := files.NewReaderFile(file)
		path, err := api.Unixfs().Add(r.Context(), fileNode)
		if err != nil {
			log.Printf("Gagal menambahkan file ke IPFS: %v", err)
			http.Error(w, "Gagal mengupload file", http.StatusInternalServerError)
			return
		}
		fullPath := path.String()
		cid := strings.TrimPrefix(fullPath, "/ipfs/")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"cid": cid})
	})

	// 1. Handler untuk dokter meminta akses
	handleConsentRequest := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		doctorID := r.Context().Value(userIDKey).(string)
		var payload ConsentRequestPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Request body tidak valid", http.StatusBadRequest)
			return
		}

		sql := `INSERT INTO consent_requests (doctor_id, patient_id) VALUES ($1, $2) RETURNING id`
		var requestID string
		err := db.QueryRow(r.Context(), sql, doctorID, payload.PatientID).Scan(&requestID)
		if err != nil {
			log.Printf("Gagal membuat permintaan consent: %v", err)
			http.Error(w, "Gagal membuat permintaan", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "Permintaan akses berhasil dikirim", "request_id": requestID})
	})

	// 2. Handler untuk pasien melihat semua permintaan untuknya
	handleGetMyConsentRequests := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		patientID := r.Context().Value(userIDKey).(string)
		sql := `SELECT id, doctor_id, patient_id, status, created_at, updated_at FROM consent_requests WHERE patient_id = $1 ORDER BY created_at DESC`
		rows, err := db.Query(r.Context(), sql, patientID)
		if err != nil {
			http.Error(w, "Gagal mengambil data permintaan", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		requests := make([]ConsentRequest, 0)
		for rows.Next() {
			var req ConsentRequest
			if err := rows.Scan(&req.ID, &req.DoctorID, &req.PatientID, &req.Status, &req.CreatedAt, &req.UpdatedAt); err != nil {
				http.Error(w, "Gagal memproses data", http.StatusInternalServerError)
				return
			}
			requests = append(requests, req)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(requests)
	})

	// 3. Handler untuk pasien menyetujui permintaan
	handleGrantConsent := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		patientID := r.Context().Value(userIDKey).(string)
		requestID := r.PathValue("request_id") // Ambil ID dari URL (e.g., /consent/grant/xxxxx)

		sql := `UPDATE consent_requests SET status = 'granted', updated_at = NOW() WHERE id = $1 AND patient_id = $2`
		res, err := db.Exec(r.Context(), sql, requestID, patientID)
		if err != nil || res.RowsAffected() == 0 {
			http.Error(w, "Gagal menyetujui permintaan atau permintaan tidak ditemukan", http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"message": "Permintaan berhasil disetujui"})
	})

	handleGetPatientRecords := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		patientID := r.PathValue("patient_id")

		// Logika query sama seperti getRecordsHandler, tapi pakai patientID dari URL
		sqlQuery := `SELECT id, patient_id, doctor_name, diagnosis, notes, attachment_cid, created_at FROM medical_records WHERE patient_id = $1 ORDER BY created_at DESC`
		rows, err := db.Query(r.Context(), sqlQuery, patientID)
		if err != nil {
			http.Error(w, "Gagal mengambil data", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		records := make([]MedicalRecord, 0)
		for rows.Next() {
			var record MedicalRecord
			var attachmentCID sql.NullString
			if err := rows.Scan(&record.ID, &record.PatientID, &record.DoctorName, &record.Diagnosis, &record.Notes, &attachmentCID, &record.CreatedAt); err != nil {
				http.Error(w, "Gagal memproses data", http.StatusInternalServerError)
				return
			}
			if attachmentCID.Valid {
				record.AttachmentCID = attachmentCID.String
			}
			records = append(records, record)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(records)
	})

	handleGetLedger := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sqlQuery := `SELECT block_id, record_id, data_hash, previous_hash, created_at FROM blockchain_ledger ORDER BY block_id DESC`
		rows, err := db.Query(r.Context(), sqlQuery)
		if err != nil {
			http.Error(w, "Gagal mengambil data ledger", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		blocks := make([]LedgerBlock, 0)
		for rows.Next() {
			var block LedgerBlock
			if err := rows.Scan(&block.BlockID, &block.RecordID, &block.DataHash, &block.PreviousHash, &block.CreatedAt); err != nil {
				http.Error(w, "Gagal memproses data ledger", http.StatusInternalServerError)
				return
			}
			blocks = append(blocks, block)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(blocks)
	})

	// Middleware untuk consent butuh akses ke DB, jadi kita bungkus seperti ini
	consentCheck := func(next http.Handler) http.Handler {
		return consentMiddleware(db, next)
	}

	apiMux.Handle("POST /records", authMiddleware(doctorMiddleware(createRecordHandler)))
	apiMux.Handle("GET /records", authMiddleware(getRecordsHandler))
	apiMux.Handle("POST /upload", authMiddleware(doctorMiddleware(uploadHandler)))
	apiMux.Handle("POST /consent/request", authMiddleware(doctorMiddleware(handleConsentRequest)))
	apiMux.Handle("GET /consent/requests/me", authMiddleware(http.HandlerFunc(handleGetMyConsentRequests)))
	apiMux.Handle("POST /consent/grant/{request_id}", authMiddleware(http.HandlerFunc(handleGrantConsent)))
	apiMux.Handle("GET /records/patient/{patient_id}", authMiddleware(doctorMiddleware(consentCheck(handleGetPatientRecords))))
	apiMux.Handle("GET /ledger", authMiddleware(doctorMiddleware(handleGetLedger)))

	// --- LOGIKA REVERSE PROXY (PENJAGA GERBANG) ---
	ipfsGatewayURL, _ := url.Parse("http://ipfs:8080")
	ipfsProxy := httputil.NewSingleHostReverseProxy(ipfsGatewayURL)

	masterMux := http.NewServeMux()
	masterMux.Handle("/ipfs/", ipfsProxy) // Jika path diawali /ipfs/, teruskan ke IPFS
	masterMux.Handle("/", apiMux)         // Sisanya, teruskan ke API utama kita

	// --- Konfigurasi CORS & Start Server ---
	handler := cors.AllowAll().Handler(masterMux)
	log.Println("Backend server (proxy mode) is starting on http://localhost:8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal("Server start error:", err)
	}
}
