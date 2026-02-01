namespace Domain.Enums
{
    /// <summary>
    /// Defines the lifecycle state of a tank project.
    /// </summary>
    public enum TankStatus
    {
        Draft = 0,    // Design phase
        Active = 1,   // Real tank currently running
        Archived = 2  // Old/Deleted tank
    }
}
