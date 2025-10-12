package domain

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// User represents a user in the system (patient or doctor)
type User struct {
	ID                  string    `json:"id"`
	Name                string    `json:"name"`
	Email               string    `json:"email"`
	Role                string    `json:"role"`
	NIP                 string    `json:"nip,omitempty"`
	Phone               string    `json:"phone,omitempty"`
	Specialization      string    `json:"specialization,omitempty"`
	HashedPassword      string    `json:"-"`
	PublicKey           string    `json:"-"`
	PrivateKeyEncrypted string    `json:"-"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// PublicUser is a safe representation of a user for public-facing search results.
type PublicUser struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	ConsentStatus string `json:"consent_status,omitempty"`
}

// UserProfile defines the detailed user data returned for the logged-in user.
type UserProfile struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Email          string `json:"email"`
	Role           string `json:"role"`
	FormattedID    string `json:"formatted_id"`
	NIP            string `json:"nip,omitempty"`
	Phone          string `json:"phone,omitempty"`
	Specialization string `json:"specialization,omitempty"`
}

// RegisterPayload defiens the structures for the registration request.
type RegisterPayload struct {
	Name           string `json:"name"`
	Email          string `json:"email"`
	Password       string `json:"password"`
	Role           string `json:"role"`
	NIP            string `json:"nip"`
	Phone          string `json:"phone"`
	Specialization string `json:"specialization"`
}

// LoginPayload defines the structure for the login request.
type LoginPayload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Claims defines the JWT claims structure.
type Claims struct {
	UserID string `json:"user_id"`
	Name   string `json:"name"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// MedicalRecord represents a single medical record entry.
type MedicalRecord struct {
	ID            string    `json:"id"`
	PatientID     string    `json:"patient_id"`
	DoctorName    string    `json:"doctor_name"`
	Diagnosis     string    `json:"diagnosis"`
	Notes         string    `json:"notes"`
	AttachmentCID string    `json:"attachment_cid"`
	CreatedAt     time.Time `json:"created_at"`
}

// CreateRecordPayload  defines the structure for creating a new medical record.
type CreateRecordPayload struct {
	PatientID     string `json:"patient_id"`
	Diagnosis     string `json:"diagnosis"`
	Notes         string `json:"notes"`
	AttachmentCID string `json:"attachment_cid"`
}

// ConsentRequest represents a request for data access from a doctor to patient.
type ConsentRequest struct {
	ID          string     `json:"id"`
	DoctorID    string     `json:"doctor_id,omitempty"`
	DoctorName  string     `json:"doctor_name"`
	PatientID   string     `json:"patient_id"`
	PatientName string     `json:"patient_name"`
	Status      string     `json:"status"`
	Duration    string     `json:"duration,omitempty"`
	DataScope   string     `json:"data_scope,omitempty"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type GrantConsentPayload struct {
	Duration  string `json:"duration"`   // e.g., "24h", "permanent"
	DataScope string `json:"data_scope"` // e.g., "all"
}

// ConsentRequestPayload defines the structure for initiating a consent request.
type ConsentRequestPayload struct {
	PatientID string `json:"patient_id"`
}

// LedgerBlock represents a single block in the simulated blochchain ledger.
type LedgerBlock struct {
	BlockID      int       `json:"block_id"`
	RecordID     string    `json:"record_id"`
	DataHash     string    `json:"data_hash"`
	PreviousHash string    `json:"previous_hash"`
	CreatedAt    time.Time `json:"created_at"`
}

// AccessLog represents a single entry in the data access log.
type AccessLog struct {
	DoctorName      string    `json:"doctor_name"`
	Action          string    `json:"action"`
	RecordDiagnosis string    `json:"record_diagnosis"`
	Timestamp       time.Time `json:"timestamp"`
	Status          string    `json:"status"`
}
