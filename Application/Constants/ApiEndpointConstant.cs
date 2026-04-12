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
            public const string MeAvatar = "me/avatar";
            public const string ChangeEmail = "change-email";
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
            public const string Search = "search";
            public const string GetBySlug = "by-slug/{slug}";
            public const string Create = "";
            public const string Update = "{id}";
            public const string Delete = "{id}";
            public const string GenerateFishInformation = "ai/fish-information";
        }

        public static class Tank
        {
            public const string Base = "api/tanks";
            public const string GetUserTanks = "";
            public const string GetById = "{tankId}";
            public const string Create = "";
            public const string Update = "{tankId}";
            public const string Delete = "{tankId}";
            public const string LatestSnapshot = "{tankId}/snapshot";
            public const string Analysis = "{tankId}/analysis";
        }

        public static class TankItem
        {
            public const string Base = "api/tanks/{tankId}/items";
            public const string GetAll = "";
            public const string Add = "";
            public const string GetById = "{itemId}";
            public const string Update = "{itemId}";
            public const string Delete = "{itemId}";
        }

        public static class SpeciesImage
        {
            public const string GetAll = "{id}/images";
            public const string Add = "{id}/images";
            public const string AddBatch = "{id}/images/batch";
            public const string Delete = "{id}/images/{imageId}";
            public const string SetThumbnail = "{id}/set-thumbnail";
        }

        public static class TankImage
        {
            public const string Base = "api/tanks/{tankId}/images";
            public const string GetAll = "";
            public const string Add = "";
            public const string AddBatch = "batch";
            public const string Delete = "{imageId}";
            public const string SetThumbnail = "set-thumbnail";
        }

        public static class CompatibilityRule
        {
            public const string Base = "api/catalog/compatibility-rules";
            public const string GetById = "{id}";
            public const string GetPaginated = "paginated";
            public const string Create = "";
            public const string Update = "{id}";
            public const string Delete = "{id}";
        }

        public static class GuestTank
        {
            public const string Base = "api/guest/tanks";
            public const string Analysis = "analysis";
        }

        public static class AiModelAdmin
        {
            public const string Base = "api/admin/ai/models";
            public const string GetById = "{id}";
            public const string GetList = "";
            public const string GetPaginated = "paginated";
            public const string Create = "";
            public const string Update = "{id}";
            public const string Delete = "{id}";
        }

        public static class AiPromptAdmin
        {
            public const string Base = "api/admin/ai/prompts";
            public const string GetById = "{id}";
            public const string GetList = "";
            public const string GetPaginated = "paginated";
            public const string Create = "";
            public const string Update = "{id}";
            public const string Delete = "{id}";
        }

        public static class AiModel
        {
            public const string Base = "api/ai/models";
            public const string Available = "available";
        }
    }
}

