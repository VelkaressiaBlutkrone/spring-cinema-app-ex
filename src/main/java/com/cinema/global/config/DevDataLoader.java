package com.cinema.global.config;

import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 개발 환경 전용: 테스트 계정 비밀번호를 앱의 PasswordEncoder로 동일하게 설정.
 *
 * <p>test_data.sql의 BCrypt 해시와 앱 기동 시점의 PasswordEncoder 검증이 일치하지 않는 경우를
 * 방지하기 위해, 기동 후 admin·user1·user2·user3의 비밀번호를 "password123"으로 덮어씁니다.
 * </p>
 */
@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevDataLoader implements ApplicationRunner {

    private static final String DEV_PASSWORD = "password123";
    private static final List<String> DEV_LOGIN_IDS = List.of("admin", "user1", "user2", "user3");

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String encoded = passwordEncoder.encode(DEV_PASSWORD);
        for (String loginId : DEV_LOGIN_IDS) {
            memberRepository.findByLoginId(loginId).ifPresent(member -> {
                member.updatePassword(encoded);
                memberRepository.flush();
                log.debug("[DevDataLoader] 비밀번호 설정 완료: loginId={}", loginId);
            });
        }
        log.info("[DevDataLoader] 테스트 계정 비밀번호를 '{}' 로 설정했습니다.", DEV_PASSWORD);
    }
}
