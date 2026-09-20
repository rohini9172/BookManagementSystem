using BooksCRUD.API.DTOs;
using BooksCRUD.API.Models;
using BooksCRUD.API.Repositories;

namespace BooksCRUD.API.Services;

public class BookService(IBookRepository bookRepo) : IBookService
{
    public async Task<PagedResult<BookResponseDto>> GetBooksAsync(BookQueryDto query)
    {
        var result = await bookRepo.GetBooksAsync(query);
        return new PagedResult<BookResponseDto>(
            result.Items.Select(ToDto),
            result.TotalCount,
            result.Page,
            result.PageSize
        );
    }

    public async Task<BookResponseDto?> GetByIdAsync(int id)
    {
        var book = await bookRepo.GetByIdAsync(id);
        return book is null ? null : ToDto(book);
    }

    public async Task<BookResponseDto> CreateAsync(BookCreateDto dto)
    {
        if (dto.Price <= 0) throw new ArgumentException("Price must be greater than 0.");
        if (await bookRepo.IsbnExistsAsync(dto.ISBN))
            throw new InvalidOperationException("ISBN already exists.");

        var book = new Book
        {
            Title = dto.Title, Author = dto.Author, ISBN = dto.ISBN,
            Category = dto.Category, Description = dto.Description,
            Price = dto.Price, Stock = dto.Stock, CoverImage = dto.CoverImage
        };
        return ToDto(await bookRepo.CreateAsync(book));
    }

    public async Task<BookResponseDto> UpdateAsync(int id, BookUpdateDto dto)
    {
        var book = await bookRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Book not found.");
        if (dto.Price <= 0) throw new ArgumentException("Price must be greater than 0.");
        if (await bookRepo.IsbnExistsAsync(dto.ISBN, id))
            throw new InvalidOperationException("ISBN already exists.");

        book.Title = dto.Title; book.Author = dto.Author; book.ISBN = dto.ISBN;
        book.Category = dto.Category; book.Description = dto.Description;
        book.Price = dto.Price; book.Stock = dto.Stock; book.CoverImage = dto.CoverImage;

        return ToDto(await bookRepo.UpdateAsync(book));
    }

    public async Task DeleteAsync(int id)
    {
        var book = await bookRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Book not found.");
        await bookRepo.DeleteAsync(book);
    }

    private static BookResponseDto ToDto(Book b) =>
        new(b.Id, b.Title, b.Author, b.ISBN, b.Category, b.Description, b.Price, b.Stock, b.CoverImage, b.CreatedAt);
}
