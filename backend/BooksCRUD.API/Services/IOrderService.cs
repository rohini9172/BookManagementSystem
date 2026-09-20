using BooksCRUD.API.DTOs;

namespace BooksCRUD.API.Services;

public interface IOrderService
{
    Task<List<OrderResponseDto>> GetUserOrdersAsync(int userId);
    Task<OrderResponseDto?> GetOrderByIdAsync(int id, int userId);
    Task<OrderResponseDto> CheckoutAsync(int userId, CheckoutDto dto);

    // Admin
    Task<List<OrderResponseDto>> GetAllOrdersAsync(string? status);
    Task<OrderResponseDto> UpdateStatusAsync(int orderId, string status);
}
