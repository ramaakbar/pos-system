package lib

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Env                string
	Domain             string
	DBHost             string
	DBUser             string
	DBPassword         string
	DBName             string
	DBPort             string
	Port               string
	RefreshTokenSecret string
	AccessTokenSecret  string
	R2AccessKey        string
	R2AccessSecret     string
	R2Endpoint         string
	R2Subdomain        string
}

var Envs = initConfig()

func initConfig() Config {
	godotenv.Load()

	return Config{
		Port: getEnv("PORT", "3002"),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "''"),
		DBName:     getEnv("DB_NAME", "pos"),
		DBPort:     getEnv("DB_PORT", "5432"),
		// DBUser:                 getEnv("DB_USER", "root"),
		// DBPassword:             getEnv("DB_PASSWORD", "mypassword"),
		// DBAddress:              fmt.Sprintf("%s:%s", getEnv("DB_HOST", "127.0.0.1"), getEnv("DB_PORT", "3306")),
		// DBName:                 getEnv("DB_NAME", "ecom"),
		// JWTSecret:              getEnv("JWT_SECRET", "not-so-secret-now-is-it?"),
		// JWTExpirationInSeconds: getEnvAsInt("JWT_EXPIRATION_IN_SECONDS", 3600*24*7),
	}
}

// Gets the env by key or fallbacks
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}

func getEnvAsInt(key string, fallback int64) int64 {
	if value, ok := os.LookupEnv(key); ok {
		i, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return fallback
		}

		return i
	}

	return fallback
}
