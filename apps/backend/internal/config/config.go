package config

import (
	"fmt"
	"os"
)

// Config holds all configuration for the application.
type Config struct {
	DatabaseURL           string
	IPFS_API              string
	IPFS_Gateway          string
	JWTKey                []byte
	EncryptionKey         []byte
	ServerAddress         string
	HardhatURL            string
	LedgerContractAddress string
	SignerPrivateKey      string
}

// Load populates a Config struct from environment variables.
func Load() (*Config, error) {
	dbURL := os.Getenv("DB_SOURCE")
	if dbURL == "" {
		dbURL = "postgresql://user:password@db:5432/rekamedchain?sslmode=disable"
	}

	ipfsAPI := os.Getenv("IPFS_API")
	if ipfsAPI == "" {
		ipfsAPI = "http://ipfs:5001"
	}

	ipfsGateway := os.Getenv("IPFS_GATEWAY")
	if ipfsGateway == "" {
		ipfsGateway = "http://ipfs:8080"
	}

	jwtKey := []byte(os.Getenv("JWT_SECRET"))
	if len(jwtKey) == 0 {
		jwtKey = []byte("kunci_rahasia_super_aman_jangan_ditiru")
	}

	encryptionKey := []byte(os.Getenv("ENCRYPTION_KEY"))
	if len(encryptionKey) == 0 {
		encryptionKey = []byte("ini_adalah_kunci_rahasia_32_byte") // Contoh kunci 32-byte
	}
	if len(encryptionKey) != 32 {
		return nil, fmt.Errorf("ENCRYPTION_KEY must be 32 bytes long")
	}

	serverAddress := os.Getenv("SERVER_ADDRESS")
	if serverAddress == "" {
		serverAddress = ":8080"
	}

	hardhatURL := os.Getenv("HARDHAT_URL")
	if hardhatURL == "" {
		// Ini adalah alamat internal Docker untuk layanan hardhat
		hardhatURL = "http://hardhat:8545"
	}

	// Ini adalah private key dari akun pertama yang disediakan oleh Hardhat
	signerPrivateKey := os.Getenv("SIGNER_PRIVATE_KEY")
	if signerPrivateKey == "" {
		signerPrivateKey = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
	}

	ledgerContractAddress := os.Getenv("LEDGER_CONTRACT_ADDRESS")
	if ledgerContractAddress == "" {
		// PASTE ALAMAT KONTRAK ANDA DI SINI
		ledgerContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
	}

	return &Config{
		DatabaseURL:           dbURL,
		IPFS_API:              ipfsAPI,
		IPFS_Gateway:          ipfsGateway,
		JWTKey:                jwtKey,
		EncryptionKey:         encryptionKey,
		ServerAddress:         serverAddress,
		HardhatURL:            hardhatURL,
		LedgerContractAddress: ledgerContractAddress,
		SignerPrivateKey:      signerPrivateKey,
	}, nil
}
