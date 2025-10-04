CREATE TABLE consent_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_doctor FOREIGN KEY(doctor_id) REFERENCES users(id),
    CONSTRAINT fk_patient_consent FOREIGN KEY(patient_id) REFERENCES users(id),
    CHECK (status IN ('pending', 'granted', 'revoked', 'denied'))
);