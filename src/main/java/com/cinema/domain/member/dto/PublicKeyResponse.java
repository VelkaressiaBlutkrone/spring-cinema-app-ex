package com.cinema.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * RSA 공개키 응답 (/api/public-key)
 */
@Getter
@AllArgsConstructor
public class PublicKeyResponse {

    private String publicKeyPem;
}
