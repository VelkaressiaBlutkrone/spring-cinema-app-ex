package com.cinema.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Hybrid 암호화 페이로드 (클라이언트 → 서버)
 *
 * - encryptedKey: RSA-OAEP로 암호화된 AES-256 키 (Base64)
 * - iv: AES-GCM IV 12 bytes (Base64)
 * - encryptedData: AES-GCM ciphertext||tag (Base64)
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EncryptedPayload {

    private String encryptedKey;
    private String iv;
    private String encryptedData;
}
