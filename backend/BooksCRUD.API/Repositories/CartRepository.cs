using BooksCRUD.API.Data;
using BooksCRUD.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BooksCRUD.API.Repositories;

public class CartRepository(AppDbContext db) : ICartRepository
{
    public Task<List<CartItem>> GetCartAsync(int userId) =>
        db.CartItems
            .Include(c => c.Book)
            .Where(c => c.UserId == userId && c.OrderId == null)
            .ToListAsync();

    public Task<CartItem?> GetCartItemAsync(int userId, int bookId) =>
        db.CartItems
            .Include(c => c.Book)
            .FirstOrDefaultAsync(c => c.UserId == userId && c.BookId == bookId && c.OrderId == null);

    public async Task<CartItem> AddOrUpdateAsync(CartItem item)
    {
        if (item.Id == 0) db.CartItems.Add(item);
        else db.CartItems.Update(item);
        await db.SaveChangesAsync();
        return item;
    }

    public async Task RemoveAsync(CartItem item)
    {
        db.CartItems.Remove(item);
        await db.SaveChangesAsync();
    }

    // Assigns orderId to all pending cart items — keeps them linked to the order
    public async Task AssignOrderAsync(int userId, int orderId)
    {
        var items = await db.CartItems
            .Where(c => c.UserId == userId && c.OrderId == null)
            .ToListAsync();
        foreach (var item in items)
            item.OrderId = orderId;
        await db.SaveChangesAsync();
    }

    public async Task ClearCartAsync(int userId)
    {
        var items = await db.CartItems
            .Where(c => c.UserId == userId && c.OrderId == null)
            .ToListAsync();
        db.CartItems.RemoveRange(items);
        await db.SaveChangesAsync();
    }
}
