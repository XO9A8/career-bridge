# Stage 1: Chef (Caches dependencies to speed up builds)
FROM rust:latest AS chef
RUN cargo install cargo-chef
WORKDIR /app

# Stage 2: Planner
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# Stage 3: Builder (Compiles the actual app)
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching magic!
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release

# Stage 4: Runtime (The minimal image we actually run)
FROM debian:bookworm-slim
WORKDIR /app
# Install OpenSSL/CA certificates if your app makes external API calls
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/backend ./app
CMD ["./app"]
