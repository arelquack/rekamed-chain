ALTER TABLE users
ADD COLUMN public_key TEXT,
ADD COLUMN private_key_encrypted TEXT; -- Disimpan terenkripsi, untuk recovery (fitur masa depan)