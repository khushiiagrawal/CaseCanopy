package controllers

import (
	"context"
	"net/http"

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

// GetLegalUsers returns all legal users
func (ac *AdminController) GetLegalUsers(c *gin.Context) {
	cursor, err := ac.UserCollection.Find(context.Background(), bson.M{"role": "legal"})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch legal users"})
		return
	}
	defer cursor.Close(context.Background())

	var users []models.User
	if err := cursor.All(context.Background(), &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse users"})
		return
	}

	c.JSON(http.StatusOK, users)
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

	// Update user approval status by email
	result, err := ac.UserCollection.UpdateOne(
		context.Background(),
		bson.M{"email": req.Email},
		bson.M{"$set": bson.M{"approve": true}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve user"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get user details to send email
	var user models.User
	err = ac.UserCollection.FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user details"})
		return
	}

	// Send approval email
	if err := ac.EmailService.SendApprovalEmail(user.Email, user.Name); err != nil {
		// Log the error but don't fail the approval
		c.JSON(http.StatusOK, gin.H{
			"message": "User approved successfully, but failed to send email notification",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User approved successfully"})
}
