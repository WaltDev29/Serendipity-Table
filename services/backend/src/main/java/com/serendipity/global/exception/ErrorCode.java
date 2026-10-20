package com.serendipity.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "적절하지 않은 요청 값입니다."),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "C002", "요청한 리소스를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C003", "서버 내부 오류가 발생했습니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "C004", "지원하지 않는 HTTP 메서드입니다."),

    // Security & Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "A001", "인증이 필요하거나 유효하지 않은 토큰입니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "A002", "접근 권한이 없습니다."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "A003", "전화번호 또는 비밀번호가 일치하지 않습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "A004", "해당 사용자를 찾을 수 없습니다."),
    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "A005", "이미 등록된 전화번호입니다."),
    USER_BLACKLISTED(HttpStatus.FORBIDDEN, "A006", "이용 정지(블랙리스트) 처리된 계정입니다."),

    // Ticket & Payment
    TICKET_NOT_FOUND(HttpStatus.NOT_FOUND, "T001", "사용 가능한 참가권이 없습니다."),
    TICKET_INSUFFICIENT(HttpStatus.BAD_REQUEST, "T002", "참가권 잔여 횟수가 부족합니다."),

    // Event & Application
    SLOT_CLOSED(HttpStatus.BAD_REQUEST, "E001", "해당 슬롯은 신청이 마감되었습니다."),
    ALREADY_APPLIED(HttpStatus.CONFLICT, "E002", "이미 해당 회차에 참가 신청하셨습니다."),
    APPLICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "E003", "신청 내역을 찾을 수 없습니다."),
    CANNOT_CANCEL_CONFIRMED(HttpStatus.BAD_REQUEST, "E004", "매칭 확정 후에는 취소할 수 없습니다."),

    // Table & Matching
    TABLE_NOT_FOUND(HttpStatus.NOT_FOUND, "M001", "식탁 모임을 찾을 수 없습니다."),
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "M002", "식탁 참가자 정보를 찾을 수 없습니다."),
    NOT_A_TABLE_MEMBER(HttpStatus.FORBIDDEN, "M003", "해당 식탁의 참가자가 아닙니다."),

    // Chat
    CHAT_ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "CH001", "채팅방을 찾을 수 없습니다."),

    // Block
    ALREADY_BLOCKED(HttpStatus.CONFLICT, "B001", "이미 차단된 사용자입니다."),
    CANNOT_BLOCK_SELF(HttpStatus.BAD_REQUEST, "B002", "자기 자신은 차단할 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
