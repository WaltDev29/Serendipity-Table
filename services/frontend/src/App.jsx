import React from 'react'

export default function App() {
  return (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      <header style={{ marginTop: '40px' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '26px', fontWeight: '800' }}>우연한 식탁</h1>
        <p style={{ color: 'var(--text-sub)', marginTop: '8px', fontSize: '15px' }}>
          취향과 라이프스타일이 통하는 사람들과의 특별한 저녁
        </p>
      </header>
      <div style={{
        margin: '40px auto',
        padding: '24px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--bg-card-border)',
        backdropFilter: 'var(--backdrop-blur)'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>서비스 준비 중</h2>
        <p style={{ color: 'var(--text-sub)', fontSize: '14px', lineHeight: '1.6' }}>
          Docker Compose 기반 개발 환경이 구성되었습니다.<br/>
          곧 신청서 및 매칭 시스템이 활성화됩니다.
        </p>
      </div>
    </div>
  )
}
