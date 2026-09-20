using BooksCRUD.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BooksCRUD.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<Book>()
            .HasIndex(b => b.Title);
        modelBuilder.Entity<Book>()
            .HasIndex(b => b.Author);
        modelBuilder.Entity<Book>()
            .HasIndex(b => b.Category);
        modelBuilder.Entity<Book>()
            .HasIndex(b => b.ISBN).IsUnique();
        modelBuilder.Entity<Book>()
            .Property(b => b.Price).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Order>()
            .HasOne(o => o.User).WithMany(u => u.Orders).HasForeignKey(o => o.UserId);
        modelBuilder.Entity<Order>()
            .Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<CartItem>()
            .HasOne(c => c.Book).WithMany(b => b.CartItems).HasForeignKey(c => c.BookId);
        modelBuilder.Entity<CartItem>()
            .HasOne(c => c.Order).WithMany(o => o.CartItems).HasForeignKey(c => c.OrderId).IsRequired(false);
    }
}
