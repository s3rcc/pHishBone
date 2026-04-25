using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Constants
{
    public class ValidationMessageConstant
    {
        #region Username
        public const string UsernameRequired = "Username is required";
        public const string UsernameLength = "Username must be between 3 and 50 characters";
        #endregion Username

        #region Email
        public const string EmailRequired = "Email is required";
        public const string EmailInvalidFormat = "Invalid email format";
        #endregion Email

        #region Password
        public const string PasswordRequired = "Password is required";
        public const string PasswordMinLength = "Password must be at least 6 characters";
        public const string CurrentPasswordRequired = "Current password is required";
        public const string NewPasswordRequired = "New password is required";
        #endregion Password

        #region Authorization
        public const string RoleInvalid = "Role is invalid";
        #endregion Authorization

        #region Verification
        public const string VerificationTokenRequired = "Verification token is required";
        public const string ResetCodeRequired = "Reset code is required";
        #endregion Verification
    }
}
