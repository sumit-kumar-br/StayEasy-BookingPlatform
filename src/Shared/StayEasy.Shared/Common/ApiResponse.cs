namespace StayEasy.Shared.Common
{
    /// <summary>
    /// Standardizes success and failure responses across the platform.
    /// </summary>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();

        /// <summary>
        /// Creates a successful response with payload data.
        /// </summary>
        public static ApiResponse<T> Ok(T data, string message = "Success") => new() { Success = true, Message = message, Data = data };

        /// <summary>
        /// Creates a failed response with a single error.
        /// </summary>
        public static ApiResponse<T> Fail(string error) => new() { Success = false, Errors = new List<string> { error } };

        /// <summary>
        /// Creates a failed response with a list of errors.
        /// </summary>
        public static ApiResponse<T> Fail(List<string> errors) => new() { Success = false, Errors = errors };
    }
}
