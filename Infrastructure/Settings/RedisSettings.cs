namespace Infrastructure.Settings
{
    /// <summary>
    /// Typed configuration for Redis distributed cache.
    /// Bound from appsettings.json "RedisSettings" section.
    /// </summary>
    public class RedisSettings
    {
        public bool Enabled { get; set; } = true;
        public string ConnectionString { get; set; } = string.Empty;
        public string InstanceName { get; set; } = string.Empty;
        public int ConnectTimeoutMs { get; set; } = 500;
        public int OperationTimeoutMs { get; set; } = 500;
    }
}
