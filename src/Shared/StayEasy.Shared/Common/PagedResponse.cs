namespace StayEasy.Shared.Common
{
    /// <summary>
    /// Represents paginated data returned from list endpoints.
    /// </summary>
    public class PagedResponse<T>
    {
        public List<T> Data { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }

        /// <summary>
        /// Gets the total number of available pages.
        /// </summary>
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

        /// <summary>
        /// Gets a value indicating whether a previous page exists.
        /// </summary>
        public bool HasPrevious => PageNumber > 1;

        /// <summary>
        /// Gets a value indicating whether a next page exists.
        /// </summary>
        public bool HasNext => PageNumber < TotalPages;
    }
}
