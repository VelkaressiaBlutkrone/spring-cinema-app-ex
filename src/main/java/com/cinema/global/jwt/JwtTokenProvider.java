package com.cinema.global.jwt;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

/**
 * JWT Token 생성 및 검증 Provider
 * 
 * RULE:
 * - Access Token 유효시간 ≤ 15분
 * - JWT Token 전체 값이 로그에 기록되지 않음 (일부만 마스킹)
 */
@Component
public class JwtTokenProvider {

    private final SecretKey key;

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 토큰 생성 (Role 포함)
     * 
     * @param subject 로그인 ID
     * @param role 역할 (USER, ADMIN)
     * @param expireTime 만료 시간 (밀리초)
     * @return JWT Token
     */
    public String createToken(String subject, String role, long expireTime) {
        Date now = new Date();

        return Jwts.builder()
                .subject(subject)
                .claim("role", role)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expireTime))
                .signWith(key)
                .compact();
    }

    /**
     * 토큰 생성 (Role 없이 - 하위 호환성)
     * 
     * @param subject 로그인 ID
     * @param expireTime 만료 시간 (밀리초)
     * @return JWT Token
     */
    public String createToken(String subject, long expireTime) {
        return createToken(subject, null, expireTime);
    }

    /**
     * subject 추출
     * 
     * @param token JWT Token
     * @return 로그인 ID
     */
    public String getSubject(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Role 추출
     * 
     * @param token JWT Token
     * @return Role (없으면 null)
     */
    public String getRole(String token) {
        Claims claims = getClaims(token);
        return claims.get("role", String.class);
    }

    /**
     * 토큰 검증
     * 
     * @param token JWT Token
     * @return 유효 여부
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * 토큰 마스킹 (로그용)
     * JWT Token 전체 값이 로그에 기록되지 않도록 일부만 표시
     * 
     * @param token JWT Token
     * @return 마스킹된 토큰 (예: "eyJhbGc...xxxxx")
     */
    public String maskToken(String token) {
        if (token == null || token.length() < 10) {
            return "***";
        }
        return token.substring(0, 10) + "...";
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
