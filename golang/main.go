package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/go-sql-driver/mysql"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

const (
	MAX_CATEGORIES        = 6
	MAX_PROJECTS_ALL_VIEW = 6
)

// Models equivalent to Sequelize models
type Skill struct {
	ID    uint   `json:"id" gorm:"primaryKey"`
	Name  string `json:"name"`
	Slug  string `json:"slug"`
	Image string `json:"image"`
}

type ProjectCategory struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	IsActive bool   `json:"is_active" gorm:"column:is_active"`
}

type Project struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Image       string    `json:"image"`
	Status      string    `json:"status"`
	PublishedAt time.Time `json:"published_at"`
	Skills      []Skill   `json:"skills" gorm:"many2many:project_skills;"`
	Categories  []ProjectCategory `json:"projectCategories" gorm:"many2many:project_project_categories;"`
}

// Response struct
type HomeResponse struct {
	Skills           []Skill           `json:"skills"`
	ProjectCategories []ProjectCategory `json:"projectCategories"`
	Projects         []Project         `json:"projects"`
}

var db *gorm.DB

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Database connection
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USERNAME"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_DATABASE"),
	)

	var err error
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Test database connection
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get database instance:", err)
	}

	if err := sqlDB.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}
	log.Println("Database connected successfully (GORM)")

	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)

	// Create router
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// API routes
	api := router.Group("/api")
	{
		api.GET("/home", homeHandler)
	}

	// Get port from environment or default to 4000
	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	// Start server with cluster-like behavior (Go handles concurrency automatically)
	log.Printf("Server starting on port %s with %d CPU cores", port, runtime.NumCPU())
	
	server := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	select {}
}

func homeHandler(c *gin.Context) {

	// Get all skills
	var skills []Skill
	if err := db.Find(&skills).Error; err != nil {
		log.Printf("Error fetching skills: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Internal server error"})
		return
	}

	// Get project categories with project count (equivalent to raw SQL query)
	var projectCategories []struct {
		ProjectCategory
		ProjectsCount int `json:"projects_count"`
	}

	query := `
		SELECT pc.*, COUNT(ppc.project_id) AS projects_count
		FROM project_categories pc
		LEFT JOIN project_project_categories ppc ON pc.id = ppc.project_category_id
		LEFT JOIN projects p ON p.id = ppc.project_id 
			AND p.status = 'published' 
			AND p.published_at IS NOT NULL 
			AND p.published_at <= NOW()
			AND p.deleted_at IS NULL
		WHERE pc.is_active = 1 AND pc.deleted_at IS NULL
		GROUP BY pc.id
		ORDER BY projects_count DESC
		LIMIT ?
	`

	if err := db.Raw(query, MAX_CATEGORIES).Scan(&projectCategories).Error; err != nil {
		log.Printf("Error fetching project categories: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Internal server error"})
		return
	}

	// Extract category IDs
	var topCategoryIds []uint
	for _, cat := range projectCategories {
		topCategoryIds = append(topCategoryIds, cat.ID)
	}

	// Get projects with relations
	var projects []Project
	if len(topCategoryIds) > 0 {
		if err := db.Preload("Skills").
			Preload("Categories", "id IN ?", topCategoryIds).
			Where("status = ? AND published_at <= ?", "published", time.Now()).
			Order("published_at DESC").
			Limit(MAX_PROJECTS_ALL_VIEW).
			Find(&projects).Error; err != nil {
			log.Printf("Error fetching projects: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Internal server error"})
			return
		}
	}

	// Convert projectCategories to proper format
	var categories []ProjectCategory
	for _, pc := range projectCategories {
		categories = append(categories, pc.ProjectCategory)
	}

	// Create response
	response := HomeResponse{
		Skills:           skills,
		ProjectCategories: categories,
		Projects:         projects,
	}

	c.JSON(http.StatusOK, response)
} 