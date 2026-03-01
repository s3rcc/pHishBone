namespace Infrastructure.Settings
{
    /// <summary>
    /// Typed configuration for Redis distributed cache.
    /// Bound from appsettings.json "RedisSettings" section.
    /// </summary>
    public class RedisSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string InstanceName { get; set; } = string.Empty;
    }
}
