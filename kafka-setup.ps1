# kafka-setup.ps1
Write-Host "Creating Kafka topics for Isomeg Bot..." -ForegroundColor Green

# Get the Kafka container name
$kafkaContainer = "apex-kafka-1"

Write-Host "Using Kafka container: $kafkaContainer" -ForegroundColor Yellow

# Commands topic (high volume) - 6 partitions
Write-Host "Creating isomeg-commands topic..." -ForegroundColor Cyan
docker exec $kafkaContainer kafka-topics --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 6 --topic isomeg-commands --config retention.ms=604800000

# Interactions topic (medium volume) - 4 partitions  
Write-Host "Creating isomeg-interactions topic..." -ForegroundColor Cyan
docker exec $kafkaContainer kafka-topics --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 4 --topic isomeg-interactions --config retention.ms=604800000

# Events topic (medium volume) - 4 partitions
Write-Host "Creating isomeg-events topic..." -ForegroundColor Cyan
docker exec $kafkaContainer kafka-topics --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 4 --topic isomeg-events --config retention.ms=2592000000

# Analytics topic (high volume, longer retention) - 8 partitions
Write-Host "Creating isomeg-analytics topic..." -ForegroundColor Cyan
docker exec $kafkaContainer kafka-topics --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 8 --topic isomeg-analytics --config retention.ms=2592000000

# Moderation topic (critical, highest retention) - 3 partitions
Write-Host "Creating isomeg-moderation topic..." -ForegroundColor Cyan
docker exec $kafkaContainer kafka-topics --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 3 --topic isomeg-moderation --config retention.ms=15552000000

# Plugins topic (low volume) - 2 partitions
Write-Host "Creating isomeg-plugins topic..." -ForegroundColor Cyan
docker exec $kafkaContainer kafka-topics --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 2 --topic isomeg-plugins --config retention.ms=604800000

Write-Host "All Kafka topics created successfully!" -ForegroundColor Green

# Verify topics
Write-Host "Listing all topics:" -ForegroundColor Yellow
docker exec $kafkaContainer kafka-topics --list --bootstrap-server localhost:9092