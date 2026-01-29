namespace Application.Constants
{
    public static class ApiEndpointConstant
    {
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
    }
}
