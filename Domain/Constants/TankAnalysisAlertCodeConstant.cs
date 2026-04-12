namespace Domain.Constants
{
    /// <summary>
    /// Alert codes emitted by the Tank Analysis Engine.
    /// </summary>
    public static class TankAnalysisAlertCodeConstant
    {
        public const string TankTooSmall = "TankTooSmall";
        public const string Overstocked = "Overstocked";
        public const string FullyStocked = "FullyStocked";
        public const string EnvConflictPh = "EnvConflictPh";
        public const string EnvConflictTemp = "EnvConflictTemp";
        public const string SchoolingInsufficient = "SchoolingInsufficient";
        public const string TagIncompatibility = "TagIncompatibility";
    }
}
