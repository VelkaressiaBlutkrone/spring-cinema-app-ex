import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';

/// 모바일 앱 로그를 파일에 저장 (최대 7일 보관)
/// RULE: Web 플랫폼에서는 파일 저장 불가 → 무시
class FileLogService {
  FileLogService._();

  static final FileLogService _instance = FileLogService._();
  static FileLogService get instance => _instance;

  static const int _maxHistoryDays = 7;
  static const String _logPrefix = 'cinema-mobile';
  bool _initialized = false;
  String? _logDir;

  Future<void> _ensureInit() async {
    if (_initialized) return;
    if (kIsWeb) {
      _initialized = true;
      return;
    }
    try {
      final dir = await getApplicationDocumentsDirectory();
      _logDir = '${dir.path}/logs';
      final logDir = Directory(_logDir!);
      if (!await logDir.exists()) {
        await logDir.create(recursive: true);
      }
      await _deleteOldLogs();
      _initialized = true;
    } catch (_) {
      _initialized = true;
    }
  }

  Future<void> _deleteOldLogs() async {
    if (_logDir == null) return;
    try {
      final dir = Directory(_logDir!);
      if (!await dir.exists()) return;
      final now = DateTime.now();
      await for (final entity in dir.list()) {
        if (entity is File) {
          final name = entity.path.split(Platform.pathSeparator).last;
          if (!name.startsWith(_logPrefix) || !name.endsWith('.log')) continue;
          try {
            final stat = await entity.stat();
            if (now.difference(stat.modified).inDays > _maxHistoryDays) {
              await entity.delete();
            }
          } catch (_) {}
        }
      }
    } catch (_) {}
  }

  /// 로그 기록 (비동기, 실패해도 무시)
  Future<void> log(String category, String message, [Map<String, dynamic>? data]) async {
    if (kIsWeb) return;
    await _ensureInit();
    if (_logDir == null) return;
    try {
      final ts = DateTime.now().toIso8601String();
      final dataStr = data != null && data.isNotEmpty ? ' ${data.toString()}' : '';
      final line = '$ts [$category] $message$dataStr\n';
      final now = DateTime.now();
      final dateStr =
          '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
      final file = File('$_logDir/$_logPrefix-$dateStr.log');
      await file.writeAsString(line, mode: FileMode.append);
    } catch (_) {}
  }
}
