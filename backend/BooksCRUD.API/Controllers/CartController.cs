using System.Security.Claims;
using BooksCRUD.API.DTOs;
using BooksCRUD.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BooksCRUD.API.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController(ICartService cartService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetCart() => Ok(await cartService.GetCartAsync(UserId));

    [HttpPost]
    public async Task<IActionResult> AddToCart(CartItemDto dto)
    {
        try { return Ok(await cartService.AddToCartAsync(UserId, dto)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{bookId:int}")]
    public async Task<IActionResult> UpdateItem(int bookId, [FromBody] int quantity)
    {
        try
        {
            var result = await cartService.UpdateCartItemAsync(UserId, bookId, quantity);
            return result is null ? NoContent() : Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("{bookId:int}")]
    public async Task<IActionResult> RemoveItem(int bookId)
    {
        try { await cartService.RemoveFromCartAsync(UserId, bookId); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}
