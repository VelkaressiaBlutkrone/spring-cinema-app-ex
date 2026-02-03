package com.cinema.application.log;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.global.dto.ApiResponse;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 프론트엔드/모바일에서 전송하는 클라이언트 로그 수신
 * Logback appender로 각각 logs/frontend.*.log, logs/mobile.*.log에 7일간 보관
 */
@RestController
@RequestMapping("/api/logs")
public class ClientLogController {

    private static final Logger frontendLog = LoggerFactory.getLogger("app.frontend");
    private static final Logger mobileLog = LoggerFactory.getLogger("app.mobile");

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> receiveLog(@Valid @RequestBody ClientLogRequest request) {
        String message = sanitize(request.getMessage());
        String dataStr = request.getData() != null && !request.getData().isEmpty()
                ? " " + sanitize(request.getData().toString())
                : "";

        Logger target = "frontend".equalsIgnoreCase(request.getSource()) ? frontendLog : mobileLog;
        switch (request.getLevel() != null ? request.getLevel().toLowerCase() : "info") {
            case "warn" -> target.warn("[{}] {}{}", request.getCategory(), message, dataStr);
            case "error" -> target.error("[{}] {}{}", request.getCategory(), message, dataStr);
            case "debug" -> target.debug("[{}] {}{}", request.getCategory(), message, dataStr);
            default -> target.info("[{}] {}{}", request.getCategory(), message, dataStr);
        }

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private static String sanitize(String s) {
        if (s == null || s.isEmpty()) return "";
        String cleaned = s.replaceAll("[\r\n\t]+", " ");
        return cleaned.substring(0, Math.min(cleaned.length(), 2000));
    }

    @Data
    public static class ClientLogRequest {
        @NotBlank
        private String source; // "frontend" | "mobile"

        private String level; // "info" | "warn" | "error" | "debug"

        @NotBlank
        private String category;

        @NotNull
        private String message;

        private Map<String, Object> data;
    }
}
