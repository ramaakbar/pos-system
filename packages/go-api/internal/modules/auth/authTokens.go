package auth

import (
	"fmt"
	"go-api/internal/lib"
	"go-api/internal/modules/users"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func createAuthTokens(user users.User) (string, string, error) {
	refreshPayload := map[string]interface{}{
		"user":                user,
		"refreshTokenVersion": 1,
	}

	accessPayload := map[string]interface{}{
		"user": user,
	}

	refreshTokenSecret := lib.Envs.RefreshTokenSecret
	accessTokenSecret := lib.Envs.AccessTokenSecret

	refreshToken, err := SignJWT(refreshPayload, refreshTokenSecret, "720h") // 30d = 720h
	if err != nil {
		return "", "", fmt.Errorf("error creating refresh token: %v", err)
	}

	accessToken, err := SignJWT(accessPayload, accessTokenSecret, "15m") // 15 minutes
	if err != nil {
		return "", "", fmt.Errorf("error creating access token: %v", err)
	}

	return accessToken, refreshToken, nil
}

type TokenData struct {
	User                users.User `json:"user"`
	RefreshTokenVersion int16      `json:"refreshTokenVersion"`
	jwt.RegisteredClaims
}

const (
	AccessTokenName  = "accessToken"
	RefreshTokenName = "refreshToken"
)

func generateCookieOptions(name, value string, delete bool) *http.Cookie {
	cookie := &http.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   365 * 24 * 60 * 60, // 1 year in seconds (default)
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure: func() bool {
			return lib.Envs.Env == "production"
		}(),
		Domain: func() string {
			if lib.Envs.Env == "production" {
				return lib.Envs.Domain
			}
			return ""
		}(),
	}

	if delete {
		cookie.MaxAge = -1
		cookie.Expires = time.Unix(0, 0) // The Unix epoch (January 1, 1970)
	}

	return cookie
}

func SendAuthCookies(c echo.Context, user users.User) error {
	accessToken, refreshToken, err := createAuthTokens(user)
	if err != nil {
		return err
	}

	c.SetCookie(generateCookieOptions(AccessTokenName, accessToken, false))

	c.SetCookie(generateCookieOptions(RefreshTokenName, refreshToken, false))

	return nil
}

func CheckTokens(c echo.Context, db *gorm.DB, accessToken *http.Cookie, refreshToken *http.Cookie) {
	data := &TokenData{}

	if accessToken != nil {
		if err := verifyToken(accessToken.Value, lib.Envs.AccessTokenSecret, data); err == nil {
			c.Set(lib.ContextUserKey, &data.User)
			return
		}
	}

	if refreshToken == nil {
		c.Set(lib.ContextUserKey, &users.User{})
		return
	}

	fmt.Println("Masuk sini 1")

	data = &TokenData{}
	if err := verifyToken(refreshToken.Value, lib.Envs.RefreshTokenSecret, data); err != nil {
		c.Set(lib.ContextUserKey, &users.User{})
		return
	}

	var user users.User = users.User{}

	result := db.Unscoped().Select("id", "email", "role", "refresh_token_version").Where("id = ?", data.User.Id).First(&user)

	if result.Error != nil {
		c.Set(lib.ContextUserKey, &users.User{})
		return
	}

	if user.RefreshTokenVersion != data.RefreshTokenVersion {
		fmt.Println(user)
		fmt.Println(data)
		c.Set(lib.ContextUserKey, &users.User{})
		return
	}

	SendAuthCookies(c, user)
	c.Set(lib.ContextUserKey, &user)
}

func verifyToken(tokenString string, secret string, claims jwt.Claims) error {
	_, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	return err
}

func ClearAuthCookies(c echo.Context) {
	c.SetCookie(generateCookieOptions(AccessTokenName, "", true))
	c.SetCookie(generateCookieOptions(RefreshTokenName, "", true))
}

func SignJWT(payload map[string]interface{}, secret string, expiresIn string) (string, error) {
	duration, err := time.ParseDuration(expiresIn)
	if err != nil {
		return "", fmt.Errorf("invalid expiresIn value: %v", err)
	}

	claims := jwt.MapClaims{
		"iat": time.Now().Unix(),               // Issued at time
		"exp": time.Now().Add(duration).Unix(), // Expiration time
	}

	for key, value := range payload {
		claims[key] = value
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %v", err)
	}

	return signedToken, nil
}
