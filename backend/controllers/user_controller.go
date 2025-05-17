package controllers

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"casecanopy/backend/models"
	"casecanopy/backend/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type UserController struct {
	UserCollection *mongo.Collection
	EmailService   *services.EmailService
}

func NewUserController(db *mongo.Database) *UserController {
	return &UserController{
		UserCollection: db.Collection("users"),
		EmailService:   services.NewEmailService(),
	}
}

func (uc *UserController) SignupLegal(c *gin.Context) {
	name := c.PostForm("name")
	email := c.PostForm("email")
	password := c.PostForm("password")
	role := c.PostForm("role")
	phone := c.PostForm("phone")
	address := c.PostForm("address")

	fmt.Printf("Received signup request - Name: %s, Email: %s, Role: %s, Phone: %s, Address: %s\n",
		name, email, role, phone, address)

	// Check required fields
	if name == "" || email == "" || password == "" || role == "" || phone == "" || address == "" {
		fmt.Printf("Missing required fields - Name: %s, Email: %s, Password: %s, Role: %s, Phone: %s, Address: %s\n",
			name, email, password, role, phone, address)
		c.JSON(400, gin.H{"error": "Missing required fields"})
		return
	}

	// Check if user already exists
	var existing models.User
	err := uc.UserCollection.FindOne(context.Background(), bson.M{"email": email}).Decode(&existing)
	if err == nil {
		c.JSON(400, gin.H{"error": "User already exists"})
		return
	}

	// Handle file upload
	file, header, err := c.Request.FormFile("file")
	var documentPath string
	if err == nil && file != nil {
		ext := filepath.Ext(header.Filename)
		filename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), strings.ReplaceAll(name, " ", "_"), ext)
		documentsDir := "./documents"
		os.MkdirAll(documentsDir, 0755)
		filePath := filepath.Join(documentsDir, filename)
		out, err := os.Create(filePath)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to save file"})
			return
		}
		defer out.Close()
		io.Copy(out, file)
		documentPath = filePath
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Name:         name,
		Email:        email,
		Password:     string(hashedPassword),
		Role:         role,
		DocumentPath: documentPath,
		Approve:      false,
		Phone:        phone,
		Address:      address,
	}

	result, err := uc.UserCollection.InsertOne(context.Background(), user)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate JWT token
	token, err := services.GenerateToken(result.InsertedID.(primitive.ObjectID).Hex(), email, role)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate token"})
		return
	}

	// Send welcome email
	if err := uc.EmailService.SendWelcomeEmail(email, name); err != nil {
		// Log the error but don't fail the registration
		fmt.Printf("Failed to send welcome email: %v\n", err)
	}

	c.JSON(201, gin.H{
		"message": "User created successfully. Please wait for admin approval.",
		"token":   token,
		"user": gin.H{
			"id":      result.InsertedID,
			"name":    name,
			"email":   email,
			"role":    role,
			"approve": false,
			"phone":   phone,
			"address": address,
		},
	})
}

func (uc *UserController) Signin(c *gin.Context) {
	var loginData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}

	var user models.User
	err := uc.UserCollection.FindOne(context.Background(), bson.M{"email": loginData.Email}).Decode(&user)
	if err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check if user is approved (for legal users)
	if user.Role == "legal" && !user.Approve {
		fmt.Printf("Legal user %s attempted login but is not approved\n", user.Email)
		c.JSON(403, gin.H{"error": "Your account is pending approval. Please wait for admin verification."})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginData.Password))
	if err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate JWT token
	token, err := services.GenerateToken(user.ID.Hex(), user.Email, user.Role)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate token"})
		return
	}

	fmt.Printf("User %s logged in successfully. Role: %s, Approved: %v\n", user.Email, user.Role, user.Approve)

	c.JSON(200, gin.H{
		"token": token,
		"user": gin.H{
			"id":      user.ID,
			"name":    user.Name,
			"email":   user.Email,
			"role":    user.Role,
			"approve": user.Approve,
			"phone":   user.Phone,
			"address": user.Address,
		},
	})
}

func (uc *UserController) GetUserDetails(c *gin.Context) {
	// Get user ID from the URL parameter
	userID := c.Param("id")
	if userID == "" {
		c.JSON(400, gin.H{"error": "User ID is required"})
		return
	}

	// Convert string ID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Find user in database
	var user models.User
	err = uc.UserCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(404, gin.H{"error": "User not found"})
			return
		}
		c.JSON(500, gin.H{"error": "Failed to fetch user details"})
		return
	}

	// Return user details (excluding password)
	c.JSON(200, gin.H{
		"id":           user.ID,
		"name":         user.Name,
		"email":        user.Email,
		"role":         user.Role,
		"documentPath": user.DocumentPath,
		"approve":      user.Approve,
		"phone":        user.Phone,
		"address":      user.Address,
	})
}

func (uc *UserController) GetAllUsers(c *gin.Context) {
	// Find all users in database
	cursor, err := uc.UserCollection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch users"})
		return
	}
	defer cursor.Close(context.Background())

	// Decode all users
	var users []models.User
	if err := cursor.All(context.Background(), &users); err != nil {
		c.JSON(500, gin.H{"error": "Failed to parse users"})
		return
	}

	// Create response without passwords
	var userResponses []gin.H
	for _, user := range users {
		userResponses = append(userResponses, gin.H{
			"name":         user.Name,
			"email":        user.Email,
			"role":         user.Role,
			"documentPath": user.DocumentPath,
			"approve":      user.Approve,
			"phone":        user.Phone,
			"address":      user.Address,
		})
	}

	c.JSON(200, userResponses)
}
