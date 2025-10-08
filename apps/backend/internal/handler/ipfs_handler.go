package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/ipfs/boxo/files"
	ipfshttp "github.com/ipfs/kubo/client/rpc"
	iface "github.com/ipfs/kubo/core/coreiface"
)

type IpfsHandler struct {
	ipfsClient iface.CoreAPI
}

func NewIpfsHandler(ipfsClient *ipfshttp.HttpApi) *IpfsHandler {
	return &IpfsHandler{ipfsClient: ipfsClient}
}

func (h *IpfsHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	// Set timeout for context
	ctx, cancel := context.WithTimeout(r.Context(), 60*time.Second)
	defer cancel()

	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB limit
		http.Error(w, "Gagal mem-parsing form", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Gagal membaca file dari request", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fileNode := files.NewReaderFile(file)
	path, err := h.ipfsClient.Unixfs().Add(ctx, fileNode)
	if err != nil {
		log.Printf("Gagal menambahkan file ke IPFS: %v", err)
		http.Error(w, "Gagal mengupload file ke IPFS", http.StatusInternalServerError)
		return
	}

	fullPath := path.String()
	cid := strings.TrimPrefix(fullPath, "/ipfs/")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"cid": cid})
}
