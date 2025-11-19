# Behavior Library - Caching Strategy

## 📦 Offline-First Architecture

Thư viện hành vi sử dụng **aggressive caching** vì dữ liệu ít thay đổi:

### Cache Configuration

- **staleTime**: 24 giờ - Data được coi là "fresh" trong 24h
- **gcTime**: 7 ngày - Data được giữ trong cache 7 ngày kể cả khi không dùng
- **Local Search**: Tìm kiếm được thực hiện trên client, không call API

### Benefits

✅ **Không bị mất focus khi search** - Filter local, không re-fetch  
✅ **Tốc độ nhanh** - Data load từ memory cache  
✅ **Tiết kiệm băng thông** - Chỉ fetch 1 lần/ngày  
✅ **Offline support** - Hoạt động được khi mất mạng (trong 7 ngày)

### Manual Refresh

User có thể pull-to-refresh để cập nhật data thủ công khi cần.

### Implementation Details

- `useBehaviorGroups()`: Cache behavior groups 24h
- `useBehaviors()`: Cache all behaviors 24h, search filtered locally
- Search uses `useMemo` to filter by: name (VI+EN), manifestation (VI+EN)
