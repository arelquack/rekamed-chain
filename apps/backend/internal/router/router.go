package router

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	ipfshttp "github.com/ipfs/kubo/client/rpc"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"

	"github.com/trifur/rekamedchain/backend/internal/blockchain"
	"github.com/trifur/rekamedchain/backend/internal/handler"
	"github.com/trifur/rekamedchain/backend/internal/middleware"
	"github.com/trifur/rekamedchain/backend/internal/repository"
)

func NewRouter(db *pgxpool.Pool, ipfsURL, ipfsGatewayURL string, jwtKey, encryptionKey []byte, bcClient *blockchain.BlockchainClient) http.Handler {
	// --- Inisialisasi ---
	httpClient := &http.Client{Timeout: 60 * time.Second}
	ipfsClient, err := ipfshttp.NewURLApiWithClient(ipfsURL, httpClient)
	if err != nil {
		log.Fatalf("IPFS connection error: %v\n", err)
	}
	log.Println("IPFS node connected!")

	userRepo := repository.NewPostgresUserRepository(db)
	recordRepo := repository.NewPostgresRecordRepository(db)
	consentRepo := repository.NewPostgresConsentRepository(db)
	logRepo := repository.NewPostgresLogRepository(db)

	authHandler := handler.NewAuthHandler(userRepo, jwtKey)
	recordHandler := handler.NewRecordHandler(recordRepo, userRepo, encryptionKey, bcClient)
	ipfsHandler := handler.NewIpfsHandler(ipfsClient)
	consentHandler := handler.NewConsentHandler(consentRepo)
	ledgerHandler := handler.NewLedgerHandler(bcClient)
	userHandler := handler.NewUserHandler(userRepo)
	logHandler := handler.NewLogHandler(logRepo)

	// --- Routing Menggunakan SATU Mux Utama ---
	apiMux := http.NewServeMux()

	// == Public Routes ==
	apiMux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "RekamedChain API is alive!"})
	})
	apiMux.HandleFunc("POST /register", authHandler.Register)
	apiMux.HandleFunc("POST /doctor/login", authHandler.DoctorLogin)
	apiMux.HandleFunc("POST /patient/login", authHandler.PatientLogin)

	// == Patient Routes (Authenticated) ==
	apiMux.Handle("GET /users/me", middleware.AuthMiddleware(http.HandlerFunc(userHandler.HandleGetMyProfile), jwtKey))
	apiMux.Handle("GET /records", middleware.AuthMiddleware(http.HandlerFunc(recordHandler.GetMyRecords), jwtKey))
	apiMux.Handle("GET /consent/requests/me", middleware.AuthMiddleware(http.HandlerFunc(consentHandler.HandleGetMyRequests), jwtKey))
	apiMux.Handle("POST /consent/sign/{request_id}", middleware.AuthMiddleware(http.HandlerFunc(consentHandler.HandleGrant), jwtKey))
	apiMux.Handle("POST /consent/deny/{request_id}", middleware.AuthMiddleware(http.HandlerFunc(consentHandler.HandleDeny), jwtKey))
	apiMux.Handle("POST /consent/revoke/{request_id}", middleware.AuthMiddleware(http.HandlerFunc(consentHandler.HandleRevoke), jwtKey))
	// apiMux.Handle("GET /log-access", ...).

	// == Doctor Routes (Authenticated + Doctor Role) ==
	// Buat "rantai" middleware untuk dokter agar tidak diulang-ulang
	doctorOnly := func(next http.Handler) http.Handler {
		return middleware.AuthMiddleware(middleware.DoctorMiddleware(next), jwtKey)
	}

	apiMux.Handle("POST /records", doctorOnly(http.HandlerFunc(recordHandler.CreateRecord)))
	apiMux.Handle("POST /upload", doctorOnly(http.HandlerFunc(ipfsHandler.UploadFile)))
	apiMux.Handle("POST /consent/request", doctorOnly(http.HandlerFunc(consentHandler.HandleRequest)))
	apiMux.Handle("GET /ledger", doctorOnly(http.HandlerFunc(ledgerHandler.HandleGetLedger)))
	apiMux.Handle("GET /users/search", doctorOnly(http.HandlerFunc(userHandler.HandleSearchUsers)))

	// Rute dokter dengan middleware tambahan (consent)
	getPatientRecordsHandler := middleware.ConsentMiddleware(db, http.HandlerFunc(recordHandler.GetPatientRecords))
	apiMux.Handle("GET /records/patient/{patient_id}", doctorOnly(getPatientRecordsHandler))

	getAuditLogHandler := middleware.ConsentMiddleware(db, http.HandlerFunc(logHandler.HandleGetAuditLog))
	apiMux.Handle("GET /audit-log/{patient_id}", doctorOnly(getAuditLogHandler))

	// --- Final Handler Setup ---
	parsedGatewayURL, _ := url.Parse(ipfsGatewayURL)
	ipfsProxy := httputil.NewSingleHostReverseProxy(parsedGatewayURL)

	masterMux := http.NewServeMux()
	masterMux.Handle("/ipfs/", http.StripPrefix("/ipfs/", ipfsProxy))
	masterMux.Handle("/", apiMux)

	return cors.AllowAll().Handler(masterMux)
}
