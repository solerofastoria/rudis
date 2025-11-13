Write-Host "🧹 ОЧИСТКА СИСТЕМЫ DOCKER" -ForegroundColor Yellow
Write-Host "=========================================="

# Останавливаем и удаляем контейнеры
Write-Host "1. Удаляем контейнеры..." -ForegroundColor Cyan
docker ps -a --filter "name=discord_clone" --format "{{.ID}}" | ForEach-Object { 
    Write-Host "   Удаляем контейнер $_" -ForegroundColor Gray
    docker rm -f $_
}

# Удаляем volumes
Write-Host "2. Удаляем volumes..." -ForegroundColor Cyan
docker volume rm backend_postgres_data backend_redis_data 2>$null
Write-Host "   Volumes удалены" -ForegroundColor Gray

# Удаляем сети
Write-Host "3. Удаляем сети..." -ForegroundColor Cyan
docker network rm rudis_discord-network 2>$null
Write-Host "   Сети удалены" -ForegroundColor Gray

Write-Host "=========================================="
Write-Host "✅ ОЧИСТКА ЗАВЕРШЕНА" -ForegroundColor Green
Write-Host "💡 Теперь можно запустить: docker-compose up -d" -ForegroundColor Yellow