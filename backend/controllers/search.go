package controllers

import (
	"context"
	"log"
	"net/http"
	"time"

	"casecanopy/backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type SearchController struct {
	DB *mongo.Database
}

func NewSearchController(db *mongo.Database) *SearchController {
	return &SearchController{DB: db}
}

func (sc *SearchController) CreateSearch(c *gin.Context) {
	var searchQuery models.SearchQuery
	if err := c.ShouldBindJSON(&searchQuery); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set timestamps
	searchQuery.CreatedAt = time.Now()
	searchQuery.UpdatedAt = time.Now()

	// Insert into database
	collection := sc.DB.Collection("searches")
	result, err := collection.InsertOne(context.Background(), searchQuery)
	if err != nil {
		log.Printf("Error inserting search query: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store search query"})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"message": "Search started",
		"id":      result.InsertedID,
	})
}

func (sc *SearchController) GetSearches(c *gin.Context) {
	collection := sc.DB.Collection("searches")
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch search queries"})
		return
	}
	defer cursor.Close(context.Background())

	var searches []models.SearchQuery
	if err := cursor.All(context.Background(), &searches); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse search queries"})
		return
	}

	c.JSON(http.StatusOK, searches)
}
