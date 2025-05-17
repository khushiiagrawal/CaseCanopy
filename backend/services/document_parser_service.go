package services

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
)

type DocumentParserService struct {
	uploadDir string
}

type ParsedDocument struct {
	Text     string            `json:"text"`
	Metadata map[string]string `json:"metadata"`
	Pages    int               `json:"pages"`
}

// SimpleParsedDocument contains only essential information
type SimpleParsedDocument struct {
	Text  string `json:"text"`
	Pages int    `json:"pages"`
}

func NewDocumentParserService(uploadDir string) *DocumentParserService {
	// Create upload directory if it doesn't exist
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		panic(fmt.Sprintf("Failed to create upload directory: %v", err))
	}
	return &DocumentParserService{
		uploadDir: uploadDir,
	}
}

func (s *DocumentParserService) ParsePDFSimple(file io.Reader, filename string) (*SimpleParsedDocument, error) {
	// Save the uploaded file temporarily
	tempPath := filepath.Join(s.uploadDir, filename)
	tempFile, err := os.Create(tempPath)
	if err != nil {
		return nil, fmt.Errorf("failed to create temp file: %v", err)
	}
	defer os.Remove(tempPath)
	defer tempFile.Close()

	if _, err := io.Copy(tempFile, file); err != nil {
		return nil, fmt.Errorf("failed to save uploaded file: %v", err)
	}

	// Use pdftotext (if available) for better text extraction
	cleanText, err := s.extractTextWithPdfToText(tempPath)
	if err != nil {
		// Fallback to pdfcpu if pdftotext fails
		doc, err := s.ParsePDF(file, filename)
		if err != nil {
			return nil, err
		}
		return &SimpleParsedDocument{
			Text:  doc.Text,
			Pages: doc.Pages,
		}, nil
	}

	// Get page count
	pdfFile, err := os.Open(tempPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open PDF file: %v", err)
	}
	defer pdfFile.Close()

	conf := model.NewDefaultConfiguration()
	info, err := api.PDFInfo(pdfFile, filename, nil, conf)
	if err != nil {
		// If we can't get page count, just set it to 0
		return &SimpleParsedDocument{
			Text:  cleanText,
			Pages: 0,
		}, nil
	}

	return &SimpleParsedDocument{
		Text:  cleanText,
		Pages: info.PageCount,
	}, nil
}

// Try to extract text using pdftotext (from poppler-utils) if available
func (s *DocumentParserService) extractTextWithPdfToText(pdfPath string) (string, error) {
	// Check if pdftotext is available
	_, err := exec.LookPath("pdftotext")
	if err != nil {
		return "", fmt.Errorf("pdftotext not found: %v", err)
	}

	// Create a temporary file for the text output
	textFilePath := pdfPath + ".txt"
	defer os.Remove(textFilePath)

	// Run pdftotext
	cmd := exec.Command("pdftotext", "-layout", pdfPath, textFilePath)
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("pdftotext failed: %v", err)
	}

	// Read the text file
	text, err := os.ReadFile(textFilePath)
	if err != nil {
		return "", fmt.Errorf("failed to read text file: %v", err)
	}

	return string(text), nil
}

func (s *DocumentParserService) ParsePDF(file io.Reader, filename string) (*ParsedDocument, error) {
	// Save the uploaded file temporarily
	tempPath := filepath.Join(s.uploadDir, filename)
	tempFile, err := os.Create(tempPath)
	if err != nil {
		return nil, fmt.Errorf("failed to create temp file: %v", err)
	}
	defer os.Remove(tempPath)
	defer tempFile.Close()

	if _, err := io.Copy(tempFile, file); err != nil {
		return nil, fmt.Errorf("failed to save uploaded file: %v", err)
	}

	// Get PDF info
	conf := model.NewDefaultConfiguration()
	pdfFile, err := os.Open(tempPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open PDF file: %v", err)
	}
	defer pdfFile.Close()

	info, err := api.PDFInfo(pdfFile, filename, nil, conf)
	if err != nil {
		return nil, fmt.Errorf("failed to get PDF info: %v", err)
	}

	// Extract text using pdfcpu
	textDir := filepath.Join(s.uploadDir, "text")
	if err := os.MkdirAll(textDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create text directory: %v", err)
	}
	defer os.RemoveAll(textDir)

	err = api.ExtractContentFile(tempPath, textDir, nil, conf)
	if err != nil {
		return nil, fmt.Errorf("failed to extract text: %v", err)
	}

	// Read extracted text
	var textBuilder strings.Builder
	files, err := os.ReadDir(textDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read text directory: %v", err)
	}

	for _, file := range files {
		if !file.IsDir() {
			content, err := os.ReadFile(filepath.Join(textDir, file.Name()))
			if err != nil {
				return nil, fmt.Errorf("failed to read text file: %v", err)
			}
			textBuilder.Write(content)
			textBuilder.WriteString("\n")
		}
	}

	// Parse metadata from info
	metadata := make(map[string]string)
	if info.Title != "" {
		metadata["Title"] = info.Title
	}
	if info.Author != "" {
		metadata["Author"] = info.Author
	}
	if info.Subject != "" {
		metadata["Subject"] = info.Subject
	}
	if len(info.Keywords) > 0 {
		metadata["Keywords"] = strings.Join(info.Keywords, ", ")
	}
	if info.Creator != "" {
		metadata["Creator"] = info.Creator
	}
	if info.Producer != "" {
		metadata["Producer"] = info.Producer
	}

	return &ParsedDocument{
		Text:     textBuilder.String(),
		Metadata: metadata,
		Pages:    info.PageCount,
	}, nil
}