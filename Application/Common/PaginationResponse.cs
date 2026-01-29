namespace Application.Common
{
    /// <summary>
    /// Pagination response wrapper
    /// </summary>
    /// <typeparam name="T">Type of items in the page</typeparam>
    public class PaginationResponse<T>
    {
        public int Size { get; set; }
        public int Page { get; set; }
        public int Total { get; set; }
        public int TotalPages { get; set; }
        public IList<T> Items { get; set; } = new List<T>();
    }
}
