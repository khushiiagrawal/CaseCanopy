package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SearchFilters struct {
	Jurisdiction string   `json:"jurisdiction" bson:"jurisdiction"`
	Year         string   `json:"year" bson:"year"`
	CaseType     string   `json:"caseType" bson:"caseType"`
	Outcome      string   `json:"outcome" bson:"outcome"`
	Tags         []string `json:"tags" bson:"tags"`
}

type SearchQuery struct {
	ID         primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Query      string             `json:"query" bson:"query"`
	SearchType string             `json:"searchType" bson:"searchType"`
	Filters    SearchFilters      `json:"filters" bson:"filters"`
	CreatedAt  time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt  time.Time          `json:"updatedAt" bson:"updatedAt"`
}
