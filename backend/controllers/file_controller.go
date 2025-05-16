package controllers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"casecanopy/backend/models"

	"github.com/gin-gonic/gin"
)

const (
	uploadDir   = "./data"
	maxFileSize = 10 << 20 // 10MB
)

// FileController handles file-related operations
type FileController struct{}

// NewFileController creates a new FileController instance
func NewFileController() *FileController {
	// Ensure upload directory exists
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		panic(fmt.Sprintf("Failed to create upload directory: %v", err))
	}
	return &FileController{}
}

// Upload handles file upload requests
func (fc *FileController) Upload(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.FileResponse{
			Error: "No file provided",
		})
		return
	}
	defer file.Close()

	if header.Size > maxFileSize {
		c.JSON(http.StatusBadRequest, models.FileResponse{
			Error: "File too large",
		})
		return
	}

	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s%s",
		time.Now().Format("20060102_150405"),
		ext,
	)
	filepath := filepath.Join(uploadDir, filename)

	out, err := os.Create(filepath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.FileResponse{
			Error: "Failed to create file",
		})
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		c.JSON(http.StatusInternalServerError, models.FileResponse{
			Error: "Failed to save file",
		})
		return
	}

	c.JSON(http.StatusOK, models.FileResponse{
		Message:  "File uploaded successfully",
		Filename: filename,
	})
}

// Transcribe handles voice transcription requests
func (fc *FileController) Transcribe(c *gin.Context) {
	file, header, err := c.Request.FormFile("audio")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.TranscriptionResponse{
			Error: "No audio file provided",
		})
		return
	}
	defer file.Close()

	if header.Size > maxFileSize {
		c.JSON(http.StatusBadRequest, models.TranscriptionResponse{
			Error: "File too large",
		})
		return
	}

	filename := fmt.Sprintf("%s.wav",
		time.Now().Format("20060102_150405"),
	)
	filepath := filepath.Join(uploadDir, filename)

	out, err := os.Create(filepath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.TranscriptionResponse{
			Error: "Failed to create audio file",
		})
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		c.JSON(http.StatusInternalServerError, models.TranscriptionResponse{
			Error: "Failed to save audio file",
		})
		return
	}

	// TODO: Implement actual speech-to-text conversion
	c.JSON(http.StatusOK, models.TranscriptionResponse{
		Text: "This is a placeholder for transcribed text. Implement actual speech-to-text conversion.",
	})
}
