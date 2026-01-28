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
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("password123");
        Path out = Paths.get("build/password123_hash.txt");
        Files.createDirectories(out.getParent());
        Files.writeString(out, hash);
    }
}
