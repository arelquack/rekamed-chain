package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/trifur/rekamedchain/backend/internal/domain"
	"github.com/trifur/rekamedchain/backend/internal/repository"
)

// LedgerHandler handles ledger-related HTTP requests.
type LedgerHandler struct {
	ledgerRepo repository.LedgerRepository
}

// NewLedgerHandler creates a new instance of LedgerHandler.
func NewLedgerHandler(ledgerRepo repository.LedgerRepository) *LedgerHandler {
	return &LedgerHandler{ledgerRepo: ledgerRepo}
}

// HandleGetLedger handles the request to fetch all ledger blocks.
func (h *LedgerHandler) HandleGetLedger(w http.ResponseWriter, r *http.Request) {
	blocks, err := h.ledgerRepo.GetLedgerBlocks(r.Context())
	if err != nil {
		log.Printf("Gagal mengambil data ledger: %v", err)
		http.Error(w, "Gagal mengambil data dari server", http.StatusInternalServerError)
		return
	}

	// Ensure we return an empty array, not null, if there are no blocks
	if blocks == nil {
		blocks = make([]domain.LedgerBlock, 0)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(blocks)
}
