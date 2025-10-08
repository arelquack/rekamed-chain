package main

import (
	"context"
	"log"
	"net/http"

	"github.com/trifur/rekamedchain/backend/internal/config"
	"github.com/trifur/rekamedchain/backend/internal/database"
	"github.com/trifur/rekamedchain/backend/internal/router"
)

func main() {
	// 1. Muat Konfigurasi dari environment variables
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Gagal memuat konfigurasi: %v", err)
	}

	// 2. Buat Koneksi Database
	db, err := database.Connect(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Koneksi DB gagal: %v", err)
	}
	defer db.Close()
	log.Println("DB connected!")

	// 3. Inisialisasi Router
	// Router akan menangani inisialisasi semua handler dan repository
	appRouter := router.NewRouter(db, cfg.IPFS_API, cfg.IPFS_Gateway, cfg.JWTKey)

	// 4. Jalankan HTTP Server
	log.Printf("Backend server is starting on %s", cfg.ServerAddress)
	if err := http.ListenAndServe(cfg.ServerAddress, appRouter); err != nil {
		log.Fatal("Server start error: ", err)
	}
}
