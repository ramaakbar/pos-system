FROM golang:1.23.2 as builder
WORKDIR /app
COPY packages/go-api/ .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o go-api cmd/api.go

FROM scratch as runner
WORKDIR /app
COPY --from=builder /app/go-api .
EXPOSE 3002
CMD ["./go-api"]