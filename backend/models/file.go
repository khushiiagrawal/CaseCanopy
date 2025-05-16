package models

import "time"

// File represents an uploaded file
type File struct {
	ID        string    `json:"id"`
	Filename  string    `json:"filename"`
	Path      string    `json:"path"`
	Size      int64     `json:"size"`
	Type      string    `json:"type"`
	CreatedAt time.Time `json:"created_at"`
}

// FileResponse represents the response for file operations
type FileResponse struct {
	Message  string `json:"message"`
	Filename string `json:"filename,omitempty"`
	Error    string `json:"error,omitempty"`
}

// TranscriptionResponse represents the response for voice transcription
type TranscriptionResponse struct {
	Text  string `json:"text"`
	Error string `json:"error,omitempty"`
}
