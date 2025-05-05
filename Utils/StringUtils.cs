using System.Text;
using System.Text.RegularExpressions;

namespace IT_Tools.Utils;

public static class StringUtils
{
    public static string Slugify(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        string normalized = text.ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder(normalized.Length);
        foreach (char c in normalized)
        {
            if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }
        string decomposed = stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        string slug = Regex.Replace(decomposed, @"\s+", "-", RegexOptions.Compiled);
        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "", RegexOptions.Compiled);
        slug = Regex.Replace(slug, @"-{2,}", "-", RegexOptions.Compiled);
        slug = slug.Trim('-');
        return slug;
    }
}