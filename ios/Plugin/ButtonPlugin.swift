import Capacitor

@objc(ButtonPlugin)
public class ButtonPlugin: CAPPlugin {

    private var manager: ButtonManager?

    private func ensureManager() {
        guard manager == nil else { return }
        guard let hostVC = bridge?.viewController else { return }

        let mgr = ButtonManager()
        mgr.onTapped = { [weak self] id in
            self?.notifyListeners("tapped", data: ["id": id])
        }

        hostVC.addChild(mgr)
        hostVC.view.addSubview(mgr.view)
        mgr.view.translatesAutoresizingMaskIntoConstraints = false
        mgr.didMove(toParent: hostVC)

        NSLayoutConstraint.activate([
            mgr.view.leadingAnchor.constraint(equalTo: hostVC.view.leadingAnchor),
            mgr.view.trailingAnchor.constraint(equalTo: hostVC.view.trailingAnchor),
            mgr.view.topAnchor.constraint(equalTo: hostVC.view.topAnchor),
            mgr.view.bottomAnchor.constraint(equalTo: hostVC.view.bottomAnchor)
        ])

        manager = mgr
    }

    @objc func show(_ call: CAPPluginCall) {
        guard let options = Self.parseOptions(call) else {
            call.reject("Missing required fields: id and frame")
            return
        }
        DispatchQueue.main.async {
            self.ensureManager()
            self.manager?.show(options: options)
        }
        call.resolve()
    }

    @objc func update(_ call: CAPPluginCall) {
        guard let options = Self.parseOptions(call) else {
            call.reject("Missing required fields: id and frame")
            return
        }
        DispatchQueue.main.async {
            self.ensureManager()
            self.manager?.update(options: options)
        }
        call.resolve()
    }

    @objc func hide(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else {
            call.reject("Missing 'id'")
            return
        }
        DispatchQueue.main.async {
            self.manager?.hide(id: id)
        }
        call.resolve()
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else {
            call.reject("Missing 'id'")
            return
        }
        DispatchQueue.main.async {
            self.manager?.remove(id: id)
        }
        call.resolve()
    }

    private static func parseOptions(_ call: CAPPluginCall) -> ButtonOptions? {
        guard
            let id = call.getString("id"),
            let frameObj = call.getObject("frame"),
            let x = frameObj["x"] as? Double,
            let y = frameObj["y"] as? Double,
            let w = frameObj["width"] as? Double,
            let h = frameObj["height"] as? Double
        else { return nil }

        return ButtonOptions(
            id: id,
            label: call.getString("label"),
            systemIcon: call.getString("systemIcon"),
            iconColor: ColorUtils.parseColor(call.getString("iconColor")),
            frame: CGRect(x: x, y: y, width: w, height: h)
        )
    }
}
