namespace Application.Constants
{
    /// <summary>
    /// Error messages for the Project module.
    /// </summary>
    public static class ProjectErrorMessageConstant
    {
        public const string TankNotFound = "Tank with the given ID was not found.";
        public const string TankItemNotFound = "Tank item with the given ID was not found.";
        public const string UnauthorizedAccess = "You do not have permission to access this tank.";
        public const string InvalidDimensions = "Tank dimensions must be positive values.";
        public const string InvalidWaterVolume = "Water volume must be a positive value.";
        public const string TankNameRequired = "Tank name is required.";
        public const string TankNameTooLong = "Tank name cannot exceed 100 characters.";
        public const string ItemTypeRequired = "Item type is required.";
        public const string ReferenceIdRequired = "Reference ID is required.";
        public const string InvalidQuantity = "Quantity must be a positive value.";
        public const string NoteTooLong = "Note cannot exceed 255 characters.";
        public const string SpeciesNotFoundInCatalog = "The specified species does not exist in the catalog.";
        public const string ProductNotFoundInCatalog = "The specified product does not exist in the catalog.";
        public const string AllUploadsFailedMessage = "All image uploads failed. Please try again.";
        public const string SpeciesDataIncompleteForAnalysis = "Species data is incomplete for analysis.";
    }
}
