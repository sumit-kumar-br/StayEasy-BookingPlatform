namespace StayEasy.Shared.Exceptions
{
    /// <summary>
    /// Represents a not-found error for domain resources.
    /// </summary>
    public class NotFoundException: Exception
    {
        /// <summary>
        /// Creates a not-found exception with a custom message.
        /// </summary>
        public NotFoundException(string message): base(message) { }

        /// <summary>
        /// Creates a not-found exception using an entity name and identifier.
        /// </summary>
        public NotFoundException(string name, object key): base($"{name} with id '{key}' was not found.") { }
    }
}
