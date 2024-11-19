package users

import "time"

type User struct {
	Id                  string    `json:"id" gorm:"primaryKey;unique"`
	Email               string    `json:"email"`
	Password            string    `json:"-"`
	Role                string    `json:"role"`
	RefreshTokenVersion int16     `json:"refreshTokenVersion"`
	CreatedAt           time.Time `json:"-"`
	ModifiedAt          time.Time `json:"-" gorm:"autoUpdateTime"`
}
