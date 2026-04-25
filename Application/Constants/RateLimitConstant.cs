namespace Application.Constants
{
    /// <summary>
    /// Rate limiting policy names and default configuration values.
    /// </summary>
    public static class RateLimitConstant
    {
        // ─── Policy Names ────────────────────────────────────────────
        public const string GlobalPolicy = "global";
        public const string AuthPolicy = "auth_strict";

        // ─── Global Policy Defaults ──────────────────────────────────
        public const int GlobalPermitLimit = 100;
        public const int GlobalWindowSeconds = 60;

        // ─── Auth Policy Defaults ────────────────────────────────────
        public const int AuthPermitLimit = 5;
        public const int AuthWindowSeconds = 60;

        // ─── Error Messages ──────────────────────────────────────────
        public const string RateLimitExceeded = "Too many requests. Please try again later.";
    }
}
