package main

import (
	"fmt"
	"go-api/internal/lib"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	Id                  string    `json:"id"`
	Email               string    `json:"email"`
	Password            string    `json:"-"`
	Role                string    `json:"role"`
	RefreshTokenVersion int16     `json:"-"`
	CreatedAt           time.Time `json:"-"`
	ModifiedAt          time.Time `json:"-"`
}

func main() {
	e := echo.New()

	e.HTTPErrorHandler = lib.CustomHTTPErrorHandler

	e.JSONSerializer = &lib.CustomJSONSerializer{}

	e.Pre(middleware.RemoveTrailingSlash())

	e.Use(middleware.Logger())

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"https://pos.ramaakbar.xyz", "http://localhost:3000"},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		AllowCredentials: true,
	}))

	// e.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
	// 	TokenLookup:    "cookie:_csrf",
	// 	CookiePath:     "/",
	// 	CookieDomain:   "example.com",
	// 	CookieSecure:   true,
	// 	CookieHTTPOnly: true,
	// 	CookieSameSite: http.SameSiteStrictMode,
	// }))

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", lib.Envs.DBHost, lib.Envs.DBUser, lib.Envs.DBPassword, lib.Envs.DBName, lib.Envs.DBPort)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	e.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"message": "ping",
		})
	})

	e.GET(("users"), func(c echo.Context) error {
		var users []User
		result := db.Unscoped().Select("id", "email", "role").Find(&users)

		if result.Error != nil {
			return c.JSON((http.StatusInternalServerError), struct {
				Message string `json:"message"`
			}{Message: result.Error.Error()})
		}

		return c.JSON(http.StatusOK, map[string]interface{}{
			"success": true,
			"data":    users,
		})
	})

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", lib.Envs.Port)))
}
