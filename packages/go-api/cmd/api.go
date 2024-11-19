package main

import (
	"fmt"
	"go-api/internal/lib"
	"go-api/internal/modules/auth"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
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

type CustomValidator struct {
	validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	return cv.validator.Struct(i)
}

func main() {
	e := echo.New()

	e.HTTPErrorHandler = lib.CustomHTTPErrorHandler

	e.Validator = &CustomValidator{validator: validator.New()}

	e.JSONSerializer = &lib.CustomJSONSerializer{}

	e.Pre(middleware.RemoveTrailingSlash())

	e.Use(middleware.Recover(),
		middleware.Secure(),
		middleware.RequestID(),
		middleware.Gzip(),
		middleware.Logger(),
		// middleware.TimeoutWithConfig(middleware.TimeoutConfig{
		// 	Timeout: c.Config.App.Timeout,
		// }),
		middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins:     []string{"https://pos.ramaakbar.xyz", "http://localhost:3000"},
			AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
			AllowCredentials: true,
		}),
		// middleware.CSRFWithConfig(middleware.CSRFConfig{
		// 	TokenLookup:    "cookie:_csrf",
		// 	CookiePath:     "/",
		// 	CookieDomain:   "example.com",
		// 	CookieSecure:   true,
		// 	CookieHTTPOnly: true,
		// 	CookieSameSite: http.SameSiteStrictMode,
		// })
	)

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

	auth.AuthRoutes(e, db)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", lib.Envs.Port)))
}
