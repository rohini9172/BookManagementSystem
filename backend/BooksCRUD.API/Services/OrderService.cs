using BooksCRUD.API.DTOs;
using BooksCRUD.API.Models;
using BooksCRUD.API.Repositories;

namespace BooksCRUD.API.Services;

public class OrderService(IOrderRepository orderRepo, ICartRepository cartRepo) : IOrderService
{
    private static readonly string[] ValidStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

    public async Task<List<OrderResponseDto>> GetUserOrdersAsync(int userId)
    {
        var orders = await orderRepo.GetUserOrdersAsync(userId);
        return orders.Select(ToDto).ToList();
    }

    public async Task<OrderResponseDto?> GetOrderByIdAsync(int id, int userId)
    {
        var order = await orderRepo.GetByIdAsync(id, userId);
        return order is null ? null : ToDto(order);
    }

    public async Task<OrderResponseDto> CheckoutAsync(int userId, CheckoutDto dto)
    {
        var cartItems = await cartRepo.GetCartAsync(userId);
        if (cartItems.Count == 0) throw new InvalidOperationException("Cart is empty.");

        // Validate stock before placing order
        var outOfStock = cartItems.Where(c => c.Book.Stock < c.Quantity).ToList();
        if (outOfStock.Count > 0)
        {
            var names = string.Join(", ", outOfStock.Select(c => c.Book.Title));
            throw new InvalidOperationException($"Insufficient stock for: {names}");
        }

        // Deduct stock
        foreach (var item in cartItems)
            item.Book.Stock -= item.Quantity;

        var total = cartItems.Sum(c => c.Book.Price * c.Quantity);
        var order = new Order
        {
            UserId = userId,
            TotalAmount = total,
            ShippingAddress = dto.ShippingAddress,
            Status = "Pending"
        };
        var created = await orderRepo.CreateAsync(order);

        // Link cart items to this order (preserves them for order detail)
        await cartRepo.AssignOrderAsync(userId, created.Id);

        var full = await orderRepo.GetByIdAsync(created.Id);
        return ToDto(full!);
    }

    public async Task<List<OrderResponseDto>> GetAllOrdersAsync(string? status)
    {
        var orders = await orderRepo.GetAllOrdersAsync(status);
        return orders.Select(ToDto).ToList();
    }

    public async Task<OrderResponseDto> UpdateStatusAsync(int orderId, string status)
    {
        if (!ValidStatuses.Contains(status))
            throw new ArgumentException($"Invalid status. Valid values: {string.Join(", ", ValidStatuses)}");

        var order = await orderRepo.GetByIdAsync(orderId)
            ?? throw new KeyNotFoundException("Order not found.");

        if (order.Status == "Cancelled")
            throw new InvalidOperationException("Order is already cancelled.");

        // Restore stock when cancelling
        if (status == "Cancelled")
            foreach (var item in order.CartItems)
                item.Book.Stock += item.Quantity;

        order.Status = status;
        await orderRepo.UpdateAsync(order);

        var full = await orderRepo.GetByIdAsync(orderId);
        return ToDto(full!);
    }

    private static OrderResponseDto ToDto(Order o) =>
        new(o.Id, o.UserId, o.User?.Name ?? "", o.User?.Email ?? "",
            o.TotalAmount, o.Status, o.ShippingAddress, o.CreatedAt,
            o.CartItems.Select(c => new CartItemResponseDto(
                c.Id, c.BookId, c.Book.Title, c.Book.CoverImage,
                c.Book.Price, c.Quantity, c.Book.Price * c.Quantity)));
}
