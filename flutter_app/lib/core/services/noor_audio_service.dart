import 'package:just_audio/just_audio.dart';

class NoorAudioService {
  NoorAudioService() : _player = AudioPlayer();
  final AudioPlayer _player;

  Stream<PlayerState> get playerStateStream => _player.playerStateStream;
  Stream<Duration> get positionStream => _player.positionStream;
  Duration? get duration => _player.duration;

  Future<void> playAsset(String assetPath) async {
    await _player.setAsset(assetPath);
    await _player.play();
  }

  Future<void> playUrl(String url) async {
    await _player.setUrl(url);
    await _player.play();
  }

  Future<void> pause() => _player.pause();
  Future<void> stop() => _player.stop();
  Future<void> dispose() => _player.dispose();
}
