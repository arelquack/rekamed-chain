package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/trifur/rekamedchain/backend/internal/blockchain"
)

type LedgerHandler struct {
	BlockchainClient *blockchain.BlockchainClient
}

func NewLedgerHandler(bcClient *blockchain.BlockchainClient) *LedgerHandler {
	return &LedgerHandler{BlockchainClient: bcClient}
}

func (h *LedgerHandler) HandleGetLedger(w http.ResponseWriter, r *http.Request) {
	events, err := h.BlockchainClient.GetLedgerHistory()
	if err != nil {
		log.Printf("Gagal mengambil riwayat ledger dari blockchain: %v", err)
		http.Error(w, "Gagal mengambil data ledger", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}
