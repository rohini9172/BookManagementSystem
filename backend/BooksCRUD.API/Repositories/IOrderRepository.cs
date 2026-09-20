using BooksCRUD.API.Models;

namespace BooksCRUD.API.Repositories;

public interface IOrderRepository
{
    Task<List<Order>> GetUserOrdersAsync(int userId);
    Task<Order?> GetByIdAsync(int id, int? userId = null);
    Task<Order> CreateAsync(Order order);
    Task<List<Order>> GetAllOrdersAsync(string? status);
    Task<Order> UpdateAsync(Order order);
}
