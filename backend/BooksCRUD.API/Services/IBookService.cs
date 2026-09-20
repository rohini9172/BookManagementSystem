using BooksCRUD.API.DTOs;

namespace BooksCRUD.API.Services;

public interface IBookService
{
    Task<PagedResult<BookResponseDto>> GetBooksAsync(BookQueryDto query);
    Task<BookResponseDto?> GetByIdAsync(int id);
    Task<BookResponseDto> CreateAsync(BookCreateDto dto);
    Task<BookResponseDto> UpdateAsync(int id, BookUpdateDto dto);
    Task DeleteAsync(int id);
}
