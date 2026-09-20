namespace BooksCRUD.API.Models;

public class CartItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int BookId { get; set; }
    public int? OrderId { get; set; }
    public int Quantity { get; set; }

    public Book Book { get; set; } = null!;
    public Order? Order { get; set; }
}
