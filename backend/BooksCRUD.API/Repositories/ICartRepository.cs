using BooksCRUD.API.Models;

namespace BooksCRUD.API.Repositories;

public interface ICartRepository
{
    Task<List<CartItem>> GetCartAsync(int userId);
    Task<CartItem?> GetCartItemAsync(int userId, int bookId);
    Task<CartItem> AddOrUpdateAsync(CartItem item);
    Task RemoveAsync(CartItem item);
    Task AssignOrderAsync(int userId, int orderId);
    Task ClearCartAsync(int userId);
}
