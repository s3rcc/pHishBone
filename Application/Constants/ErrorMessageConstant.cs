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
        public const string LogoutFailed = "Failed to logout.";
        #endregion Auth
    }

}
