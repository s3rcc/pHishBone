namespace Application.Common
{
    /// <summary>
    /// Base class for paginated requests
    /// </summary>
    public class PaginationRequest
    {
        public int Page { get; set; } = 1;
        public int Size { get; set; } = 10;
        public string? SortBy { get; set; }
        public bool IsAscending { get; set; } = true;
    }
}
