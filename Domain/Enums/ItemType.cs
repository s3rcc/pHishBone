namespace Domain.Enums
{
    /// <summary>
    /// Differentiates between species and products in tank items.
    /// </summary>
    public enum ItemType
    {
        Species = 1, // Fish, Plants, Snails (Links to catalog.Species)
        Product = 2  // Filters, Lights, Substrate (Links to catalog.Products)
    }
}
