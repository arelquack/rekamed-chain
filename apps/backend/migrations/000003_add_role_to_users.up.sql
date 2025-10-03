ALTER TABLE users
ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'patient'
CHECK (role IN ('patient', 'doctor'));