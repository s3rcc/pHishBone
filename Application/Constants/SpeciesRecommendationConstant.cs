namespace Application.Constants
{
    /// <summary>
    /// Constants for related-species recommendation behavior and response labels.
    /// </summary>
    public static class SpeciesRecommendationConstant
    {
        public const int DefaultSize = 8;
        public const int MaxSize = 12;
        public const int PoolSize = 72;

        public const string SameTypeReason = "same type";
        public const string SharedTagsReason = "shared tags";
        public const string SameWaterTypeReason = "same water type";
        public const string SimilarPhRangeReason = "similar pH range";
        public const string SimilarTemperatureRangeReason = "similar temperature range";
        public const string SameSwimLevelReason = "same swim level";
        public const string SameDietReason = "same diet";
        public const string SimilarAdultSizeReason = "similar adult size";
        public const string SchoolingBehaviorReason = "schooling behavior";
        public const string FallbackReason = "alternative species to explore";
    }
}
