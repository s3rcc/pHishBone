using Microsoft.AspNetCore.Mvc.Filters;
using System.Diagnostics;

namespace pHishbone.Filters
{
    public class ControllerRequestLoggingFilter : IAsyncActionFilter
    {
        private readonly ILogger<ControllerRequestLoggingFilter> _logger;

        public ControllerRequestLoggingFilter(ILogger<ControllerRequestLoggingFilter> logger)
        {
            _logger = logger;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var controllerName = context.ActionDescriptor.RouteValues["controller"] ?? "UnknownController";
            var actionName = context.ActionDescriptor.RouteValues["action"] ?? "UnknownAction";
            var method = context.HttpContext.Request.Method;
            var path = context.HttpContext.Request.Path;
            var stopwatch = Stopwatch.StartNew();

            _logger.LogInformation(
                "API request reached controller {Controller}.{Action} for {Method} {Path}",
                controllerName,
                actionName,
                method,
                path);

            var executedContext = await next();
            stopwatch.Stop();

            if (executedContext.Exception is not null && !executedContext.ExceptionHandled)
            {
                _logger.LogError(
                    executedContext.Exception,
                    "API request failed in controller {Controller}.{Action} for {Method} {Path} after {ElapsedMs:0.000} ms",
                    controllerName,
                    actionName,
                    method,
                    path,
                    stopwatch.Elapsed.TotalMilliseconds);
                return;
            }

            _logger.LogInformation(
                "API request completed in controller {Controller}.{Action} with status {StatusCode} after {ElapsedMs:0.000} ms",
                controllerName,
                actionName,
                executedContext.HttpContext.Response.StatusCode,
                stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
