using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Constants
{
    public static class ErrorMessageConstant
    {
        #region Auth
        public const string InvalidCredentials = "Invalid email or password.";
        public const string UserNotFound = "User not found.";
        public const string PasswordResetFailed = "Failed to reset password. Please try again.";
        public const string InvalidResetToken = "Invalid or expired reset token.";
        public const string PasswordChangeFailed = "Failed to change password.";
        public const string EmailVerificationFailed = "Email verification failed.";
        public const string InvalidVerificationToken = "Invalid or expired verification token.";
        public const string InvalidRefreshToken = "Invalid or expired refresh token.";
        public const string MissingRefreshSession = "Refresh session is unavailable. Please login again.";
        public const string LogoutFailed = "Failed to logout.";
        public const string TokenRevoked = "Token has been revoked. Please login again.";
        public const string DuplicateUserName = "Username already exists.";
        public const string DuplicateEmail = "Email already exists.";
        public const string AvatarUploadFailed = "Failed to upload avatar. Please try again.";
        public const string EmailChangeFailed = "Failed to change email. Please try again.";
        public const string UsernameTaken = "Username is already taken.";
        #endregion Auth
    }

}
