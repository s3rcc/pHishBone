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

        // Species errors
        public const string SpeciesNotFound = "Species not found";
        public const string SpeciesScientificNameDuplicate = "A species with this scientific name already exists";
        public const string SpeciesInvalidEnvironment = "PhMin must be less than PhMax, and TempMin must be less than TempMax";
        public const string SpeciesInvalidAdultSize = "AdultSize must be greater than 0";
        public const string SpeciesTypeNotFound = "The specified Type does not exist";
        public const string SpeciesTagNotFound = "One or more specified Tags do not exist";
        public const string SpeciesCommonNameRequired = "Common name is required";
        public const string SpeciesScientificNameRequired = "Scientific name is required";
        public const string SpeciesTypeIdRequired = "Type ID is required";
    }
}
