package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/rs/cors" // <-- IMPORT BARU
)

func main() {
	// Buat router baru
	mux := http.NewServeMux()

	// Definisikan handler untuk root endpoint ("/")
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "RekamedChain API is alive! 🚀")
	})

	// Konfigurasi CORS: Izinkan permintaan dari localhost:3000
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
	})
	handler := c.Handler(mux) // <-- Bungkus router kita dengan CORS

	log.Println("Backend server is starting on http://localhost:8080")

	// Jalankan server dengan handler yang sudah ada CORS-nya
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
