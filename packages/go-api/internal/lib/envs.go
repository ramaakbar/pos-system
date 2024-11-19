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
		Port:               getEnv("PORT", "3002"),
		Env:                getEnv("NODE_ENV", "development"),
		Domain:             getEnv("DOMAIN", ""),
		DBHost:             getEnv("DB_HOST", "localhost"),
		DBUser:             getEnv("DB_USER", "postgres"),
		DBPassword:         getEnv("DB_PASSWORD", "''"),
		DBName:             getEnv("DB_NAME", "pos"),
		DBPort:             getEnv("DB_PORT", "5432"),
		RefreshTokenSecret: getEnv("REFRESH_TOKEN_SECRET", ""),
		AccessTokenSecret:  getEnv("ACCESS_TOKEN_SECRET", ""),
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
