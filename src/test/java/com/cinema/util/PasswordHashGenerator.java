package com.cinema.util;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * test_data.sql용 BCrypt 해시 생성.
 * 실행: ./gradlew test --tests "com.cinema.util.PasswordHashGenerator.printHashForPassword123"
 * build/password123_hash.txt 에 해시가 저장됨.
 */
class PasswordHashGenerator {

    @Test
    void printHashForPassword123() throws Exception {
        // given: BCrypt 인코더, 비밀번호 "password123", 출력 경로 build/password123_hash.txt
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        Path out = Paths.get("build/password123_hash.txt");
        Files.createDirectories(out.getParent());

        // when: password123을 BCrypt로 인코딩 후 파일에 저장
        String hash = encoder.encode("password123");
        Files.writeString(out, hash);

        // then: build/password123_hash.txt에 해시 문자열 기록됨 (테스트 데이터용)
    }
}
