namespace BooksCRUD.API.DTOs;

public record RegisterDto(string Name, string Email, string Password);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string Role, string Name, int UserId);

public record BookQueryDto(
    string? Title,
    string? Author,
    string? ISBN,
    string? Category,
    decimal? MinPrice,
    decimal? MaxPrice,
    bool? InStock,
    int Page = 1,
    int PageSize = 8
);

public record BookCreateDto(
    string Title,
    string Author,
    string ISBN,
    string Category,
    string Description,
    decimal Price,
    int Stock,
    string CoverImage
);

public record BookUpdateDto(
    string Title,
    string Author,
    string ISBN,
    string Category,
    string Description,
    decimal Price,
    int Stock,
    string CoverImage
);

public record BookResponseDto(
    int Id,
    string Title,
    string Author,
    string ISBN,
    string Category,
    string Description,
    decimal Price,
    int Stock,
    string CoverImage,
    DateTime CreatedAt
);

public record PagedResult<T>(IEnumerable<T> Items, int TotalCount, int Page, int PageSize);

public record CartItemDto(int BookId, int Quantity);
public record CartItemResponseDto(int Id, int BookId, string BookTitle, string CoverImage, decimal Price, int Quantity, decimal Subtotal);

public record CheckoutDto(string ShippingAddress);
public record UpdateOrderStatusDto(string Status);

public record OrderResponseDto(
    int Id,
    int UserId,
    string UserName,
    string UserEmail,
    decimal TotalAmount,
    string Status,
    string ShippingAddress,
    DateTime CreatedAt,
    IEnumerable<CartItemResponseDto> Items
);
