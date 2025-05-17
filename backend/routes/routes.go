package routes

import (
	"time"

	"casecanopy/backend/controllers"
	"casecanopy/backend/middleware"
	"casecanopy/backend/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// SetupRouter configures all the routes for the application
func SetupRouter(db *mongo.Database) *gin.Engine {
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Initialize controllers
	fileController := controllers.NewFileController()
	userController := controllers.NewUserController(db)
	adminController := controllers.NewAdminController(db)

	// Initialize document parser service
	documentService := services.NewDocumentParserService("./documents")

	// Setup document routes
	SetupDocumentRoutes(router, documentService)

	// API routes
	api := router.Group("/api")
	{
		// File routes
		api.POST("/upload", fileController.Upload)
		api.POST("/transcribe", fileController.Transcribe)
		api.POST("/signup-legal", userController.SignupLegal)
		api.POST("/signin", userController.Signin)

		// User routes
		api.GET("/users/:id", userController.GetUserDetails)
		api.GET("/users", userController.GetAllUsers)

		// Admin routes
		api.POST("/admin/login", adminController.AdminLogin) // Public admin login route
	}

	// Protected admin routes
	admin := router.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware())
	admin.Use(middleware.AdminMiddleware())
	admin.GET("/users/legal", adminController.GetLegalUsers)
	admin.POST("/users/legal/approve", adminController.ApproveUser)

	return router
}
