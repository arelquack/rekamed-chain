CREATE TABLE IF NOT EXISTS blockchain_ledger (
    block_id SERIAL PRIMARY KEY,
    record_id UUID NOT NULL,
    data_hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_record
        FOREIGN KEY(record_id) 
        REFERENCES medical_records(id)
        ON DELETE CASCADE
);