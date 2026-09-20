using BooksCRUD.API.Data;
using BooksCRUD.API.DTOs;
using BooksCRUD.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BooksCRUD.API.Repositories;

public class BookRepository(AppDbContext db) : IBookRepository
{
    public async Task<PagedResult<Book>> GetBooksAsync(BookQueryDto q)
    {
        var query = db.Books.AsQueryable();

        if (!string.IsNullOrWhiteSpace(q.Title))
            query = query.Where(b => b.Title.Contains(q.Title));
        if (!string.IsNullOrWhiteSpace(q.Author))
            query = query.Where(b => b.Author.Contains(q.Author));
        if (!string.IsNullOrWhiteSpace(q.ISBN))
            query = query.Where(b => b.ISBN.Contains(q.ISBN));
        if (!string.IsNullOrWhiteSpace(q.Category))
            query = query.Where(b => b.Category == q.Category);
        if (q.MinPrice.HasValue)
            query = query.Where(b => b.Price >= q.MinPrice.Value);
        if (q.MaxPrice.HasValue)
            query = query.Where(b => b.Price <= q.MaxPrice.Value);
        if (q.InStock.HasValue && q.InStock.Value)
            query = query.Where(b => b.Stock > 0);

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(b => b.Title)
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .ToListAsync();

        return new PagedResult<Book>(items, total, q.Page, q.PageSize);
    }

    public Task<Book?> GetByIdAsync(int id) => db.Books.FindAsync(id).AsTask();

    public async Task<Book> CreateAsync(Book book)
    {
        db.Books.Add(book);
        await db.SaveChangesAsync();
        return book;
    }

    public async Task<Book> UpdateAsync(Book book)
    {
        db.Books.Update(book);
        await db.SaveChangesAsync();
        return book;
    }

    public async Task DeleteAsync(Book book)
    {
        db.Books.Remove(book);
        await db.SaveChangesAsync();
    }

    public Task<bool> IsbnExistsAsync(string isbn, int? excludeId = null) =>
        db.Books.AnyAsync(b => b.ISBN == isbn && (!excludeId.HasValue || b.Id != excludeId.Value));
}
