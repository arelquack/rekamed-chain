package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trifur/rekamedchain/backend/internal/domain"
)

// ConsentRepository defines the interface for consent data operations.
type ConsentRepository interface {
	CreateRequest(ctx context.Context, doctorID, patientID string) (string, error)
	GetRequestsByPatientID(ctx context.Context, patientID string) ([]domain.ConsentRequest, error)
	GrantConsent(ctx context.Context, requestID, patientID, duration, dataScope string) (int64, error)
	DenyConsent(ctx context.Context, requestID, patientID string) (int64, error)
	RevokeConsent(ctx context.Context, requestID, patientID string) (int64, error)
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
	sql := `SELECT 
				cr.id, 
				d.name as doctor_name, 
				cr.patient_id, 
				p.name as patient_name,
				cr.status, 
				cr.created_at, 
				cr.updated_at,
				cr.duration,
				cr.data_scope,
				cr.expires_at
			FROM consent_requests cr 
			JOIN users d ON cr.doctor_id = d.id
			JOIN users p ON cr.patient_id = p.id
			WHERE cr.patient_id = $1 
			ORDER BY cr.created_at DESC`
	rows, err := r.db.Query(ctx, sql, patientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	requests := make([]domain.ConsentRequest, 0)
	for rows.Next() {
		var req domain.ConsentRequest
		if err := rows.Scan(&req.ID,
			&req.DoctorName,
			&req.PatientID,
			&req.PatientName,
			&req.Status,
			&req.CreatedAt,
			&req.UpdatedAt,
			&req.Duration,
			&req.DataScope,
			&req.ExpiresAt); err != nil {
			return nil, err
		}
		requests = append(requests, req)
	}
	return requests, nil
}

// GrantConsent updates the status of a consent request to 'granted'.
// GrantConsent updates the status of a consent request to 'granted'.
func (r *postgresConsentRepository) GrantConsent(ctx context.Context, requestID, patientID, duration, dataScope string) (int64, error) {
	var expiresAt *time.Time
	if duration == "24h" {
		t := time.Now().Add(24 * time.Hour)
		expiresAt = &t
	}
	// Jika 'permanent', expiresAt akan tetap nil (null di DB)

	sql := `UPDATE consent_requests 
            SET status = 'granted', 
                duration = $3,
                data_scope = $4,
                expires_at = $5,
                updated_at = NOW() 
            WHERE id = $1 AND patient_id = $2 AND status = 'pending'`

	res, err := r.db.Exec(ctx, sql, requestID, patientID, duration, dataScope, expiresAt)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected(), nil
}

// DenyConsent updates the status of a consent request to 'denied'.
// Can only be done by the patient and only if the status is 'pending'.
func (r *postgresConsentRepository) DenyConsent(ctx context.Context, requestID, patientID string) (int64, error) {
	sql := `UPDATE consent_requests SET status = 'denied', updated_at = NOW() WHERE id = $1 AND patient_id = $2 AND status = 'pending'`
	res, err := r.db.Exec(ctx, sql, requestID, patientID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected(), nil
}

// RevokeConsent updates the status of a consent request to 'revoked'.
// Can only be done by the patient and only if the status was 'granted'.
func (r *postgresConsentRepository) RevokeConsent(ctx context.Context, requestID, patientID string) (int64, error) {
	sql := `UPDATE consent_requests SET status = 'revoked', updated_at = NOW() WHERE id = $1 AND patient_id = $2 AND status = 'granted'`
	res, err := r.db.Exec(ctx, sql, requestID, patientID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected(), nil
}
