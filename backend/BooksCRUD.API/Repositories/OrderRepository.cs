using BooksCRUD.API.Data;
using BooksCRUD.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BooksCRUD.API.Repositories;

public class OrderRepository(AppDbContext db) : IOrderRepository
{
    private IQueryable<Order> WithIncludes() =>
        db.Orders
            .Include(o => o.User)
            .Include(o => o.CartItems).ThenInclude(c => c.Book);

    public Task<List<Order>> GetUserOrdersAsync(int userId) =>
        WithIncludes()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public Task<Order?> GetByIdAsync(int id, int? userId = null)
    {
        var query = WithIncludes().Where(o => o.Id == id);
        if (userId.HasValue) query = query.Where(o => o.UserId == userId.Value);
        return query.FirstOrDefaultAsync();
    }

    public async Task<Order> CreateAsync(Order order)
    {
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return order;
    }

    public Task<List<Order>> GetAllOrdersAsync(string? status) =>
        WithIncludes()
            .Where(o => status == null || o.Status == status)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<Order> UpdateAsync(Order order)
    {
        db.Orders.Update(order);
        await db.SaveChangesAsync();
        return order;
    }
}
