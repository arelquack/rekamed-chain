package database

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Connect creates a new database pool connection.
func Connect(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	db, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(ctx); err != nil {
		return nil, err
	}

	return db, nil
}
