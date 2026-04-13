namespace StayEasy.Shared.Exceptions
{
    /// <summary>
    /// Represents an authorization failure for forbidden operations.
    /// </summary>
    public  class UnauthorizedException: Exception
    {
        /// <summary>
        /// Creates an unauthorized exception with the default message.
        /// </summary>
        public UnauthorizedException(string message = "You are not authorized to perform this action."): base(message) { }
    }
}
