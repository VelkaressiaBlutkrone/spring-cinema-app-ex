package com.cinema.global.security;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.PrivateKey;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Hybrid 복호화 (RSA 개인키로 AES 키 복호화 → AES-GCM으로 payload 복호화)
 *
 * RULE:
 * - 클라이언트가 RSA 공개키로 AES 키 암호화, AES-GCM으로 민감 데이터 암호화
 * - encryptedKey: RSA-OAEP 암호화된 AES-256 키 (Base64)
 * - iv: AES-GCM IV 12 bytes (Base64)
 * - encryptedData: AES-GCM ciphertext||tag (Base64)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HybridDecryptionService {

    /** Web Crypto RSA-OAEP 기본(SHA-1)과 호환 */
    private static final String RSA_TRANSFORM = "RSA/ECB/OAEPWithSHA-1AndMGF1Padding";
    private static final String AES_TRANSFORM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH_BITS = 128;

    private final RsaKeyManager rsaKeyManager;

    /**
     * encryptedKey, iv, encryptedData(Base64) → 복호화된 UTF-8 문자열 (JSON 등)
     */
    public String decrypt(String encryptedKeyB64, String ivB64, String encryptedDataB64) {
        try {
            byte[] encryptedKey = Base64.getDecoder().decode(encryptedKeyB64);
            byte[] iv = Base64.getDecoder().decode(ivB64);
            byte[] encryptedData = Base64.getDecoder().decode(encryptedDataB64);

            PrivateKey rsaPrivate = rsaKeyManager.getPrivateKey();
            Cipher rsa = Cipher.getInstance(RSA_TRANSFORM);
            rsa.init(Cipher.DECRYPT_MODE, rsaPrivate);
            byte[] aesKeyBytes = rsa.doFinal(encryptedKey);
            Key aesKey = new SecretKeySpec(aesKeyBytes, "AES");

            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            Cipher aes = Cipher.getInstance(AES_TRANSFORM);
            aes.init(Cipher.DECRYPT_MODE, aesKey, gcmSpec);
            byte[] plain = aes.doFinal(encryptedData);
            return new String(plain, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.warn("Hybrid decryption failed: {}", e.getMessage());
            throw new BusinessException(ErrorCode.INVALID_INPUT, "잘못된 요청입니다."); // 상세 노출 금지 (OWASP)
        }
    }
}
