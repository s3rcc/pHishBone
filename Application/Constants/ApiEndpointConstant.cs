namespace Application.Constants
{
    public static class ApiEndpointConstant
    {
        public static class Auth
        {
            public const string Base = "api/auth";
            public const string Register = "register";
            public const string Login = "login";
            public const string Refresh = "refresh";
            public const string Me = "me";
            public const string Logout = "logout";
            public const string ForgotPassword = "forgot-password";
            public const string ResetPassword = "reset-password";
            public const string ChangePassword = "change-password";
            public const string VerifyEmail = "verify-email";
            public const string ResendVerification = "resend-verification";
        }

        public static class Tag
        {
            public const string Base = "api/catalog/tags";
            public const string GetById = "{id}";
            public const string GetList = "";
            public const string GetPaginated = "paginated";
            public const string Create = "";
            public const string CreateRange = "range";
            public const string Update = "{id}";
            public const string Delete = "{id}";
        }

        public static class Type
        {
            public const string Base = "api/catalog/types";
            public const string GetById = "{id}";
            public const string GetList = "";
            public const string GetPaginated = "paginated";
            public const string Create = "";
            public const string CreateRange = "range";
            public const string Update = "{id}";
            public const string Delete = "{id}";
        }

        public static class Species
        {
            public const string Base = "api/catalog/species";
            public const string GetById = "{id}";
            public const string GetDetailById = "{id}/detail";
            public const string GetList = "";
            public const string GetPaginated = "paginated";
            public const string Create = "";
            public const string Update = "{id}";
            public const string Delete = "{id}";
        }
    }
}
