import UIKit
import Capacitor
import AVFoundation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        configureAudioSession()
        return true
    }

    private func configureAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .spokenAudio, options: [.duckOthers, .allowAirPlay])
            try session.setActive(true, options: [])
        } catch {
            NSLog("Noor Al-Islam audio session could not be activated: %@", error.localizedDescription)
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Keep the playback session active when the screen locks or the app moves to background.
        configureAudioSession()
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Playback is controlled by the web audio element; do not stop it here.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        configureAudioSession()
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        configureAudioSession()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Save state only; do not stop active playback here.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
