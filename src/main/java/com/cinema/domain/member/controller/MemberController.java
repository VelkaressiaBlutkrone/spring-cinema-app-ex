package com.cinema.domain.member.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.member.dto.MemberRequest;
import com.cinema.domain.member.dto.TokenResponse;
import com.cinema.domain.member.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/signup")
    public ResponseEntity<Long> signup(@RequestBody MemberRequest.SignUp request) {
        return ResponseEntity.ok(memberService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody MemberRequest.Login request) {
        return ResponseEntity.ok(memberService.login(request));
    }
}
