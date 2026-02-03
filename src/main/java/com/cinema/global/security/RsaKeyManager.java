package com.cinema.global.security;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;

import org.springframework.stereotype.Component;

import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

/**
 * RSA 키 쌍 관리 (Hybrid Encryption용)
 *
 * RULE:
 * - 인증 관련 민감 데이터는 RSA + AES-GCM 하이브리드 암호화 가정
 * - 공개키는 /api/public-key 로 노출, 개인키는 서버에만 보관
 */
@Slf4j
@Component
public class RsaKeyManager {

    private static final String ALGORITHM = "RSA";
    private static final int KEY_SIZE = 2048;

    private RSAPublicKey publicKey;
    private RSAPrivateKey privateKey;

    @PostConstruct
    public void init() {
        try {
            KeyPairGenerator gen = KeyPairGenerator.getInstance(ALGORITHM);
            gen.initialize(KEY_SIZE);
            KeyPair pair = gen.generateKeyPair();
            this.publicKey = (RSAPublicKey) pair.getPublic();
            this.privateKey = (RSAPrivateKey) pair.getPrivate();
            log.info("RSA key pair generated ({} bits) for hybrid encryption", KEY_SIZE);
        } catch (NoSuchAlgorithmException e) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }

    public PublicKey getPublicKey() {
        return publicKey;
    }

    public PrivateKey getPrivateKey() {
        return privateKey;
    }

    /**
     * 공개키를 PEM 형식으로 반환 (클라이언트에서 importKey용)
     */
    public String getPublicKeyPem() {
        byte[] encoded = publicKey.getEncoded();
        String b64 = Base64.getMimeEncoder(64, "\n".getBytes(StandardCharsets.UTF_8)).encodeToString(encoded);
        return "-----BEGIN PUBLIC KEY-----\n" + b64 + "\n-----END PUBLIC KEY-----";
    }
}
