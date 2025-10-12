package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trifur/rekamedchain/backend/internal/domain"
)

// UserRepository defines the interface for user data operations.
type UserRepository interface {
	CreateUser(ctx context.Context, user *domain.User) (string, error)
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	GetDoctorByEmail(ctx context.Context, email string) (*domain.User, error)
	GetUserByID(ctx context.Context, id string) (*domain.User, error)
	SearchUsers(ctx context.Context, query string, doctorID string) ([]domain.PublicUser, error)
}

// postgrestUserRepository is the PostgreSQL implementation of UserRepository.
type postgresUserRepository struct {
	db *pgxpool.Pool
}

// NewPostgresUserRepository creates a new instance of progresUserRepository
func NewPostgresUserRepository(db *pgxpool.Pool) UserRepository {
	return &postgresUserRepository{db: db}
}

// CreateUser inserts a new user into the database.
func (r *postgresUserRepository) CreateUser(ctx context.Context, user *domain.User) (string, error) {
	// PERBARUI SQL QUERY DI SINI
	sql := `INSERT INTO users (name, email, hashed_password, role, public_key, nip, phone, specialization) 
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`
	var userID string
	// PERBARUI PARAMETER QUERY DI SINI
	err := r.db.QueryRow(ctx, sql, user.Name, user.Email, user.HashedPassword, user.Role, user.PublicKey, user.NIP, user.Phone, user.Specialization).Scan(&userID)
	return userID, err
}

// GetUserByEmail retrieves a user by their email address.
func (r *postgresUserRepository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	sql := `SELECT id, name, email, role, hashed_password FROM users WHERE email = $1`
	err := r.db.QueryRow(ctx, sql, email).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.HashedPassword)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *postgresUserRepository) GetDoctorByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	sql := `SELECT id, name, email, role, specialization, hashed_password FROM users WHERE email = $1`
	err := r.db.QueryRow(ctx, sql, email).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.Specialization, &user.HashedPassword)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *postgresUserRepository) SearchUsers(ctx context.Context, query string, doctorID string) ([]domain.PublicUser, error) {
	// Query ini menggunakan LEFT JOIN untuk menggabungkan status izin.
	// COALESCE digunakan untuk memberikan nilai default 'not_requested' jika tidak ada entri izin.
	sql := `
		SELECT 
			u.id, 
			u.name, 
			u.email,
			COALESCE(
				(SELECT cr.status 
				 FROM consent_requests cr 
				 WHERE cr.patient_id = u.id AND cr.doctor_id = $2 
				 ORDER BY cr.created_at DESC 
				 LIMIT 1),
				'not_requested'
			) as consent_status
		FROM users u
		WHERE u.role = 'patient' AND (u.name ILIKE $1 OR u.email ILIKE $1)
		LIMIT 10;
	`
	rows, err := r.db.Query(ctx, sql, "%"+query+"%", doctorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]domain.PublicUser, 0)
	for rows.Next() {
		var user domain.PublicUser
		// Perbarui Scan untuk membaca kolom consent_status
		if err := rows.Scan(&user.ID, &user.Name, &user.Email, &user.ConsentStatus); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

// GetUserByID retrieves a user by their ID.
func (r *postgresUserRepository) GetUserByID(ctx context.Context, id string) (*domain.User, error) {
	var user domain.User
	// Perbarui query untuk mengambil kolom baru
	sql := `SELECT id, name, email, role, nip, phone, specialization FROM users WHERE id = $1`
	// Perbarui Scan untuk membaca kolom baru
	err := r.db.QueryRow(ctx, sql, id).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.NIP, &user.Phone, &user.Specialization)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
