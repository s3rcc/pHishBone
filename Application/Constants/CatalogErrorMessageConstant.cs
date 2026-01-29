namespace Application.Constants
{
    public static class CatalogErrorMessageConstant
    {
        // Tag errors
        public const string TagCodeAlreadyExists = "TAG_CODE_EXISTS";
        public const string TagNameAlreadyExists = "TAG_NAME_EXISTS";
        public const string TagNotFound = "TAG_NOT_FOUND";
        public const string TagCodeRequired = "Tag code is required";
        public const string TagNameRequired = "Tag name is required";
        public const string TagCodeDuplicate = "A tag with this code already exists";
        public const string TagNameDuplicate = "A tag with this name already exists";
        public const string TagNotFoundMessage = "Tag not found";

        // Type errors
        public const string TypeNameAlreadyExists = "TYPE_NAME_EXISTS";
        public const string TypeNotFound = "TYPE_NOT_FOUND";
        public const string TypeNameRequired = "Type name is required";
        public const string TypeNameDuplicate = "A type with this name already exists";
        public const string TypeNotFoundMessage = "Type not found";
    }
}
