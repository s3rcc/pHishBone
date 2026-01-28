using Application.Common.Interfaces;
using Application.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<LoginResponseDto>> Register(
            [FromBody] RegisterRequestDto request)
        {
            _logger.LogInformation("User registration attempt for email: {Email}", request.Email);

            var result = await _authService.RegisterAsync(request);

            _logger.LogInformation("User registered successfully: {Email}", request.Email);

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login(
            [FromBody] LoginRequestDto request)
        {
            _logger.LogInformation("User login attempt for email: {Email}", request.Email);

            var result = await _authService.LoginAsync(request);

            _logger.LogInformation("User logged in successfully: {Email}", request.Email);

            return Ok(result);
        }
    }
}
