package controllers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	//"strings"

	"casecanopy/backend/models"
	"casecanopy/backend/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type AdminController struct {
	UserCollection *mongo.Collection
	EmailService   *services.EmailService
}

func NewAdminController(db *mongo.Database) *AdminController {
	return &AdminController{
		UserCollection: db.Collection("users"),
		EmailService:   services.NewEmailService(),
	}
}

// AdminLogin handles admin authentication
func (ac *AdminController) AdminLogin(c *gin.Context) {
	// Set response headers
	c.Header("Content-Type", "application/json")

	var loginData struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input",
			"details": err.Error(),
		})
		return
	}

	// Get admin credentials from environment variables
	adminUsername := os.Getenv("ADMIN_USERNAME")
	adminPassword := os.Getenv("ADMIN_PASSWORD")

	if adminUsername == "" || adminPassword == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Admin credentials not configured",
		})
		return
	}

	if loginData.Username != adminUsername || loginData.Password != adminPassword {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid credentials",
		})
		return
	}

	// Generate JWT token
	token, err := services.GenerateToken("admin", "admin@casecanopy.com", "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token",
		})
		return
	}

	// Send success response
	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":    "admin",
			"name":  "Admin",
			"email": "admin@casecanopy.com",
			"role":  "admin",
		},
	})
}

// GetLegalUsers returns all legal users
func (ac *AdminController) GetLegalUsers(c *gin.Context) {
	// Set response headers
	c.Header("Content-Type", "application/json")

	// Find all users with role "legal"
	filter := bson.M{"role": "legal"}
	fmt.Printf("Querying MongoDB for legal users with filter: %+v\n", filter)

	// Execute the query
	cursor, err := ac.UserCollection.Find(context.Background(), filter)
	if err != nil {
		fmt.Printf("Error querying MongoDB: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch legal users from database",
		})
		return
	}
	defer cursor.Close(context.Background())

	// Decode all users
	var users []models.User
	if err := cursor.All(context.Background(), &users); err != nil {
		fmt.Printf("Error decoding users from MongoDB: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to parse users from database",
		})
		return
	}

	fmt.Printf("Successfully found %d legal users in MongoDB\n", len(users))
	for i, user := range users {
		fmt.Printf("User %d: %+v\n", i+1, user)
	}

	// Create response without sensitive information
	var userResponses []gin.H
	for _, user := range users {
		userResponses = append(userResponses, gin.H{
			"_id":           user.ID,
			"name":          user.Name,
			"email":         user.Email,
			"approve":       user.Approve,
			"documentPath":  user.DocumentPath,
			"role":          user.Role,
		})
	}

	// Log the response for debugging
	fmt.Printf("Sending response with %d legal users\n", len(userResponses))
	fmt.Printf("Response data: %+v\n", userResponses)

	c.JSON(http.StatusOK, userResponses)
}

// ApproveUser approves a legal user
func (ac *AdminController) ApproveUser(c *gin.Context) {
	var req struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required in request body"})
		return
	}

	fmt.Printf("Attempting to approve user with email: %s\n", req.Email)

	// Update user approval status by email
	result, err := ac.UserCollection.UpdateOne(
		context.Background(),
		bson.M{"email": req.Email},
		bson.M{"$set": bson.M{"approve": true}},
	)
	if err != nil {
		fmt.Printf("Error updating user approval status: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve user"})
		return
	}

	if result.MatchedCount == 0 {
		fmt.Printf("No user found with email: %s\n", req.Email)
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	fmt.Printf("Successfully updated approval status for user: %s\n", req.Email)

	// Get user details to send email
	var user models.User
	err = ac.UserCollection.FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		fmt.Printf("Error fetching updated user details: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user details"})
		return
	}

	fmt.Printf("User details after approval - Email: %s, Role: %s, Approved: %v\n", user.Email, user.Role, user.Approve)

	// Send approval email
	if err := ac.EmailService.SendApprovalEmail(user.Email, user.Name); err != nil {
		// Log the error but don't fail the approval
		fmt.Printf("Failed to send approval email: %v\n", err)
		c.JSON(http.StatusOK, gin.H{
			"message": "User approved successfully, but failed to send email notification",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User approved successfully"})
}
