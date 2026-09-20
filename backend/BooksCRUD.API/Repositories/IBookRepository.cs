using BooksCRUD.API.DTOs;
using BooksCRUD.API.Models;

namespace BooksCRUD.API.Repositories;

public interface IBookRepository
{
    Task<PagedResult<Book>> GetBooksAsync(BookQueryDto query);
    Task<Book?> GetByIdAsync(int id);
    Task<Book> CreateAsync(Book book);
    Task<Book> UpdateAsync(Book book);
    Task DeleteAsync(Book book);
    Task<bool> IsbnExistsAsync(string isbn, int? excludeId = null);
}
