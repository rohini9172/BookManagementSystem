using BooksCRUD.API.DTOs;
using BooksCRUD.API.Models;
using BooksCRUD.API.Repositories;

namespace BooksCRUD.API.Services;

public class CartService(ICartRepository cartRepo, IBookRepository bookRepo) : ICartService
{
    public async Task<List<CartItemResponseDto>> GetCartAsync(int userId)
    {
        var items = await cartRepo.GetCartAsync(userId);
        return items.Select(ToDto).ToList();
    }

    public async Task<CartItemResponseDto> AddToCartAsync(int userId, CartItemDto dto)
    {
        var book = await bookRepo.GetByIdAsync(dto.BookId)
            ?? throw new KeyNotFoundException("Book not found.");
        if (book.Stock < dto.Quantity) throw new InvalidOperationException("Insufficient stock.");

        // GetCartItemAsync now includes Book, so existing.Book is populated
        var existing = await cartRepo.GetCartItemAsync(userId, dto.BookId);
        if (existing is not null)
        {
            existing.Quantity += dto.Quantity;
            await cartRepo.AddOrUpdateAsync(existing);
            return ToDto(existing); // existing.Book already loaded via Include
        }

        var item = new CartItem { UserId = userId, BookId = dto.BookId, Quantity = dto.Quantity, Book = book };
        await cartRepo.AddOrUpdateAsync(item);
        return ToDto(item);
    }

    public async Task<CartItemResponseDto?> UpdateCartItemAsync(int userId, int bookId, int quantity)
    {
        // GetCartItemAsync includes Book — no null-ref on ToDto
        var item = await cartRepo.GetCartItemAsync(userId, bookId)
            ?? throw new KeyNotFoundException("Cart item not found.");

        if (quantity <= 0)
        {
            await cartRepo.RemoveAsync(item);
            return null;
        }

        item.Quantity = quantity;
        await cartRepo.AddOrUpdateAsync(item);
        return ToDto(item); // item.Book is already loaded
    }

    public async Task RemoveFromCartAsync(int userId, int bookId)
    {
        var item = await cartRepo.GetCartItemAsync(userId, bookId)
            ?? throw new KeyNotFoundException("Cart item not found.");
        await cartRepo.RemoveAsync(item);
    }

    private static CartItemResponseDto ToDto(CartItem c) =>
        new(c.Id, c.BookId, c.Book.Title, c.Book.CoverImage, c.Book.Price, c.Quantity, c.Book.Price * c.Quantity);
}
