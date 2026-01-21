package com.cinema.domain.member.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.member.dto.MemberRequest;
import com.cinema.domain.member.dto.TokenResponse;
import com.cinema.domain.member.entity.Member;
import com.cinema.domain.member.repository.MemberRepository;
import com.cinema.global.jwt.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public Long signup(MemberRequest.SignUp request) {
        if (memberRepository.findByLoginId(request.getLoginId()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        Member member = Member.builder()
                .loginId(request.getLoginId())
                .passwordHash(passwordEncoder.encode(request.getPassword())) // 비밀번호 암호화
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .build();

        return memberRepository.save(member).getId();
    }

    @Transactional(readOnly = true)
    public TokenResponse login(MemberRequest.Login request) {
        Member member = memberRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), member.getPasswordHash())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        // 토큰 발급 (Access: 1시간, Refresh: 7일)
        String accessToken = jwtTokenProvider.createToken(member.getLoginId(), 3600000);
        String refreshToken = jwtTokenProvider.createToken(member.getLoginId(), 604800000);
        
        // TODO: Refresh Token은 Redis에 저장해야 안전함 (추후 구현)

        return new TokenResponse(accessToken, refreshToken);
    }
}