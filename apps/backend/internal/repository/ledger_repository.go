package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trifur/rekamedchain/backend/internal/domain"
)

// LedgerRepository defines the interface for ledger data operations.
type LedgerRepository interface {
	GetLedgerBlocks(ctx context.Context) ([]domain.LedgerBlock, error)
}

type postgresLedgerRepository struct {
	db *pgxpool.Pool
}

// NewPostgresLedgerRepository creates a new instance of LedgerRepository.
func NewPostgresLedgerRepository(db *pgxpool.Pool) LedgerRepository {
	return &postgresLedgerRepository{db: db}
}

// GetLedgerBlocks retrieves all blocks from the ledger, ordered by creation time.
func (r *postgresLedgerRepository) GetLedgerBlocks(ctx context.Context) ([]domain.LedgerBlock, error) {
	sql := `SELECT block_id, record_id, data_hash, previous_hash, created_at 
			FROM blockchain_ledger ORDER BY block_id DESC`
	rows, err := r.db.Query(ctx, sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	blocks := make([]domain.LedgerBlock, 0)
	for rows.Next() {
		var block domain.LedgerBlock
		if err := rows.Scan(&block.BlockID, &block.RecordID, &block.DataHash, &block.PreviousHash, &block.CreatedAt); err != nil {
			return nil, err
		}
		blocks = append(blocks, block)
	}
	return blocks, nil
}
