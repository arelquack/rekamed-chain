package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/trifur/rekamedchain/backend/internal/domain"
	"github.com/trifur/rekamedchain/backend/internal/middleware"
	"github.com/trifur/rekamedchain/backend/internal/repository"
)

// ConsentHandler handles consent-related HTTP requests.
type ConsentHandler struct {
	consentRepo repository.ConsentRepository
}

// NewConsentHandler creates a new instance of ConsentHandler.
func NewConsentHandler(consentRepo repository.ConsentRepository) *ConsentHandler {
	return &ConsentHandler{consentRepo: consentRepo}
}

// HandleRequest handles a doctor's request for consent.
func (h *ConsentHandler) HandleRequest(w http.ResponseWriter, r *http.Request) {
	doctorID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Gagal mendapatkan ID dokter dari token", http.StatusInternalServerError)
		return
	}

	var payload domain.ConsentRequestPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	requestID, err := h.consentRepo.CreateRequest(r.Context(), doctorID, payload.PatientID)
	if err != nil {
		log.Printf("Gagal membuat permintaan consent: %v", err)
		http.Error(w, "Gagal membuat permintaan", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message":    "Permintaan akses berhasil dikirim",
		"request_id": requestID,
	})
}

// HandleGetMyRequests handles fetching consent requests for the logged-in patient.
func (h *ConsentHandler) HandleGetMyRequests(w http.ResponseWriter, r *http.Request) {
	patientID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Gagal mendapatkan ID pasien dari token", http.StatusInternalServerError)
		return
	}

	requests, err := h.consentRepo.GetRequestsByPatientID(r.Context(), patientID)
	if err != nil {
		http.Error(w, "Gagal mengambil data permintaan", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(requests)
}

// HandleGrant handles a patient granting a consent request.
// This corresponds to the endpoint the mobile app calls `/consent/sign/:request_id`
// and the web app calls `/consent/grant/:request_id`.
func (h *ConsentHandler) HandleGrant(w http.ResponseWriter, r *http.Request) {
	patientID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Gagal mendapatkan ID pasien dari token", http.StatusInternalServerError)
		return
	}

	requestID := r.PathValue("request_id")

	if requestID == "" {
		http.Error(w, "Request ID dibutuhkan", http.StatusBadRequest)
		return
	}

	rowsAffected, err := h.consentRepo.GrantConsent(r.Context(), requestID, patientID)
	if err != nil || rowsAffected == 0 {
		http.Error(w, "Gagal menyetujui permintaan atau permintaan tidak ditemukan", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Permintaan berhasil disetujui",
	})
}
