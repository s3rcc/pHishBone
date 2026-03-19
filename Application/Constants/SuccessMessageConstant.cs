namespace Application.Constants
{
    /// <summary>
    /// Constants for success messages across the application
    /// </summary>
    public static class SuccessMessageConstant
    {
        #region Auth
        public const string UserRegisteredSuccessfully = "User registered successfully";
        public const string LoginSuccessful = "Login successful";
        public const string TokenRefreshedSuccessfully = "Token refreshed successfully";
        public const string UserRetrievedSuccessfully = "User retrieved successfully";
        public const string LogoutSuccessful = "Logged out successfully";
        public const string PasswordResetEmailSent = "Password reset email has been sent";
        public const string PasswordChangedSuccessfully = "Password changed successfully";
        public const string EmailVerifiedSuccessfully = "Email verified successfully";
        public const string EmailVerificationSent = "Verification email has been sent";
        public const string ProfileUpdatedSuccessfully = "Profile updated successfully";
        public const string AvatarUploadedSuccessfully = "Avatar uploaded successfully";
        public const string EmailChangeRequested = "Please check your inbox to confirm the email change.";
        #endregion Auth

        #region Catalog - Tag
        public const string TagRetrievedSuccessfully = "Tag retrieved successfully";
        public const string TagsRetrievedSuccessfully = "Tags retrieved successfully";
        public const string TagCreatedSuccessfully = "Tag created successfully";
        public const string TagsCreatedSuccessfully = "Tags created successfully";
        public const string TagUpdatedSuccessfully = "Tag updated successfully";
        public const string TagDeletedSuccessfully = "Tag deleted successfully";
        #endregion Catalog - Tag

        #region Catalog - Type
        public const string TypeRetrievedSuccessfully = "Type retrieved successfully";
        public const string TypesRetrievedSuccessfully = "Types retrieved successfully";
        public const string TypeCreatedSuccessfully = "Type created successfully";
        public const string TypesCreatedSuccessfully = "Types created successfully";
        public const string TypeUpdatedSuccessfully = "Type updated successfully";
        public const string TypeDeletedSuccessfully = "Type deleted successfully";
        #endregion Catalog - Type

        #region Catalog - Species
        public const string SpeciesRetrievedSuccessfully = "Species retrieved successfully";
        public const string SpeciesDetailsRetrievedSuccessfully = "Species details retrieved successfully";
        public const string SpeciesListRetrievedSuccessfully = "Species list retrieved successfully";
        public const string SpeciesCreatedSuccessfully = "Species created successfully";
        public const string SpeciesUpdatedSuccessfully = "Species updated successfully";
        public const string SpeciesDeletedSuccessfully = "Species deleted successfully";
        public const string SpeciesSearchRetrievedSuccessfully = "Species search results retrieved successfully";
        #endregion Catalog - Species

        #region Project - Tank
        public const string TankRetrievedSuccessfully = "Tank retrieved successfully";
        public const string TanksRetrievedSuccessfully = "Tanks retrieved successfully";
        public const string TankCreatedSuccessfully = "Tank created successfully";
        public const string TankUpdatedSuccessfully = "Tank updated successfully";
        public const string TankDeletedSuccessfully = "Tank deleted successfully";
        public const string TankItemAddedSuccessfully = "Item added to tank successfully";
        public const string TankItemUpdatedSuccessfully = "Tank item updated successfully";
        public const string TankItemRemovedSuccessfully = "Item removed from tank successfully";
        public const string TankAnalysisRetrievedSuccessfully = "Tank analysis retrieved successfully";
        #endregion Project - Tank

        #region Images
        public const string ImageAddedSuccessfully = "Image added successfully";
        public const string ImageRemovedSuccessfully = "Image removed successfully";
        public const string ImagesRetrievedSuccessfully = "Images retrieved successfully";
        public const string ThumbnailSetSuccessfully = "Thumbnail set successfully";
        #endregion Images

        #region Catalog - CompatibilityRule
        public const string RuleRetrievedSuccessfully = "Compatibility rule retrieved successfully";
        public const string RulesRetrievedSuccessfully = "Compatibility rules retrieved successfully";
        public const string RuleCreatedSuccessfully = "Compatibility rule created successfully";
        public const string RuleUpdatedSuccessfully = "Compatibility rule updated successfully";
        public const string RuleDeletedSuccessfully = "Compatibility rule deleted successfully";
        #endregion Catalog - CompatibilityRule

        #region Guest
        public const string GuestTankAnalysisRetrievedSuccessfully = "Guest tank analysis retrieved successfully";
        #endregion Guest
    }
}

