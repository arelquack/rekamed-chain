ALTER TABLE users
ADD COLUMN nip VARCHAR(50),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN specialization VARCHAR(100);

-- Tambahkan UNIQUE constraint pada NIP agar tidak ada NIP yang sama
ALTER TABLE users
ADD CONSTRAINT users_nip_unique UNIQUE (nip);