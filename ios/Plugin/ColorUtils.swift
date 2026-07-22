import UIKit

/// Shared color parsing utilities for Vitreous plugins
class ColorUtils {

    /// Parses a hex color string to UIColor
    static func parseHexColor(_ hex: String) -> UIColor? {
        var hexString = hex.trimmingCharacters(in: .whitespacesAndNewlines)

        if hexString.hasPrefix("#") {
            hexString.removeFirst()
        }

        guard hexString.count == 3 || hexString.count == 6 || hexString.count == 8 else {
            return nil
        }

        if hexString.count == 3 {
            hexString = hexString.map { "\($0)\($0)" }.joined()
        }

        var alpha: CGFloat = 1.0
        if hexString.count == 8 {
            let alphaHex = String(hexString.suffix(2))
            hexString = String(hexString.prefix(6))
            if let alphaInt = Int(alphaHex, radix: 16) {
                alpha = CGFloat(alphaInt) / 255.0
            }
        }

        guard let colorInt = Int(hexString, radix: 16) else { return nil }

        let red   = CGFloat((colorInt >> 16) & 0xFF) / 255.0
        let green = CGFloat((colorInt >> 8)  & 0xFF) / 255.0
        let blue  = CGFloat( colorInt        & 0xFF) / 255.0

        return UIColor(red: red, green: green, blue: blue, alpha: alpha)
    }

    /// Parses an RGBA/RGB color string to UIColor
    static func parseRgbaColor(_ rgba: String) -> UIColor? {
        let pattern = #"rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*([01](?:\.\d+)?))?\s*\)"#

        guard let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) else { return nil }

        let range = NSRange(location: 0, length: rgba.utf16.count)
        guard let match = regex.firstMatch(in: rgba, options: [], range: range) else { return nil }

        func extractValue(at index: Int) -> Double? {
            let r = match.range(at: index)
            guard r.location != NSNotFound else { return nil }
            return Double((rgba as NSString).substring(with: r))
        }

        guard let red   = extractValue(at: 1),
              let green = extractValue(at: 2),
              let blue  = extractValue(at: 3) else { return nil }

        let alpha = extractValue(at: 4) ?? 1.0

        guard (0...255).contains(red), (0...255).contains(green),
              (0...255).contains(blue), (0.0...1.0).contains(alpha) else { return nil }

        return UIColor(
            red:   CGFloat(red)   / 255.0,
            green: CGFloat(green) / 255.0,
            blue:  CGFloat(blue)  / 255.0,
            alpha: CGFloat(alpha)
        )
    }

    /// Parses a color string in hex or RGBA format to UIColor
    static func parseColor(_ colorString: String?) -> UIColor? {
        guard let s = colorString?.trimmingCharacters(in: .whitespacesAndNewlines), !s.isEmpty else { return nil }

        if s.hasPrefix("#") { return parseHexColor(s) }
        if s.lowercased().hasPrefix("rgb") { return parseRgbaColor(s) }
        return nil
    }
}
