package services

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt"
)

func GenerateToken(userId, email, role string) (string, error) {
	claims := jwt.MapClaims{
		"userId": userId,
		"email":  email,
		"role":   role,
		"exp":    time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		secretKey = "your-secret-key" // Fallback for development
	}
	return token.SignedString([]byte(secretKey))
}
