package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trifur/rekamedchain/backend/internal/domain"
)

// ConsentRepository defines the interface for consent data operations.
type ConsentRepository interface {
	CreateRequest(ctx context.Context, doctorID, patientID string) (string, error)
	GetRequestsByPatientID(ctx context.Context, patientID string) ([]domain.ConsentRequest, error)
	GrantConsent(ctx context.Context, requestID, patientID string) (int64, error)
}

// postgresConsentRepository is the PostgreSQL implementation of ConsentRepository.
type postgresConsentRepository struct {
	db *pgxpool.Pool
}

// NewPostgresConsentRepository creates a new instance of postgresConsentRepository.
func NewPostgresConsentRepository(db *pgxpool.Pool) ConsentRepository {
	return &postgresConsentRepository{db: db}
}

// CreateRequest inserts a new consent request into the database.
func (r *postgresConsentRepository) CreateRequest(ctx context.Context, doctorID, patientID string) (string, error) {
	sql := `INSERT INTO consent_requests (doctor_id, patient_id) VALUES ($1, $2) RETURNING id`
	var requestID string
	err := r.db.QueryRow(ctx, sql, doctorID, patientID).Scan(&requestID)
	return requestID, err
}

// GetRequestsByPatientID retrieves all consent requests for a specific patient.
func (r *postgresConsentRepository) GetRequestsByPatientID(ctx context.Context, patientID string) ([]domain.ConsentRequest, error) {
	sql := `SELECT id, doctor_id, patient_id, status, created_at, updated_at FROM consent_requests WHERE patient_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, sql, patientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	requests := make([]domain.ConsentRequest, 0)
	for rows.Next() {
		var req domain.ConsentRequest
		if err := rows.Scan(&req.ID, &req.DoctorID, &req.PatientID, &req.Status, &req.CreatedAt, &req.UpdatedAt); err != nil {
			return nil, err
		}
		requests = append(requests, req)
	}
	return requests, nil
}

// GrantConsent updates the status of a consent request to 'granted'.
func (r *postgresConsentRepository) GrantConsent(ctx context.Context, requestID, patientID string) (int64, error) {
	sql := `UPDATE consent_requests SET status = 'granted', updated_at = NOW() WHERE id = $1 AND patient_id = $2`
	res, err := r.db.Exec(ctx, sql, requestID, patientID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected(), nil
}
