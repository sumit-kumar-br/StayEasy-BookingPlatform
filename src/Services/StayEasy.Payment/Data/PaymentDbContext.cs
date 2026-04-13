using Microsoft.EntityFrameworkCore;
using StayEasy.Payment.Models;

namespace StayEasy.Payment.Data
{
    /// <summary>
    /// Defines persistence configuration for PaymentDbContext.
    /// </summary>
    public class PaymentDbContext : DbContext
    {
        public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options)
        {
        }

        public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            var txn = modelBuilder.Entity<PaymentTransaction>();

            txn.HasKey(x => x.Id);
            txn.Property(x => x.Email).HasMaxLength(256).IsRequired();
            txn.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            txn.Property(x => x.Provider).HasMaxLength(50).IsRequired();
            txn.Property(x => x.ProviderOrderId).HasMaxLength(100).IsRequired();
            txn.Property(x => x.ProviderPaymentId).HasMaxLength(100);
            txn.Property(x => x.RazorpaySignature).HasMaxLength(500);
            txn.Property(x => x.FailureReason).HasMaxLength(1000);

            txn.HasIndex(x => x.BookingId);
            txn.HasIndex(x => x.ProviderOrderId).IsUnique();
            txn.HasIndex(x => x.ProviderPaymentId).IsUnique();

            base.OnModelCreating(modelBuilder);
        }
    }
}
