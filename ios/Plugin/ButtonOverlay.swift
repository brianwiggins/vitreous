import UIKit

struct ButtonOptions {
    let id: String
    let label: String?
    let systemIcon: String?
    /// Tint color for the SF Symbol icon
    let iconColor: UIColor?
    /// Frame in CSS pixels / UIKit points (1:1 in WKWebView)
    let frame: CGRect
}

// MARK: - Pass-through container view

/// A transparent full-screen view that only consumes touches landing on a subview.
/// Touches on the clear background pass through to the WKWebView beneath.
private final class PassThroughView: UIView {
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let hit = super.hitTest(point, with: event)
        return hit == self ? nil : hit
    }
}

// MARK: - Manager

final class ButtonManager: UIViewController {

    var onTapped: ((String) -> Void)?

    private var buttons: [String: ButtonView] = [:]

    override func loadView() {
        view = PassThroughView()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .clear
        view.isUserInteractionEnabled = true
    }

    func show(options: ButtonOptions) {
        if let existing = buttons[options.id] {
            existing.isHidden = false
            existing.apply(options: options)
            return
        }
        let btn = ButtonView(options: options)
        btn.onTap = { [weak self] in
            self?.onTapped?(options.id)
        }
        view.addSubview(btn)
        buttons[options.id] = btn
    }

    func update(options: ButtonOptions) {
        guard let btn = buttons[options.id] else {
            show(options: options)
            return
        }
        guard !btn.isHidden else { return }
        btn.apply(options: options)
    }

    func hide(id: String) {
        buttons[id]?.isHidden = true
    }

    func remove(id: String) {
        buttons[id]?.removeFromSuperview()
        buttons.removeValue(forKey: id)
    }
}

// MARK: - Button View

final class ButtonView: UIView {

    var onTap: (() -> Void)?

    private let effectView: UIVisualEffectView
    private let stack = UIStackView()
    private let iconView = UIImageView()
    private let titleLabel = UILabel()

    init(options: ButtonOptions) {
        if #available(iOS 26.0, *) {
            effectView = UIVisualEffectView(effect: UIGlassEffect())
        } else {
            effectView = UIVisualEffectView(effect: UIBlurEffect(style: .systemUltraThinMaterial))
        }
        super.init(frame: options.frame)
        setup()
        apply(options: options)
    }

    required init?(coder: NSCoder) { fatalError("not implemented") }

    private func setup() {
        // Glass background
        effectView.frame = bounds
        effectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        effectView.clipsToBounds = true
        effectView.layer.cornerRadius = bounds.height / 2
        addSubview(effectView)

        // Content stack
        stack.axis = .horizontal
        stack.alignment = .center
        stack.spacing = 6
        stack.translatesAutoresizingMaskIntoConstraints = false
        effectView.contentView.addSubview(stack)

        NSLayoutConstraint.activate([
            stack.centerXAnchor.constraint(equalTo: effectView.contentView.centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: effectView.contentView.centerYAnchor),
            stack.leadingAnchor.constraint(greaterThanOrEqualTo: effectView.contentView.leadingAnchor, constant: 12),
            stack.trailingAnchor.constraint(lessThanOrEqualTo: effectView.contentView.trailingAnchor, constant: -12)
        ])

        // Icon
        iconView.contentMode = .scaleAspectFit
        iconView.tintColor = .label
        iconView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            iconView.widthAnchor.constraint(equalToConstant: 20),
            iconView.heightAnchor.constraint(equalToConstant: 20)
        ])

        // Label
        titleLabel.font = .systemFont(ofSize: 15, weight: .medium)
        titleLabel.textColor = .label
        titleLabel.textAlignment = .center

        // Tap
        let tap = UITapGestureRecognizer(target: self, action: #selector(tapped))
        addGestureRecognizer(tap)
    }

    func apply(options: ButtonOptions) {
        frame = options.frame
        effectView.layer.cornerRadius = bounds.height / 2

        // Icon
        if let iconName = options.systemIcon {
            let config: UIImage.SymbolConfiguration
            if let color = options.iconColor {
                config = UIImage.SymbolConfiguration(hierarchicalColor: color)
            } else {
                config = UIImage.SymbolConfiguration(scale: .medium)
            }
            iconView.image = UIImage(systemName: iconName, withConfiguration: config)
            if iconView.superview == nil { stack.addArrangedSubview(iconView) }
        } else {
            iconView.removeFromSuperview()
        }

        // Label
        if let text = options.label, !text.isEmpty {
            titleLabel.text = text
            if titleLabel.superview == nil { stack.addArrangedSubview(titleLabel) }
        } else {
            titleLabel.removeFromSuperview()
        }
    }

    @objc private func tapped() {
        onTap?()
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        effectView.layer.cornerRadius = bounds.height / 2
    }
}
