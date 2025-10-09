CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_patient
        FOREIGN KEY(patient_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);