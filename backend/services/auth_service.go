package services

import (
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
	return token.SignedString([]byte("your-secret-key")) // Use same secret key as in AuthMiddleware
}
