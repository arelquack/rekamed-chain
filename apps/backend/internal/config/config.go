package config

import (
	"os"
)

// Config holds all configuration for the application.
type Config struct {
	DatabaseURL   string
	IPFS_API      string
	IPFS_Gateway  string
	JWTKey        []byte
	ServerAddress string
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

	serverAddress := os.Getenv("SERVER_ADDRESS")
	if serverAddress == "" {
		serverAddress = ":8080"
	}

	return &Config{
		DatabaseURL:   dbURL,
		IPFS_API:      ipfsAPI,
		IPFS_Gateway:  ipfsGateway,
		JWTKey:        jwtKey,
		ServerAddress: serverAddress,
	}, nil
}
