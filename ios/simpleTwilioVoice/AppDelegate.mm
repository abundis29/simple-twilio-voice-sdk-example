#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <RNCallKeep/RNCallKeep.h>
#import <React/RCTRootView.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Your existing code
  self.moduleName = @"simpleTwilioVoice";
  self.initialProps = @{};
  
  // New RNCallKeep setup
  self.bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

  [RNCallKeep setup:@{
    @"appName": @"Awesome App",
    @"maximumCallGroups": @3,
    @"maximumCallsPerCallGroup": @1,
    @"supportsVideo": @NO,
  }];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:self.bridge
                                                   moduleName:@"App"
                                            initialProperties:nil];

  // Other code...

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
