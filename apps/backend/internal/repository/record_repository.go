package repository

import (
	"context"
	"database/sql"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trifur/rekamedchain/backend/internal/domain"
)

// RecordRepository defines the interface for medical record data operations.
type RecordRepository interface {
	CreateRecord(ctx context.Context, record *domain.MedicalRecord) (string, error)
	GetRecordsByPatientID(ctx context.Context, patientID string) ([]domain.MedicalRecord, error)
	CreateLedgerBlock(ctx context.Context, block *domain.LedgerBlock) error
	GetLastLedgerHash(ctx context.Context) (string, error)
}

type postgresRecordRepository struct {
	db *pgxpool.Pool
}

// NewPostgresRecordRepository creates a new instance of postgresRecordRepository.
func NewPostgresRecordRepository(db *pgxpool.Pool) RecordRepository {
	return &postgresRecordRepository{db: db}
}

// CreateRecord inserts a new medical record into the database.
func (r *postgresRecordRepository) CreateRecord(ctx context.Context, record *domain.MedicalRecord) (string, error) {
	query := `INSERT INTO medical_records (patient_id, doctor_name, diagnosis, notes, attachment_cid) 
			VALUES ($1, $2, $3, $4, $5) RETURNING id`
	var recordID string
	err := r.db.QueryRow(ctx, query, record.PatientID, record.DoctorName, record.Diagnosis, record.Notes, record.AttachmentCID).Scan(&recordID)
	return recordID, err
}

// GetRecordsByPatientID retrieves all medical records for a given patient.
func (r *postgresRecordRepository) GetRecordsByPatientID(ctx context.Context, patientID string) ([]domain.MedicalRecord, error) {
	query := `SELECT id, patient_id, doctor_name, diagnosis, notes, attachment_cid, created_at 
			FROM medical_records WHERE patient_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, patientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []domain.MedicalRecord
	for rows.Next() {
		var record domain.MedicalRecord
		var attachmentCID sql.NullString
		if err := rows.Scan(&record.ID, &record.PatientID, &record.DoctorName, &record.Diagnosis, &record.Notes, &attachmentCID, &record.CreatedAt); err != nil {
			return nil, err
		}
		if attachmentCID.Valid {
			record.AttachmentCID = attachmentCID.String
		}
		records = append(records, record)
	}
	return records, nil
}

// CreateLedgerBlock inserts a new block into the blockchain_ledger table.
func (r *postgresRecordRepository) CreateLedgerBlock(ctx context.Context, block *domain.LedgerBlock) error {
	query := `INSERT INTO blockchain_ledger (record_id, data_hash, previous_hash) VALUES ($1, $2, $3)`
	_, err := r.db.Exec(ctx, query, block.RecordID, block.DataHash, block.PreviousHash)
	return err
}

// GetLastLedgerHash retrieves the hash of the most recent block in the ledger.
func (r *postgresRecordRepository) GetLastLedgerHash(ctx context.Context) (string, error) {
	var previousHash string
	query := `SELECT data_hash FROM blockchain_ledger ORDER BY block_id DESC LIMIT 1`
	err := r.db.QueryRow(ctx, query).Scan(&previousHash)
	if err != nil {
		if err == pgx.ErrNoRows {
			// Return a hash of zeroes for the genesis block
			return "0000000000000000000000000000000000000000000000000000000000000000", nil
		}
		return "", err
	}
	return previousHash, nil
}
