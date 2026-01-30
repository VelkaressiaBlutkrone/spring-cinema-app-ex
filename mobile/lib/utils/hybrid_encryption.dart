// Hybrid Encryption (RSA-OAEP + AES-256-GCM)
// - 클라이언트 → 서버 민감 데이터 암호화 (비밀번호, 개인정보 등)
// - 서버 공개키(/api/public-key)로 AES 키 암호화, AES-GCM으로 payload 암호화
// - Java OAEPWithSHA-1AndMGF1Padding 호환 (pointycastle OAEPEncoding.withSHA1)

import 'dart:convert';
import 'dart:typed_data';

import 'package:asn1lib/asn1lib.dart';
import 'package:encrypt/encrypt.dart' as enc;
import 'package:pointycastle/export.dart';

/// EncryptedPayload (encryptedKey, iv, encryptedData as base64)
class EncryptedPayload {
  const EncryptedPayload({
    required this.encryptedKey,
    required this.iv,
    required this.encryptedData,
  });
  final String encryptedKey;
  final String iv;
  final String encryptedData;

  Map<String, String> toJson() => {
        'encryptedKey': encryptedKey,
        'iv': iv,
        'encryptedData': encryptedData,
      };
}

/// PEM "-----BEGIN PUBLIC KEY-----" 본문만 base64 디코드하여 DER bytes 반환
List<int> _decodePemToDer(String pem) {
  const startMark = '-----BEGIN PUBLIC KEY-----';
  const endMark = '-----END PUBLIC KEY-----';
  String body = pem;
  if (body.contains(startMark)) {
    body = body.substring(body.indexOf(startMark) + startMark.length);
  }
  if (body.contains(endMark)) {
    body = body.substring(0, body.indexOf(endMark));
  }
  body = body.replaceAll(RegExp(r'[\r\n\s]'), '');
  return base64.decode(body);
}

/// SPKI DER에서 RSA 공개키(modulus, exponent) 파싱 (asn1lib)
RSAPublicKey parsePublicKeyFromPem(String publicKeyPem) {
  final der = Uint8List.fromList(_decodePemToDer(publicKeyPem));
  final parser = ASN1Parser(der);
  final topLevel = parser.nextObject();
  if (topLevel is! ASN1Sequence) {
    throw ArgumentError('Invalid SPKI: expected SEQUENCE');
  }
  final elements = topLevel.elements;
  if (elements.length < 2) {
    throw ArgumentError('Invalid SPKI: expected algorithm + subjectPublicKey');
  }
  final subjectPublicKey = elements[1];
  Uint8List keyBytes;
  if (subjectPublicKey is ASN1BitString) {
    keyBytes = subjectPublicKey.contentBytes();
    // BIT STRING value: first byte = unused bits (0), then RSA public key DER
    if (keyBytes.length > 1 && keyBytes[0] == 0) {
      keyBytes = keyBytes.sublist(1);
    }
  } else {
    throw ArgumentError('Invalid SPKI: subjectPublicKey is not BIT STRING');
  }
  final keyParser = ASN1Parser(keyBytes);
  final keySeq = keyParser.nextObject();
  final keyElements = keySeq is ASN1Sequence ? keySeq.elements : null;
  if (keySeq is! ASN1Sequence || keyElements == null || keyElements.length < 2) {
    throw ArgumentError('Invalid RSA public key SEQUENCE');
  }
  final modulus = keyElements[0] as ASN1Integer;
  final exponent = keyElements[1] as ASN1Integer;
  return RSAPublicKey(
    modulus.valueAsBigInteger,
    exponent.valueAsBigInteger,
  );
}

/// RSA-OAEP SHA-1으로 data 암호화 (Java OAEPWithSHA-1AndMGF1Padding 호환)
Uint8List rsaOaepSha1Encrypt(RSAPublicKey publicKey, Uint8List data) {
  final cipher = OAEPEncoding.withSHA1(RSAEngine());
  cipher.init(true, PublicKeyParameter<RSAPublicKey>(publicKey));
  return Uint8List.fromList(cipher.process(data));
}

/// 평문(UTF-8) JSON을 EncryptedPayload로 암호화
Future<EncryptedPayload> encryptPayload(String publicKeyPem, Map<String, dynamic> plain) async {
  final plainBytes = Uint8List.fromList(utf8.encode(jsonEncode(plain)));

  // 1) AES-256 키 · IV 생성 (32B, 12B)
  final aesKey = enc.Key.fromSecureRandom(32);
  final iv = enc.IV.fromLength(12);

  // 2) AES-GCM encrypt (encrypt 패키지: ciphertext + 128bit tag)
  final encrypter = enc.Encrypter(enc.AES(aesKey, mode: enc.AESMode.gcm));
  final encrypted = encrypter.encryptBytes(plainBytes, iv: iv);
  // encrypt 패키지 GCM: bytes에 ciphertext+tag 포함
  final encryptedData = base64Encode(encrypted.bytes);

  // 3) RSA-OAEP(SHA-1)로 AES 키 암호화
  final rsaPublicKey = parsePublicKeyFromPem(publicKeyPem);
  final encryptedKeyBytes = rsaOaepSha1Encrypt(rsaPublicKey, Uint8List.fromList(aesKey.bytes));
  final encryptedKey = base64Encode(encryptedKeyBytes);
  final ivB64 = base64Encode(iv.bytes);

  return EncryptedPayload(
    encryptedKey: encryptedKey,
    iv: ivB64,
    encryptedData: encryptedData,
  );
}
