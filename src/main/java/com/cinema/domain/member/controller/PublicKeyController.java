package com.cinema.domain.member.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.member.dto.PublicKeyResponse;
import com.cinema.global.dto.ApiResponse;
import com.cinema.global.security.RsaKeyManager;

import lombok.RequiredArgsConstructor;

/**
 * RSA 공개키 노출 (Hybrid Encryption 클라이언트용)
 *
 * RULE:
 * - 인증 통신은 HTTPS 가정
 * - 클라이언트는 공개키로 AES 키 암호화 후 AES-GCM으로 민감 데이터 암호화
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicKeyController {

    private final RsaKeyManager rsaKeyManager;

    @GetMapping("/public-key")
    public ResponseEntity<ApiResponse<PublicKeyResponse>> getPublicKey() {
        PublicKeyResponse body = new PublicKeyResponse(rsaKeyManager.getPublicKeyPem());
        return ResponseEntity.ok(ApiResponse.success(body));
    }
}
