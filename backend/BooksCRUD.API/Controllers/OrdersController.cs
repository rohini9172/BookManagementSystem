using System.Security.Claims;
using BooksCRUD.API.DTOs;
using BooksCRUD.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BooksCRUD.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── User endpoints ──────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetOrders() =>
        Ok(await orderService.GetUserOrdersAsync(UserId));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var order = await orderService.GetOrderByIdAsync(id, UserId);
        return order is null ? NotFound(new { message = "Order not found." }) : Ok(order);
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout(CheckoutDto dto)
    {
        try { return Ok(await orderService.CheckoutAsync(UserId, dto)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // ── Admin endpoints ─────────────────────────────────────────────
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllOrders([FromQuery] string? status) =>
        Ok(await orderService.GetAllOrdersAsync(status));

    [HttpPut("admin/{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
    {
        try { return Ok(await orderService.UpdateStatusAsync(id, dto.Status)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
