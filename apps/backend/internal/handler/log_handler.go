package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/trifur/rekamedchain/backend/internal/domain"
	"github.com/trifur/rekamedchain/backend/internal/repository"
)

// LogHandler handles audit log related HTTP requests.
type LogHandler struct {
	logRepo repository.LogRepository
}

// NewLogHandler creates a new instance of LogHandler.
func NewLogHandler(logRepo repository.LogRepository) *LogHandler {
	return &LogHandler{logRepo: logRepo}
}

// HandleGetAuditLog handles the request to fetch audit logs for a specific patient.
func (h *LogHandler) HandleGetAuditLog(w http.ResponseWriter, r *http.Request) {
	patientID := r.PathValue("patient_id")
	if patientID == "" {
		http.Error(w, "ID Pasien tidak ditemukan di URL", http.StatusBadRequest)
		return
	}

	logs, err := h.logRepo.GetLogsByPatientID(r.Context(), patientID)
	if err != nil {
		log.Printf("Gagal mengambil data log audit untuk pasien %s: %v", patientID, err)
		http.Error(w, "Gagal mengambil data dari server", http.StatusInternalServerError)
		return
	}

	if logs == nil {
		logs = make([]domain.AccessLog, 0)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}
