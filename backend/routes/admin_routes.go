package routes

import (
	"casecanopy/backend/controllers"
	"casecanopy/backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupAdminRoutes(router *gin.Engine, adminController *controllers.AdminController) {
	// Public admin routes (no auth required)
	router.POST("/api/admin/login", adminController.AdminLogin)

	// Protected admin routes
	admin := router.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware())
	admin.Use(middleware.AdminMiddleware())

	admin.GET("/users/legal", adminController.GetLegalUsers)
	admin.POST("/users/legal/approve", adminController.ApproveUser)
}
