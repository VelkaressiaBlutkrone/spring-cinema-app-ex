package com.cinema.global.jwt;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.cinema.domain.member.entity.Member;
import com.cinema.domain.member.repository.MemberRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT 인증 필터
 * 
 * RULE:
 * - Access Token 유효시간 ≤ 15분
 * - JWT Token 전체 값이 로그에 기록되지 않음
 * - 인증 실패 시 적절한 예외 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String token = extractToken(request);

            if (token != null && jwtTokenProvider.validateToken(token)) {
                String loginId = jwtTokenProvider.getSubject(token);
                String role = jwtTokenProvider.getRole(token);

                // Member 조회 및 활성 상태 확인
                Member member = memberRepository.findByLoginId(loginId)
                        .orElse(null);

                if (member != null && member.isActive()) {
                    // 권한 설정
                    Collection<GrantedAuthority> authorities = new ArrayList<>();
                    if (role != null) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                    } else if (member.getRole() != null) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + member.getRole().name()));
                    }

                    // Authentication 객체 생성
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            loginId, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // SecurityContext에 설정
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    log.debug("JWT 인증 성공: loginId={}, role={}", loginId, role);
                } else {
                    log.warn("JWT 인증 실패: 회원을 찾을 수 없거나 비활성 상태 - loginId={}", loginId);
                }
            }
        } catch (Exception e) {
            log.error("JWT 인증 필터 오류: {}", e.getMessage());
            // 인증 실패 시 SecurityContext를 비우고 계속 진행 (인증이 필요한 경우 Security가 처리)
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Request에서 JWT Token 추출
     * 
     * @param request HttpServletRequest
     * @return JWT Token (없으면 null)
     */
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            String token = bearerToken.substring(BEARER_PREFIX.length());
            log.debug("JWT Token 추출: {}", jwtTokenProvider.maskToken(token));
            return token;
        }
        return null;
    }
}
