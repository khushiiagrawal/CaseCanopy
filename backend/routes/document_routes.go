package routes

import (
	"net/http"
	"path/filepath"
	"sync"
	"time"

	"casecanopy/backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DocStorage is a simple in-memory storage for parsed documents
type DocStorage struct {
	sync.RWMutex
	docs        map[string]interface{}
	lastDocID   string
	lastDocTime time.Time
}

// Global storage for parsed documents
var documentStorage = &DocStorage{
	docs: make(map[string]interface{}),
}

func SetupDocumentRoutes(router *gin.Engine, documentService *services.DocumentParserService) {
	// GET endpoint to retrieve parsed document by ID
	router.GET("/api/documents/:id", func(c *gin.Context) {
		id := c.Param("id")

		documentStorage.RLock()
		doc, exists := documentStorage.docs[id]
		documentStorage.RUnlock()

		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
			return
		}

		c.JSON(http.StatusOK, doc)
	})

	// GET endpoint to list all documents
	router.GET("/api/documents", func(c *gin.Context) {
		documentStorage.RLock()
		documents := make([]interface{}, 0, len(documentStorage.docs))
		for _, doc := range documentStorage.docs {
			documents = append(documents, doc)
		}
		documentStorage.RUnlock()

		c.JSON(http.StatusOK, documents)
	})

	// GET endpoint to get the latest parsed document
	router.GET("/api/latest-document", func(c *gin.Context) {
		documentStorage.RLock()

		if documentStorage.lastDocID == "" {
			documentStorage.RUnlock()
			c.JSON(http.StatusNotFound, gin.H{"error": "No documents have been parsed yet"})
			return
		}

		doc := documentStorage.docs[documentStorage.lastDocID]
		documentStorage.RUnlock()

		c.JSON(http.StatusOK, doc)
	})

	// GET endpoint to get the latest parsed document text only
	router.GET("/api/latest-text", func(c *gin.Context) {
		documentStorage.RLock()

		if documentStorage.lastDocID == "" {
			documentStorage.RUnlock()
			c.JSON(http.StatusNotFound, gin.H{"error": "No documents have been parsed yet"})
			return
		}

		doc := documentStorage.docs[documentStorage.lastDocID]
		documentStorage.RUnlock()

		// Extract document and text from the stored object
		if docMap, ok := doc.(gin.H); ok {
			if document, ok := docMap["document"]; ok {
				if docObj, ok := document.(services.SimpleParsedDocument); ok {
					c.JSON(http.StatusOK, gin.H{
						"text":  docObj.Text,
						"pages": docObj.Pages,
					})
					return
				} else if docObj, ok := document.(*services.SimpleParsedDocument); ok {
					c.JSON(http.StatusOK, gin.H{
						"text":  docObj.Text,
						"pages": docObj.Pages,
					})
					return
				} else if docObj, ok := document.(services.ParsedDocument); ok {
					c.JSON(http.StatusOK, gin.H{
						"text":  docObj.Text,
						"pages": docObj.Pages,
					})
					return
				} else if docObj, ok := document.(*services.ParsedDocument); ok {
					c.JSON(http.StatusOK, gin.H{
						"text":  docObj.Text,
						"pages": docObj.Pages,
					})
					return
				} else if docMap, ok := document.(map[string]interface{}); ok {
					c.JSON(http.StatusOK, gin.H{
						"text":  docMap["text"],
						"pages": docMap["pages"],
					})
					return
				}
			}
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not extract document text"})
	})

	// GET endpoint to get the latest parsed document as plain text
	router.GET("/api/plain-text", func(c *gin.Context) {
		documentStorage.RLock()

		if documentStorage.lastDocID == "" {
			documentStorage.RUnlock()
			c.String(http.StatusNotFound, "No documents have been parsed yet")
			return
		}

		doc := documentStorage.docs[documentStorage.lastDocID]
		documentStorage.RUnlock()

		// Extract document and text from the stored object
		if docMap, ok := doc.(gin.H); ok {
			if document, ok := docMap["document"]; ok {
				if docObj, ok := document.(services.SimpleParsedDocument); ok {
					c.String(http.StatusOK, docObj.Text)
					return
				} else if docObj, ok := document.(*services.SimpleParsedDocument); ok {
					c.String(http.StatusOK, docObj.Text)
					return
				} else if docObj, ok := document.(services.ParsedDocument); ok {
					c.String(http.StatusOK, docObj.Text)
					return
				} else if docObj, ok := document.(*services.ParsedDocument); ok {
					c.String(http.StatusOK, docObj.Text)
					return
				} else if docMap, ok := document.(map[string]interface{}); ok {
					if text, ok := docMap["text"].(string); ok {
						c.String(http.StatusOK, text)
						return
					}
				}
			}
		}

		c.String(http.StatusInternalServerError, "Could not extract document text")
	})

	router.POST("/api/parse-document", func(c *gin.Context) {
		// Get the uploaded file
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
			return
		}

		// Check if file is a PDF
		if filepath.Ext(file.Filename) != ".pdf" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Only PDF files are supported"})
			return
		}

		// Open the uploaded file
		src, err := file.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open uploaded file"})
			return
		}
		defer src.Close()

		// Parse the document
		parsedDoc, err := documentService.ParsePDF(src, file.Filename)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse document: " + err.Error()})
			return
		}

		// Generate a unique ID for the document
		docID := uuid.New().String()
		now := time.Now()

		// Create document object
		docObj := gin.H{
			"id":         docID,
			"document":   parsedDoc,
			"filename":   file.Filename,
			"created_at": now,
		}

		// Store the document in memory
		documentStorage.Lock()
		documentStorage.docs[docID] = docObj
		documentStorage.lastDocID = docID
		documentStorage.lastDocTime = now
		documentStorage.Unlock()

		// Return the parsed document with ID
		c.JSON(http.StatusOK, docObj)
	})

	// New endpoint that returns just clean text without metadata
	router.POST("/api/parse-document-simple", func(c *gin.Context) {
		// Get the uploaded file
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
			return
		}

		// Check if file is a PDF
		if filepath.Ext(file.Filename) != ".pdf" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Only PDF files are supported"})
			return
		}

		// Open the uploaded file
		src, err := file.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open uploaded file"})
			return
		}
		defer src.Close()

		// Parse the document with simple response (just text and page count)
		parsedDoc, err := documentService.ParsePDFSimple(src, file.Filename)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse document: " + err.Error()})
			return
		}

		// Generate a unique ID for the document
		docID := uuid.New().String()
		now := time.Now()

		// Create document object
		docObj := gin.H{
			"id":         docID,
			"document":   parsedDoc,
			"filename":   file.Filename,
			"created_at": now,
		}

		// Store the document in memory
		documentStorage.Lock()
		documentStorage.docs[docID] = docObj
		documentStorage.lastDocID = docID
		documentStorage.lastDocTime = now
		documentStorage.Unlock()

		// Return the simplified parsed document with ID
		c.JSON(http.StatusOK, docObj)
	})
}