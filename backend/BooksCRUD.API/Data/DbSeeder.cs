using BooksCRUD.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BooksCRUD.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

        var admin = new User
        {
            Name = "Admin",
            Email = "admin@books.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = "Admin"
        };
        var user = new User
        {
            Name = "John Doe",
            Email = "john@books.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
            Role = "User"
        };
        context.Users.AddRange(admin, user);

        var books = new List<Book>
        {
            new() { Title = "Clean Code", Author = "Robert C. Martin", ISBN = "9780132350884", Category = "Programming", Description = "A handbook of agile software craftsmanship.", Price = 35.99m, Stock = 50, CoverImage = "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg" },
            new() { Title = "The Pragmatic Programmer", Author = "Andrew Hunt", ISBN = "9780135957059", Category = "Programming", Description = "Your journey to mastery.", Price = 42.99m, Stock = 30, CoverImage = "https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg" },
            new() { Title = "Design Patterns", Author = "Gang of Four", ISBN = "9780201633610", Category = "Programming", Description = "Elements of reusable object-oriented software.", Price = 54.99m, Stock = 20, CoverImage = "https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg" },
            new() { Title = "The Great Gatsby", Author = "F. Scott Fitzgerald", ISBN = "9780743273565", Category = "Fiction", Description = "A story of the fabulously wealthy Jay Gatsby.", Price = 12.99m, Stock = 100, CoverImage = "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg" },
            new() { Title = "To Kill a Mockingbird", Author = "Harper Lee", ISBN = "9780061935466", Category = "Fiction", Description = "A novel about racial injustice and moral growth.", Price = 14.99m, Stock = 80, CoverImage = "https://covers.openlibrary.org/b/isbn/9780061935466-L.jpg" },
            new() { Title = "Sapiens", Author = "Yuval Noah Harari", ISBN = "9780062316097", Category = "History", Description = "A brief history of humankind.", Price = 18.99m, Stock = 60, CoverImage = "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg" },
            new() { Title = "Atomic Habits", Author = "James Clear", ISBN = "9780735211292", Category = "Self-Help", Description = "An easy and proven way to build good habits.", Price = 22.99m, Stock = 75, CoverImage = "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg" },
            new() { Title = "1984", Author = "George Orwell", ISBN = "9780451524935", Category = "Fiction", Description = "A dystopian social science fiction novel.", Price = 11.99m, Stock = 90, CoverImage = "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg" },
            new() { Title = "Introduction to Algorithms", Author = "Thomas H. Cormen", ISBN = "9780262033848", Category = "Programming", Description = "Comprehensive introduction to algorithms.", Price = 89.99m, Stock = 15, CoverImage = "https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg" },
            new() { Title = "The Lean Startup", Author = "Eric Ries", ISBN = "9780307887894", Category = "Business", Description = "How today's entrepreneurs use continuous innovation.", Price = 19.99m, Stock = 45, CoverImage = "https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg" },
        };
        context.Books.AddRange(books);
        await context.SaveChangesAsync();
    }
}
