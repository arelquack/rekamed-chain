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
	GetUserByID(ctx context.Context, id string) (*domain.User, error)
	SearchUsers(ctx context.Context, query string) ([]domain.PublicUser, error)
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

// GetUserByID retrieves a user by their ID.
func (r *postgresUserRepository) GetUserByID(ctx context.Context, id string) (*domain.User, error) {
	var user domain.User
	sql := `SELECT id, name, email, role FROM users WHERE id = $1`
	err := r.db.QueryRow(ctx, sql, id).Scan(&user.ID, &user.Name, &user.Email, &user.Role)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// SearchUsers finds users by name or email.
func (r *postgresUserRepository) SearchUsers(ctx context.Context, query string) ([]domain.PublicUser, error) {
	sql := `
		SELECT id, name, email FROM users 
		WHERE role = 'patient' AND (name ILIKE $1 OR email ILIKE $1)
		LIMIT 10;
	`
	rows, err := r.db.Query(ctx, sql, "%"+query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]domain.PublicUser, 0)
	for rows.Next() {
		var user domain.PublicUser
		if err := rows.Scan(&user.ID, &user.Name, &user.Email); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}
