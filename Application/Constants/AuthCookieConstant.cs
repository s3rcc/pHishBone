namespace Application.Constants
{
    public static class AuthCookieConstant
    {
        public const string AccessTokenCookieName = "phishbone-access-token";
        public const string RefreshTokenCookieName = "phishbone-refresh-token";
        public const int AuthCookieLifetimeInDays = 30;
    }
}
