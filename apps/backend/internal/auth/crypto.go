package auth

import (
	"crypto/ecdsa"
	"encoding/hex"

	"github.com/ethereum/go-ethereum/crypto"
)

// GenerateKeyPair creates a new ECDSA private/public key pair.
func GenerateKeyPair() (*ecdsa.PrivateKey, error) {
	return crypto.GenerateKey()
}

// PrivateKeyToHex converts an ECDSA private key to a hex string.
func PrivateKeyToHex(privateKey *ecdsa.PrivateKey) string {
	return hex.EncodeToString(crypto.FromECDSA(privateKey))
}

// PublicKeyToHex converts an ECDSA public key to a hex string.
func PublicKeyToHex(privateKey *ecdsa.PrivateKey) string {
	publicKeyBytes := crypto.FromECDSAPub(&privateKey.PublicKey)
	return hex.EncodeToString(publicKeyBytes)
}
