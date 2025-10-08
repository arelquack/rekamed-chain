package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trifur/rekamedchain/backend/internal/domain"
)

type contextKey string

const (
	UserIDKey   = contextKey("userID")
	UserRoleKey = contextKey("userRole")
)

// AuthMiddleware validates the JWT token from the Authorization header.
func AuthMiddleware(next http.Handler, jwtKey []byte) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Header Authorization dibutuhkan", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims := &domain.Claims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Token tidak valid", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		ctx = context.WithValue(ctx, UserRoleKey, claims.Role)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// DoctorMiddleware ensures that the user has the 'doctor' role.
func DoctorMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		role, ok := r.Context().Value(UserRoleKey).(string)
		if !ok || role != "doctor" {
			http.Error(w, "Akses ditolak: Hanya untuk dokter", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ConsentMiddleware checks if a doctor has been granted access to a patient's records.
func ConsentMiddleware(db *pgxpool.Pool, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		doctorID, ok := r.Context().Value(UserIDKey).(string)
		if !ok {
			http.Error(w, "ID Dokter tidak valid", http.StatusBadRequest)
			return
		}

		patientID := r.PathValue("patient_id")
		if patientID == "" {
			http.Error(w, "ID Pasien tidak valid", http.StatusBadRequest)
			return
		}

		var status string
		sql := `SELECT status FROM consent_requests WHERE doctor_id = $1 AND patient_id = $2 AND status = 'granted' LIMIT 1`
		err := db.QueryRow(r.Context(), sql, doctorID, patientID).Scan(&status)

		if err != nil {
			http.Error(w, "Akses ditolak: Anda tidak memiliki izin dari pasien ini", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
