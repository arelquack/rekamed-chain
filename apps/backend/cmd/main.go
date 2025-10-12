// apps/backend/cmd/main.go
package main

import (
	"context"
	"log"
	"net/http"

	"github.com/trifur/rekamedchain/backend/internal/blockchain"
	"github.com/trifur/rekamedchain/backend/internal/config"
	"github.com/trifur/rekamedchain/backend/internal/database"
	"github.com/trifur/rekamedchain/backend/internal/router"
)

func main() {
	// 1. Muat Konfigurasi
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

	// --- TAMBAHKAN BLOK BARU INI ---
	// 3. Buat Koneksi ke Blockchain
	bcClient, err := blockchain.NewBlockchainClient(cfg.HardhatURL, cfg.LedgerContractAddress, cfg.SignerPrivateKey)
	if err != nil {
		log.Fatalf("Koneksi Blockchain gagal: %v", err)
	}
	// --- AKHIR BLOK BARU ---

	// 4. Inisialisasi Router (sekarang dengan blockchain client)
	appRouter := router.NewRouter(db, cfg.IPFS_API, cfg.IPFS_Gateway, cfg.JWTKey, cfg.EncryptionKey, bcClient)

	// 5. Jalankan HTTP Server
	log.Printf("Backend server is starting on %s", cfg.ServerAddress)
	if err := http.ListenAndServe(cfg.ServerAddress, appRouter); err != nil {
		log.Fatal("Server start error: ", err)
	}
}
