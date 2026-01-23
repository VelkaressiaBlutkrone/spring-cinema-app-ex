package com.cinema.global.exception;

import lombok.Getter;

/**
 * 회원 관련 예외
 */
@Getter
public class MemberException extends BusinessException {

    private final Long memberId;
    private final String loginId;

    public MemberException(ErrorCode errorCode) {
        super(errorCode);
        this.memberId = null;
        this.loginId = null;
    }

    public MemberException(ErrorCode errorCode, Long memberId) {
        super(errorCode, String.format("memberId=%d", memberId));
        this.memberId = memberId;
        this.loginId = null;
    }

    public MemberException(ErrorCode errorCode, String loginId) {
        super(errorCode, String.format("loginId=%s", loginId));
        this.memberId = null;
        this.loginId = loginId;
    }

    // 정적 팩토리 메서드
    public static MemberException notFound(Long memberId) {
        return new MemberException(ErrorCode.MEMBER_NOT_FOUND, memberId);
    }

    public static MemberException notFoundByLoginId(String loginId) {
        return new MemberException(ErrorCode.MEMBER_NOT_FOUND, loginId);
    }

    public static MemberException duplicateEmail(String email) {
        return new MemberException(ErrorCode.DUPLICATE_EMAIL, email);
    }

    public static MemberException invalidPassword() {
        return new MemberException(ErrorCode.INVALID_PASSWORD);
    }

    public static MemberException disabled(Long memberId) {
        return new MemberException(ErrorCode.MEMBER_DISABLED, memberId);
    }
}
