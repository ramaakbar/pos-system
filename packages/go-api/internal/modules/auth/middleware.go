package auth

import (
	"go-api/internal/lib"
	"go-api/internal/modules/users"
	"net/http"

	"github.com/labstack/echo/v4"
)

func AuthMiddleware(handler *Handler) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			accessToken, accessTokenErr := c.Cookie(AccessTokenName)
			refreshToken, refreshTokenErr := c.Cookie(RefreshTokenName)

			if accessTokenErr != nil && refreshTokenErr != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized")
			}

			CheckTokens(c, handler.db, accessToken, refreshToken)

			return next(c)
		}
	}
}

func AuthAdminMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user := c.Get(lib.ContextUserKey).(*users.User)
		if user.Role != "Admin" {
			return echo.NewHTTPError(http.StatusForbidden, "Not allowed")
		}

		return next(c)
	}
}
