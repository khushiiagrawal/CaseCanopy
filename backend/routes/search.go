package routes

import (
	"casecanopy/backend/controllers"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupSearchRoutes(router *gin.Engine, db *mongo.Database) {
	searchController := controllers.NewSearchController(db)

	searchRoutes := router.Group("/api/submit")
	{
		searchRoutes.POST("/", searchController.CreateSearch)
		searchRoutes.GET("/", searchController.GetSearches)
	}
}
