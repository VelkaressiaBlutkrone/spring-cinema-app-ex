import 'dart:convert';

/// JWT payload에서 sub(loginId) 추출
/// Access Token이 저장된 후 호출 가능
String? getLoginIdFromToken(String? token) {
  if (token == null || token.isEmpty) return null;
  final parts = token.split('.');
  if (parts.length != 3) return null;
  try {
    String payload = parts[1];
    payload = payload.replaceAll('-', '+').replaceAll('_', '/');
    switch (payload.length % 4) {
      case 2:
        payload += '==';
        break;
      case 3:
        payload += '=';
        break;
    }
    final decoded = utf8.decode(base64.decode(payload));
    final json = jsonDecode(decoded) as Map<String, dynamic>;
    return json['sub'] as String?;
  } catch (_) {
    return null;
  }
}
