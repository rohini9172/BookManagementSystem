using BooksCRUD.API.DTOs;

namespace BooksCRUD.API.Services;

public interface ICartService
{
    Task<List<CartItemResponseDto>> GetCartAsync(int userId);
    Task<CartItemResponseDto> AddToCartAsync(int userId, CartItemDto dto);
    Task<CartItemResponseDto?> UpdateCartItemAsync(int userId, int bookId, int quantity);
    Task RemoveFromCartAsync(int userId, int bookId);
}
