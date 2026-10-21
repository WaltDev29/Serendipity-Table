package com.serendipity.domain.matching.scheduler;

import com.serendipity.domain.matching.service.MatchingLifecycleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchingScheduler {

    private final MatchingLifecycleService lifecycleService;

    /**
     * 월요일 정오 (12:00): AI 1차 매칭 엔진 가동
     */
    @Scheduled(cron = "0 0 12 * * MON", zone = "Asia/Seoul")
    public void scheduleMondayNoon() {
        log.info("[스케줄러] 월요일 12:00 정기 매칭 실행");
        lifecycleService.runMondayNoonMatching(null);
    }

    /**
     * 월요일 21:00: AI 2차 재매칭 엔진 가동
     */
    @Scheduled(cron = "0 0 21 * * MON", zone = "Asia/Seoul")
    public void scheduleMondayNight() {
        log.info("[스케줄러] 월요일 21:00 2차 재매칭 실행");
        lifecycleService.runMondayNightRematch(null);
    }

    /**
     * 화요일 오전 08:00: 최종 재매칭 및 최종 실패 처리 (참가권 자동 반환)
     */
    @Scheduled(cron = "0 0 8 * * TUE", zone = "Asia/Seoul")
    public void scheduleTuesdayMorning() {
        log.info("[스케줄러] 화요일 08:00 최종 재매칭 및 미매칭 참가권 반환 실행");
        lifecycleService.runTuesdayMorningRematch(null);
    }

    /**
     * 화요일 정오 (12:00): 매칭 최종 확정, 단체 채팅방 개설, 식당 예약 진행
     */
    @Scheduled(cron = "0 0 12 * * TUE", zone = "Asia/Seoul")
    public void scheduleTuesdayNoon() {
        log.info("[스케줄러] 화요일 12:00 매칭 최종 확정 및 식당 예약, 채팅방 개설");
        lifecycleService.runTuesdayNoonFinalConfirmation(null);
    }

    /**
     * 화요일 16:00: 식당 미배정 테이블 관리자 예외큐 등록
     */
    @Scheduled(cron = "0 0 16 * * TUE", zone = "Asia/Seoul")
    public void scheduleTuesday16() {
        log.info("[스케줄러] 화요일 16:00 식당 미배정 예외 확인");
        lifecycleService.checkTuesday16UnreservedVenues(null);
    }

    /**
     * 모임 당일(목) 12:00: 활성 채팅방 및 참가자 모임 리마인드 알림 발송
     */
    @Scheduled(cron = "0 0 12 * * THU", zone = "Asia/Seoul")
    public void scheduleThursdayNoon() {
        log.info("[스케줄러] 목요일 12:00 모임 D-Day 당일 리마인드 발송");
        lifecycleService.sendEventDayNoonReminder(null);
    }

    /**
     * 모임 30분 전(목 19:00): 리마인드 알림 발송
     */
    @Scheduled(cron = "0 0 19 * * THU", zone = "Asia/Seoul")
    public void scheduleThursday19() {
        log.info("[스케줄러] 목요일 19:00 모임 30분 전 리마인드 발송");
        lifecycleService.sendEventDay30MinReminder(null);
    }

    /**
     * 모임 시작 시간(목 19:30): 시작 및 환영 알림 발송
     */
    @Scheduled(cron = "0 30 19 * * THU", zone = "Asia/Seoul")
    public void scheduleThursday1930() {
        log.info("[스케줄러] 목요일 19:30 식탁 시작 알림 발송");
        lifecycleService.sendEventDayStartNotice(null);
    }

    /**
     * 모임 다음날(금) 정오 (12:00): 사후 다이닝 피드백 및 평가 요청 알림 발송
     */
    @Scheduled(cron = "0 0 12 * * FRI", zone = "Asia/Seoul")
    public void scheduleFridayNoon() {
        log.info("[스케줄러] 금요일 12:00 사후 피드백 요청 발송");
        lifecycleService.sendNextDayFeedbackRequest(null);
    }
}
