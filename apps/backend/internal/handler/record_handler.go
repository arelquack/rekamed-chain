package handler

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/trifur/rekamedchain/backend/internal/domain"
	"github.com/trifur/rekamedchain/backend/internal/middleware"
	"github.com/trifur/rekamedchain/backend/internal/repository"
)

// RecordHandler handles medical record related HTTP requests.
type RecordHandler struct {
	recordRepo repository.RecordRepository
	userRepo   repository.UserRepository // Dibutuhkan untuk mengambil nama dokter
}

// NewRecordHandler creates a new instance of RecordHandler.
func NewRecordHandler(recordRepo repository.RecordRepository, userRepo repository.UserRepository) *RecordHandler {
	return &RecordHandler{
		recordRepo: recordRepo,
		userRepo:   userRepo,
	}
}

// CreateRecord handles the creation of a new medical record.
func (h *RecordHandler) CreateRecord(w http.ResponseWriter, r *http.Request) {
	doctorID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Gagal mendapatkan ID dokter dari token", http.StatusInternalServerError)
		return
	}

	var payload domain.CreateRecordPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Request body tidak valid", http.StatusBadRequest)
		return
	}

	doctor, err := h.userRepo.GetUserByID(r.Context(), doctorID)
	if err != nil {
		log.Printf("Gagal mengambil nama dokter: %v", err)
		http.Error(w, "Gagal memverifikasi data dokter", http.StatusInternalServerError)
		return
	}

	newRecord := &domain.MedicalRecord{
		PatientID:     strings.TrimSpace(payload.PatientID),
		DoctorName:    "dr. " + doctor.Name,
		Diagnosis:     payload.Diagnosis,
		Notes:         payload.Notes,
		AttachmentCID: payload.AttachmentCID,
	}

	recordID, err := h.recordRepo.CreateRecord(r.Context(), newRecord)
	if err != nil {
		log.Printf("Gagal menyimpan rekam medis: %v", err)
		http.Error(w, "Gagal menyimpan rekam medis", http.StatusInternalServerError)
		return
	}

	// --- Blockchain Ledger Logic ---
	previousHash, err := h.recordRepo.GetLastLedgerHash(r.Context())
	if err != nil {
		http.Error(w, "Gagal mendapatkan blok sebelumnya", http.StatusInternalServerError)
		return
	}

	recordData := fmt.Sprintf("%s%s%s%s%s%s", recordID, newRecord.PatientID, newRecord.DoctorName, newRecord.Diagnosis, newRecord.Notes, newRecord.AttachmentCID)
	dataHash := fmt.Sprintf("%x", sha256.Sum256([]byte(recordData)))

	newBlock := &domain.LedgerBlock{
		RecordID:     recordID,
		DataHash:     dataHash,
		PreviousHash: previousHash,
	}

	if err := h.recordRepo.CreateLedgerBlock(r.Context(), newBlock); err != nil {
		log.Printf("Gagal menyimpan blok ke ledger: %v", err)
		http.Error(w, "Gagal mencatat ke blockchain ledger", http.StatusInternalServerError)
		return
	}

	log.Printf("Blok baru ditambahkan ke ledger. Hash: %s", dataHash)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message":   "Rekam medis berhasil ditambahkan dan dicatat di ledger",
		"recordID":  recordID,
		"blockHash": dataHash,
	})
}

// GetMyRecords handles fetching records for the logged-in patient.
func (h *RecordHandler) GetMyRecords(w http.ResponseWriter, r *http.Request) {
	patientID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Gagal mendapatkan ID dokter dari token", http.StatusInternalServerError)
		return
	}
	records, err := h.recordRepo.GetRecordsByPatientID(r.Context(), patientID)
	if err != nil {
		log.Printf("Gagal mengambil rekam medis: %v", err)
		http.Error(w, "Gagal mengambil data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(records)
}

// GetPatientRecords handles a doctor fetching records for a specific patient.
func (h *RecordHandler) GetPatientRecords(w http.ResponseWriter, r *http.Request) {
	// Ambil patient_id dari URL path, bukan dari token konteks
	patientID := r.PathValue("patient_id")
	if patientID == "" {
		http.Error(w, "ID Pasien tidak ditemukan di URL", http.StatusBadRequest)
		return
	}

	records, err := h.recordRepo.GetRecordsByPatientID(r.Context(), patientID)
	if err != nil {
		log.Printf("Gagal mengambil rekam medis untuk pasien %s: %v", patientID, err)
		http.Error(w, "Gagal mengambil data", http.StatusInternalServerError)
		return
	}

	// Pastikan mengembalikan array kosong, bukan null, jika tidak ada data
	if records == nil {
		records = make([]domain.MedicalRecord, 0)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(records)
}
