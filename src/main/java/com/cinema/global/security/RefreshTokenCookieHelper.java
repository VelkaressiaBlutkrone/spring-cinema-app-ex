package com.cinema.global.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Refresh Token HttpOnly Cookie 설정/삭제 (OWASP)
 *
 * - HttpOnly, Secure(HTTPS), SameSite=Strict
 * - Path=/api/members
 */
@Component
public class RefreshTokenCookieHelper {

    private static final String PATH = "/api/members";
    private static final String SAME_SITE = "Strict";

    @Value("${auth.refresh-token.cookie-name:cinema_refresh}")
    private String cookieName;

    @Value("${auth.refresh-token.secure-cookie:false}")
    private boolean secure;

    @Value("${auth.refresh-token.max-age-seconds:604800}")
    private int maxAgeSeconds;

    public void setRefreshTokenCookie(String refreshToken, HttpServletResponse response) {
        Cookie c = new Cookie(cookieName, refreshToken);
        c.setHttpOnly(true);
        c.setSecure(secure);
        c.setPath(PATH);
        c.setMaxAge(maxAgeSeconds);
        if (response.isCommitted()) {
            return;
        }
        response.addCookie(c);
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie c = new Cookie(cookieName, "");
        c.setHttpOnly(true);
        c.setSecure(secure);
        c.setPath(PATH);
        c.setMaxAge(0);
        if (!response.isCommitted()) {
            response.addCookie(c);
        }
    }

    public String getRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if (cookieName.equals(c.getName()) && c.getValue() != null && !c.getValue().isBlank()) {
                return c.getValue();
            }
        }
        return null;
    }
}
