package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trifur/rekamedchain/backend/internal/domain"
)

// LogRepository defines the interface for audit log operations.
type LogRepository interface {
	GetLogsByPatientID(ctx context.Context, patientID string) ([]domain.AccessLog, error)
}

type postgresLogRepository struct {
	db *pgxpool.Pool
}

// NewPostgresLogRepository creates a new instance of LogRepository.
func NewPostgresLogRepository(db *pgxpool.Pool) LogRepository {
	return &postgresLogRepository{db: db}
}

// GetLogsByPatientID retrieves a combined audit log for a specific patient.
func (r *postgresLogRepository) GetLogsByPatientID(ctx context.Context, patientID string) ([]domain.AccessLog, error) {
	// Query ini menggabungkan data dari dua aktivitas berbeda menjadi satu log
	sql := `
		-- Log untuk pembuatan rekam medis
		SELECT 
			mr.doctor_name, 
			'membuat rekam medis' as action, 
			mr.diagnosis, 
			mr.created_at as timestamp, 
			'terverifikasi' as status
		FROM medical_records mr
		WHERE mr.patient_id = $1

		UNION ALL

		-- Log untuk permintaan izin akses
		SELECT 
			u.name as doctor_name, 
			'meminta izin akses' as action, 
			'' as diagnosis, 
			cr.created_at as timestamp, 
			cr.status
		FROM consent_requests cr
		JOIN users u ON cr.doctor_id = u.id
		WHERE cr.patient_id = $1

		ORDER BY timestamp DESC;
	`
	rows, err := r.db.Query(ctx, sql, patientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	logs := make([]domain.AccessLog, 0)
	for rows.Next() {
		var logItem domain.AccessLog
		if err := rows.Scan(&logItem.DoctorName, &logItem.Action, &logItem.RecordDiagnosis, &logItem.Timestamp, &logItem.Status); err != nil {
			return nil, err
		}
		logs = append(logs, logItem)
	}
	return logs, nil
}
