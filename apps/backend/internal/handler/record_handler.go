package handler

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/trifur/rekamedchain/backend/internal/blockchain"
	"github.com/trifur/rekamedchain/backend/internal/crypto"
	"github.com/trifur/rekamedchain/backend/internal/domain"
	"github.com/trifur/rekamedchain/backend/internal/middleware"
	"github.com/trifur/rekamedchain/backend/internal/repository"
)

// RecordHandler handles medical record related HTTP requests.
type RecordHandler struct {
	recordRepo       repository.RecordRepository
	userRepo         repository.UserRepository // Dibutuhkan untuk mengambil nama dokter
	encryptionKey    []byte
	blockchainClient *blockchain.BlockchainClient
}

// NewRecordHandler creates a new instance of RecordHandler.
func NewRecordHandler(recordRepo repository.RecordRepository, userRepo repository.UserRepository, encryptionKey []byte, bcClient *blockchain.BlockchainClient) *RecordHandler {
	return &RecordHandler{
		recordRepo:       recordRepo,
		userRepo:         userRepo,
		encryptionKey:    encryptionKey,
		blockchainClient: bcClient,
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

	encryptedDiagnosis, err := crypto.Encrypt(payload.Diagnosis, h.encryptionKey)
	if err != nil {
		log.Printf("Gagal mengenkripsi diagnosis: %v", err)
		http.Error(w, "Gagal memproses data", http.StatusInternalServerError)
		return
	}
	encryptedNotes, err := crypto.Encrypt(payload.Notes, h.encryptionKey)
	if err != nil {
		log.Printf("Gagal mengenkripsi catatan: %v", err)
		http.Error(w, "Gagal memproses data", http.StatusInternalServerError)
		return
	}

	newRecord := &domain.MedicalRecord{
		PatientID:     strings.TrimSpace(payload.PatientID),
		DoctorName:    "dr. " + doctor.Name,
		Diagnosis:     encryptedDiagnosis, // Simpan data terenkripsi
		Notes:         encryptedNotes,     // Simpan data terenkripsi
		AttachmentCID: payload.AttachmentCID,
	}

	recordID, err := h.recordRepo.CreateRecord(r.Context(), newRecord)
	if err != nil {
		log.Printf("Gagal menyimpan rekam medis: %v", err)
		http.Error(w, "Gagal menyimpan rekam medis", http.StatusInternalServerError)
		return
	}

	// --- LOGIKA BLOCKCHAIN BARU ---
	// 1. Buat hash dari data rekam medis
	recordData := fmt.Sprintf("%s%s%s%s%s%s", recordID, newRecord.PatientID, newRecord.DoctorName, newRecord.Diagnosis, newRecord.Notes, newRecord.AttachmentCID)
	dataHash := fmt.Sprintf("%x", sha256.Sum256([]byte(recordData)))

	// 2. Panggil fungsi di smart contract
	tx, err := h.blockchainClient.AddRecord(dataHash)
	if err != nil {
		log.Printf("Gagal mencatat transaksi ke blockchain: %v", err)
		http.Error(w, "Gagal mencatat ke blockchain", http.StatusInternalServerError)
		return
	}

	log.Printf("Transaksi berhasil dikirim ke blockchain! Hash Transaksi: %s", tx.Hash().Hex())
	// --- AKHIR LOGIKA BLOCKCHAIN BARU ---

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message":  "Rekam medis berhasil ditambahkan dan dicatat di blockchain",
		"recordID": recordID,
		"txHash":   tx.Hash().Hex(), // Kembalikan hash transaksi, bukan hash data
	})
}

// GetMyRecords handles fetching records for the logged-in patient.
func (h *RecordHandler) GetMyRecords(w http.ResponseWriter, r *http.Request) {
	patientID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Gagal mendapatkan patient Id", http.StatusInternalServerError)
		return
	}

	records, err := h.recordRepo.GetRecordsByPatientID(r.Context(), patientID)
	if err != nil { /* ... error handling ... */
	}

	// --- DECRYPT DATA ---
	for i := range records {
		decryptedDiagnosis, err := crypto.Decrypt(records[i].Diagnosis, h.encryptionKey)
		if err == nil {
			records[i].Diagnosis = decryptedDiagnosis
		}
		decryptedNotes, err := crypto.Decrypt(records[i].Notes, h.encryptionKey)
		if err == nil {
			records[i].Notes = decryptedNotes
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(records)
}

// GetPatientRecords handles a doctor fetching records for a specific patient.
func (h *RecordHandler) GetPatientRecords(w http.ResponseWriter, r *http.Request) {
	patientID := r.PathValue("patient_id")
	if patientID == "" { /* ... error handling ... */
	}

	records, err := h.recordRepo.GetRecordsByPatientID(r.Context(), patientID)
	if err != nil { /* ... error handling ... */
	}

	// --- DECRYPT DATA ---
	for i := range records {
		decryptedDiagnosis, err := crypto.Decrypt(records[i].Diagnosis, h.encryptionKey)
		if err == nil {
			records[i].Diagnosis = decryptedDiagnosis
		} else {
			records[i].Diagnosis = "[Gagal Dekripsi Data]" // Tampilkan pesan jika gagal
		}
		decryptedNotes, err := crypto.Decrypt(records[i].Notes, h.encryptionKey)
		if err == nil {
			records[i].Notes = decryptedNotes
		} else {
			records[i].Notes = "[Gagal Dekripsi Data]"
		}
	}

	if records == nil {
		records = make([]domain.MedicalRecord, 0)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(records)
}
