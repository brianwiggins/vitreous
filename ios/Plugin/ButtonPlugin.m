#import <Capacitor/Capacitor.h>

CAP_PLUGIN(ButtonPlugin, "Button",
  CAP_PLUGIN_METHOD(show,   CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(update, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(hide,   CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(remove, CAPPluginReturnPromise);
)
