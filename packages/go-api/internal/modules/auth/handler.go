package auth

import (
	"go-api/internal/lib"
	"go-api/internal/modules/users"
	"net/http"

	"github.com/alexedwards/argon2id"
	"github.com/labstack/echo/v4"
	"github.com/oklog/ulid/v2"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func AuthRoutes(router *echo.Echo, db *gorm.DB) {
	handler := &Handler{
		db: db,
	}

	g := router.Group("/auth")
	g.POST("/login", handler.login)
	g.POST("/register", handler.register)
	g.POST("/logout", handler.logout)
	g.GET("/me", handler.getMe, AuthMiddleware(handler))
}

func (h *Handler) login(c echo.Context) error {
	body := new(LoginDTO)

	if err := c.Bind(body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var user users.User
	result := h.db.Unscoped().Select("id", "email", "role", "password", "refresh_token_version").Where("email = ?", body.Email).First(&user)

	if result.Error != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Email not found")
	}

	match, err := argon2id.ComparePasswordAndHash(body.Password, user.Password)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid Credentials")
	}

	if !match {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid Credentials")
	}

	SendAuthCookies(c, user)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    user,
	})
}

func (h *Handler) register(c echo.Context) error {
	body := new(RegisterDTO)

	if err := c.Bind(body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var user users.User
	h.db.Unscoped().Select("id", "email", "role", "password", "refresh_token_version").Where("email = ?", body.Email).First(&user)

	if user.Id != "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Email already used")
	}

	hash, err := argon2id.CreateHash(body.Password, argon2id.DefaultParams)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	user = users.User{Id: ulid.Make().String(), Email: body.Email, Password: hash, Role: "Member", RefreshTokenVersion: 1}

	result := h.db.Unscoped().Create(&user)

	if result.Error != nil {
		return echo.NewHTTPError(http.StatusBadRequest, result.Error.Error())
	}

	SendAuthCookies(c, user)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    user,
	})
}

func (h *Handler) logout(c echo.Context) error {
	ClearAuthCookies(c)
	return c.JSON(http.StatusOK, map[string]interface{}{})
}

func (h *Handler) getMe(c echo.Context) error {
	user := c.Get(lib.ContextUserKey).(*users.User)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": user,
	})
}

func (h *Handler) CheckTokens(c echo.Context, accessToken *http.Cookie, refreshToken *http.Cookie) {
	data := &TokenData{}

	if accessToken != nil {
		if err := verifyToken(accessToken.Value, lib.Envs.AccessTokenSecret, data); err == nil {
			c.Set(lib.ContextUserKey, data.User)
			// h.user = &data.User
			return
		}
	}

	if refreshToken == nil {
		c.Set(lib.ContextUserKey, users.User{})
		// h.user = &User{}
		return
	}

	data = &TokenData{}
	if err := verifyToken(refreshToken.Value, lib.Envs.RefreshTokenSecret, data); err != nil {
		c.Set(lib.ContextUserKey, users.User{})
		// h.user = &User{}
		return
	}

	var user users.User = users.User{}

	result := h.db.Unscoped().Select("id", "email", "role").Where("id = ?", data.User.Id).First(&user)

	if result.Error != nil {
		c.Set(lib.ContextUserKey, users.User{})
		// h.user = &User{}
		return
	}

	if user.RefreshTokenVersion != data.RefreshTokenVersion {
		c.Set(lib.ContextUserKey, users.User{})
		// h.user = &User{}
		return
	}

	SendAuthCookies(c, user)
}
