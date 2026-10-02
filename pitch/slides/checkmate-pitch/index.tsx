import {
  type DesignSystem,
  type Page,
  type SlideMeta,
  useIsActivePage,
  useSlidePageNumber,
} from '@open-slide/core';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import caseDetail from './assets/case-detail.png';
import videoPoster from './assets/video-poster.png';

const filmUrl = new URL('./assets/checkmate-film-v7.mp4', import.meta.url).href;

export const design: DesignSystem = {
  palette: { bg: '#0b1628', text: '#eef2f7', accent: '#5b93ff' },
  fonts: {
    display:
      '"PingFang TC", "Noto Sans TC", "Microsoft JhengHei", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    body: '"PingFang TC", "Noto Sans TC", "Microsoft JhengHei", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  },
  typeScale: { hero: 120, body: 30 },
  radius: 16,
};

const c = {
  muted: '#8b9bb3',
  dim: '#5c6d86',
  line: 'rgba(255, 255, 255, 0.10)',
  panel: '#111f38',
  panel2: '#15284a',
  brand: '#1849a9',
  ok: '#3ecf8e',
  warn: '#f0b453',
  risk: '#f07171',
};

const mono = '"SF Mono", ui-monospace, Menlo, Consolas, monospace';

const fill: CSSProperties = {
  width: '100%',
  height: '100%',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  position: 'relative',
  boxSizing: 'border-box',
};

const content: CSSProperties = {
  ...fill,
  padding: '104px 140px 110px',
  display: 'flex',
  flexDirection: 'column',
};

// ---------- shared pieces ----------

const LogoMark = ({ size }: { size: number }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: c.brand,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12.5l4.2 4.2L19 7"
        stroke="#ffffff"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const Logo = ({ size }: { size: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.3 }}>
    <LogoMark size={size} />
    <span style={{ fontSize: size * 0.78, fontWeight: 600, letterSpacing: '-0.01em' }}>
      CheckMate
    </span>
  </div>
);

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 140,
        right: 140,
        bottom: 44,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 22,
        color: c.dim,
      }}
    >
      <span>CheckMate ・ AI Expense Review &amp; Control Layer</span>
      <span style={{ fontFamily: mono }}>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};

const Heading = ({ eyebrow, children }: { eyebrow: string; children: ReactNode }) => (
  <div>
    <div
      style={{
        fontSize: 26,
        color: 'var(--osd-accent)',
        fontWeight: 600,
        letterSpacing: '0.08em',
        marginBottom: 20,
      }}
    >
      {eyebrow}
    </div>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 68,
        fontWeight: 800,
        lineHeight: 1.22,
        margin: 0,
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </h2>
  </div>
);

const Source = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 22, color: c.dim, lineHeight: 1.5 }}>{children}</div>
);

type Tone = 'ok' | 'warn' | 'risk';
const toneColor: Record<Tone, string> = { ok: c.ok, warn: c.warn, risk: c.risk };

const Badge = ({ tone, children, size = 26 }: { tone: Tone; children: ReactNode; size?: number }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      fontSize: size,
      fontWeight: 600,
      color: toneColor[tone],
      background: 'rgba(255,255,255,0.05)',
      border: `1px solid ${toneColor[tone]}55`,
      borderRadius: 999,
      padding: '6px 18px',
      whiteSpace: 'nowrap',
    }}
  >
    <span
      style={{ width: size * 0.36, height: size * 0.36, borderRadius: 999, background: toneColor[tone] }}
    />
    {children}
  </span>
);

const Card = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      background: c.panel,
      border: `1px solid ${c.line}`,
      borderRadius: 'var(--osd-radius)',
      padding: '40px 44px',
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);

const Bullet = ({ children, color = c.muted }: { children: ReactNode; color?: string }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, fontSize: 30, lineHeight: 1.6 }}>
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 2,
        background: color,
        flexShrink: 0,
        transform: 'translateY(-6px)',
      }}
    />
    <span>{children}</span>
  </div>
);

// ---------- 01 Cover ----------

const Cover: Page = () => (
  <div
    style={{
      ...fill,
      padding: '0 160px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background:
        'radial-gradient(1200px 700px at 78% 30%, rgba(24,73,169,0.35), transparent 70%), var(--osd-bg)',
    }}
  >
    <Logo size={72} />
    <div
      style={{
        marginTop: 72,
        fontSize: 30,
        color: 'var(--osd-accent)',
        fontWeight: 600,
        letterSpacing: '0.06em',
      }}
    >
      AI Expense Review &amp; Control Layer
    </div>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 'var(--osd-size-hero)',
        fontWeight: 800,
        lineHeight: 1.15,
        margin: '28px 0 0',
        letterSpacing: '-0.02em',
      }}
    >
      讓財務只處理
      <br />
      真正需要人的案件
    </h1>
    <p style={{ fontSize: 36, color: c.muted, margin: '40px 0 0' }}>
      疊加在既有財務系統上的 AI 費用審查與控制層
    </p>
    <div style={{ position: 'absolute', left: 160, bottom: 72, fontSize: 24, color: c.dim }}>
      2026 AI Practitioner Program ・ 第 5 組
    </div>
  </div>
);

// ---------- 02 Problem ----------

const Stat = ({ value, unit, label, sub }: { value: string; unit: string; label: string; sub: string }) => (
  <Card style={{ padding: '52px 48px' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, whiteSpace: 'nowrap' }}>
      <span
        style={{
          fontSize: 116,
          fontWeight: 800,
          lineHeight: 1,
          color: 'var(--osd-accent)',
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 44, fontWeight: 700, color: 'var(--osd-accent)' }}>{unit}</span>
    </div>
    <div style={{ fontSize: 34, fontWeight: 600, marginTop: 36, lineHeight: 1.4 }}>{label}</div>
    <div style={{ fontSize: 26, color: c.muted, marginTop: 12 }}>{sub}</div>
  </Card>
);

const Problem: Page = () => (
  <div style={content}>
    <Heading eyebrow="問題">每一筆都得有人看，錯的還要再花一次</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, marginTop: 80 }}>
      <Stat value="19" unit="%" label="的費用報告有錯誤或缺漏" sub="約每 5 份就有 1 份" />
      <Stat value="18" unit="分鐘" label="每份錯誤報告的補正時間" sub="另加 US$58 補正成本" />
      <Stat value="3,000" unit="小時" label="受訪企業每年的補正工時" sub="約 50 萬美元" />
    </div>
    <div style={{ marginTop: 'auto' }}>
      <Source>
        資料來源：GBTA Foundation, Expense Reporting: Global Practices and Pain Points (2015)
      </Source>
    </div>
    <Footer />
  </div>
);

// ---------- 03 Why existing approaches fall short ----------

const Approach = ({ title, a, b, d }: { title: string; a: string; b: string; d: string }) => (
  <Card>
    <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 24 }}>{title}</div>
    <Bullet>{a}</Bullet>
    <Bullet>{b}</Bullet>
    <Bullet>{d}</Bullet>
  </Card>
);

const Gap: Page = () => (
  <div style={content}>
    <Heading eyebrow="為什麼現有做法不夠">規則抓得到超額，抓不到「不對勁」</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, marginTop: 64 }}>
      <Approach title="人工逐筆" a="每一筆都要人看" b="比對、通知、轉交全靠人" d="標準因人而異" />
      <Approach title="只靠規則" a="只回答「有沒有違規」" b="看不到合理性與情境" d="跨案件重複、拆單難發現" />
      <Approach title="直接交給 AI" a="判斷難以預測" b="結果難以追溯" d="一錯就被放大" />
    </div>
    <div
      style={{
        marginTop: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 48,
        borderLeft: '4px solid var(--osd-accent)',
        paddingLeft: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 }}>
        <span style={{ fontSize: 88, fontWeight: 800, color: 'var(--osd-accent)', lineHeight: 1 }}>
          18
        </span>
        <span style={{ fontSize: 38, fontWeight: 700, color: 'var(--osd-accent)' }}>個月</span>
      </div>
      <div>
        <div style={{ fontSize: 30, lineHeight: 1.5 }}>
          費用報支舞弊的中位數發現時間；占職務舞弊案件 13%，損失中位數 US$50,000
        </div>
        <div style={{ marginTop: 8 }}>
          <Source>資料來源：ACFE, Occupational Fraud 2024: A Report to the Nations, p.13, p.16</Source>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

// ---------- 04 Positioning + Phase 1 scope ----------

const Chip = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      fontSize: 28,
      fontWeight: 600,
      padding: '16px 20px',
      borderRadius: 12,
      background: 'rgba(91,147,255,0.12)',
      border: '1px solid rgba(91,147,255,0.35)',
      textAlign: 'center',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

const Layer = ({ title, sub }: { title: string; sub: string }) => (
  <div
    style={{
      border: `1px dashed ${c.dim}`,
      borderRadius: 'var(--osd-radius)',
      padding: '26px 40px',
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    }}
  >
    <span style={{ fontSize: 34, fontWeight: 700 }}>{title}</span>
    <span style={{ fontSize: 28, color: c.muted }}>{sub}</span>
  </div>
);

const ScopeItem = ({ children, on }: { children: ReactNode; on: boolean }) => (
  <div
    style={{
      fontSize: 30,
      lineHeight: 1.6,
      color: on ? 'var(--osd-text)' : c.muted,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}
  >
    <span
      style={{
        width: 22,
        height: 3,
        background: on ? 'var(--osd-accent)' : c.dim,
        flexShrink: 0,
      }}
    />
    {children}
  </div>
);

const Positioning: Page = () => (
  <div style={content}>
    <Heading eyebrow="CheckMate 的位置">不換系統，疊一層審查與控制</Heading>
    <div style={{ display: 'flex', gap: 56, marginTop: 56 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Layer title="財務初審人員" sub="只處理需要判斷的例外" />
        <div
          style={{
            border: '2px solid var(--osd-accent)',
            background: c.panel2,
            borderRadius: 'var(--osd-radius)',
            padding: '32px 40px 40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 28 }}>
            <span style={{ fontSize: 40, fontWeight: 800 }}>CheckMate</span>
            <span style={{ fontSize: 26, color: c.muted }}>Review &amp; Control Layer</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <Chip>擷取與比對</Chip>
            <Chip>規範與法規檢核</Chip>
            <Chip>規則外風險訊號</Chip>
            <Chip>三種審查建議</Chip>
            <Chip>授權內受控處置</Chip>
            <Chip>完整稽核軌跡</Chip>
          </div>
        </div>
        <Layer title="既有 ERP ・ BPM ・ 費用系統 ・ 會計" sub="正式紀錄留在原系統" />
      </div>
      <Card style={{ width: 500, flexShrink: 0, padding: '40px 44px' }}>
        <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 28 }}>Phase 1 聚焦初審</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--osd-accent)', marginBottom: 8 }}>
          做
        </div>
        <ScopeItem on>初審判斷與分流</ScopeItem>
        <ScopeItem on>風險辨識與佐證</ScopeItem>
        <ScopeItem on>授權內的後續處置</ScopeItem>
        <div style={{ fontSize: 24, fontWeight: 600, color: c.muted, margin: '28px 0 8px' }}>
          不做
        </div>
        <ScopeItem on={false}>最終核准</ScopeItem>
        <ScopeItem on={false}>正式會計入帳</ScopeItem>
        <ScopeItem on={false}>自動付款</ScopeItem>
        <ScopeItem on={false}>稅務申報與法律認定</ScopeItem>
      </Card>
    </div>
    <Footer />
  </div>
);

// ---------- 05 Film ----------

const Film: Page = () => {
  const active = useIsActivePage();
  const ref = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!active || !v) return;
    v.currentTime = 0;
    v.play()
      .then(() => setBlocked(false))
      .catch(() => setBlocked(true));
    return () => {
      v.pause();
    };
  }, [active]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play()
        .then(() => setBlocked(false))
        .catch(() => setBlocked(true));
    } else {
      v.pause();
    }
  };

  // Thumbnails, presenter previews and PDF export are never active: show a still, don't load the film.
  if (!active) {
    return (
      <div style={{ ...fill, background: '#000' }}>
        <img
          src={videoPoster}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.55 }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          <PlayGlyph />
          <div style={{ fontSize: 40, fontWeight: 700 }}>產品示意影片</div>
          <div style={{ fontSize: 26, color: c.muted }}>88 秒 ・ 畫面、案件與規則皆為模擬資料</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...fill, background: '#000' }} onClick={toggle}>
      <video
        ref={ref}
        src={filmUrl}
        poster={videoPoster}
        playsInline
        preload="auto"
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
      />
      {blocked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            background: 'rgba(0,0,0,0.45)',
            cursor: 'pointer',
          }}
        >
          <PlayGlyph />
          <div style={{ fontSize: 32, fontWeight: 600 }}>點擊播放影片</div>
        </div>
      )}
    </div>
  );
};

const PlayGlyph = () => (
  <div
    style={{
      width: 132,
      height: 132,
      borderRadius: 999,
      background: 'rgba(255,255,255,0.14)',
      border: '2px solid rgba(255,255,255,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <svg width={52} height={52} viewBox="0 0 24 24">
      <path d="M8 5.5v13l10.5-6.5z" fill="#ffffff" />
    </svg>
  </div>
);

// ---------- 06 Trust: 漏判 vs 誤判 ----------

const Cond = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      fontSize: 27,
      fontWeight: 600,
      padding: '12px 18px',
      borderRadius: 10,
      border: `1px solid ${c.line}`,
      background: 'rgba(255,255,255,0.04)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      whiteSpace: 'nowrap',
    }}
  >
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12.5l4.2 4.2L19 7"
        stroke={c.ok}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    {children}
  </div>
);

const ErrorTag = ({ tone, name, desc }: { tone: Tone; name: string; desc: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
    <Badge tone={tone} size={28}>
      {name}
    </Badge>
    <span style={{ fontSize: 28, color: c.muted }}>{desc}</span>
  </div>
);

const Trust: Page = () => (
  <div style={content}>
    <Heading eyebrow="控制誤判與漏判">AI 會錯，所以先設計好錯的代價</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 52 }}>
      <Card>
        <ErrorTag tone="risk" name="漏判" desc="有問題卻被放行" />
        <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.3 }}>
          放行看控制條件，
          <br />
          不看模型信心
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 30 }}
        >
          <Cond>必要檢查完成</Cond>
          <Cond>證據充分</Cond>
          <Cond>規則明確</Cond>
          <Cond>無阻擋風險</Cond>
          <Cond>無未解決衝突</Cond>
          <Cond>在授權範圍內</Cond>
        </div>
        <div style={{ fontSize: 27, color: c.muted, marginTop: 26 }}>
          六項全部符合才推進；任一不符，轉補件或人工
        </div>
      </Card>
      <Card>
        <ErrorTag tone="warn" name="誤判" desc="沒問題卻被攔下" />
        <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.3 }}>
          代價是多一次人工確認，
          <br />
          而且可逆
        </div>
        <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Bullet color={c.warn}>財務可直接覆寫 Agent 結果</Bullet>
          <Bullet color={c.warn}>保留原始建議、原因、執行者與時間</Bullet>
          <Bullet color={c.warn}>覆寫紀錄回饋規範與授權邊界</Bullet>
        </div>
      </Card>
    </div>
    <div
      style={{
        marginTop: 36,
        fontSize: 32,
        fontWeight: 600,
        borderLeft: '4px solid var(--osd-accent)',
        paddingLeft: 32,
      }}
    >
      資料不足時標示「無法判斷」，不硬猜。
    </div>
    <Footer />
  </div>
);

// ---------- 07 Adoption ----------

const StepCard = ({ n, title, children }: { n: string; title: string; children: ReactNode }) => (
  <Card style={{ padding: '44px 44px 48px' }}>
    <div style={{ fontFamily: mono, fontSize: 30, color: 'var(--osd-accent)', fontWeight: 700 }}>{n}</div>
    <div style={{ fontSize: 42, fontWeight: 800, margin: '18px 0 22px' }}>{title}</div>
    <div style={{ fontSize: 30, lineHeight: 1.6, color: c.muted }}>{children}</div>
  </Card>
);

const Adoption: Page = () => (
  <div style={content}>
    <Heading eyebrow="落地方式">從影子審查開始，逐步授權</Heading>
    <div style={{ marginTop: 56 }}>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: c.muted, marginBottom: 14 }}
      >
        <span>Agent 授權範圍：零</span>
        <span>逐步擴大</span>
      </div>
      <div
        style={{
          height: 14,
          borderRadius: 999,
          background: 'linear-gradient(90deg, rgba(91,147,255,0.12), var(--osd-accent))',
        }}
      />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, marginTop: 36 }}>
      <StepCard n="01" title="影子審查">
        批次匯入案件，與人工平行審查。Agent 不執行任何動作，只累積誤判與漏判紀錄。
      </StepCard>
      <StepCard n="02" title="限定授權">
        先開放低風險、可逆的動作，例如通知補件、轉交人工。
      </StepCard>
      <StepCard n="03" title="逐步放寬">
        依覆寫率與執行結果，擴大可自動推進的案件類型，並持續監控。
      </StepCard>
    </div>
    <div
      style={{
        marginTop: 40,
        fontSize: 30,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        color: 'var(--osd-text)',
      }}
    >
      <span style={{ color: c.muted }}>串接由淺到深：</span>
      <span style={{ fontWeight: 600 }}>檔案上傳 → 批次 → API 串接既有流程</span>
      <span style={{ color: c.muted }}>・ 不需替換 ERP／BPM</span>
    </div>
    <Footer />
  </div>
);

// ---------- 08 Closing ----------

const Closing: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      background:
        'radial-gradient(1100px 640px at 50% 45%, rgba(24,73,169,0.32), transparent 70%), var(--osd-bg)',
    }}
  >
    <Logo size={64} />
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 112,
        fontWeight: 800,
        lineHeight: 1.2,
        margin: '64px 0 0',
        letterSpacing: '-0.02em',
      }}
    >
      <span style={{ color: c.muted }}>從逐筆審查，</span>
      <br />
      到只處理例外
    </h1>
    <p style={{ fontSize: 34, color: c.muted, margin: '48px 0 0' }}>
      AI Expense Review &amp; Control Layer
    </p>
    <div style={{ position: 'absolute', bottom: 80, fontSize: 30, fontWeight: 600 }}>
      謝謝 ・ 歡迎提問
    </div>
  </div>
);

// ---------- Backup ----------

const BackupDivider: Page = () => (
  <div
    style={{
      ...fill,
      padding: '0 160px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    <div style={{ fontSize: 30, color: 'var(--osd-accent)', fontWeight: 600, letterSpacing: '0.08em' }}>
      BACKUP
    </div>
    <h1 style={{ fontSize: 104, fontWeight: 800, margin: '24px 0 0' }}>Q&amp;A 參考資料</h1>
    <p style={{ fontSize: 32, color: c.muted, marginTop: 36 }}>
      案例對照 ・ 建議與動作 ・ 控制機制 ・ 佐證鏈 ・ 架構 ・ 決策資料 ・ 導入路線 ・ 利害關係人 ・ 資料來源
    </p>
  </div>
);

const th: CSSProperties = {
  textAlign: 'left',
  fontSize: 24,
  color: c.muted,
  fontWeight: 600,
  padding: '0 16px 16px',
  borderBottom: `1px solid ${c.line}`,
};

const CaseRow = ({
  id,
  name,
  finding,
  tone,
  rec,
  action,
}: {
  id: string;
  name: string;
  finding: string;
  tone: Tone;
  rec: string;
  action: string;
}) => {
  const td: CSSProperties = {
    fontSize: 27,
    padding: '13px 16px',
    borderBottom: `1px solid ${c.line}`,
    whiteSpace: 'nowrap',
  };
  return (
    <tr>
      <td style={{ ...td, fontFamily: mono, fontSize: 24, color: c.muted }}>{id}</td>
      <td style={td}>{name}</td>
      <td style={td}>{finding}</td>
      <td style={td}>
        <Badge tone={tone} size={22}>
          {rec}
        </Badge>
      </td>
      <td style={{ ...td, color: c.muted }}>{action}</td>
    </tr>
  );
};

const CaseMap: Page = () => (
  <div style={content}>
    <Heading eyebrow="B1 ・ 示範案例">每一種狀況，都有對應的處理</Heading>
    <table style={{ borderCollapse: 'collapse', marginTop: 48, width: '100%' }}>
      <thead>
        <tr>
          <th style={th}>案件</th>
          <th style={th}>申報項目</th>
          <th style={th}>發現</th>
          <th style={th}>審查建議</th>
          <th style={th}>處置</th>
        </tr>
      </thead>
      <tbody>
        <CaseRow id="EXP-2026-001" name="台中客戶拜訪住宿" finding="6 項檢查皆未見異常" tone="ok" rec="建議通過" action="完成初審，送往下一節點" />
        <CaseRow id="EXP-2026-002" name="高雄展會支援住宿" finding="缺少住宿憑證（P-02）" tone="warn" rec="建議補件" action="已通知申請人補件" />
        <CaseRow id="EXP-2026-003" name="新竹供應商會議交通" finding="申請比憑證多 NT$200（E-01）" tone="risk" rec="建議人工審核" action="財務退回，請補差額說明" />
        <CaseRow id="EXP-2026-004" name="台南客戶專案訪談住宿" finding="超出每晚上限 NT$1,200（P-01）" tone="risk" rec="建議人工審核" action="由財務確認例外核准" />
        <CaseRow id="EXP-2026-005" name="台中設計工作坊交通" finding="與 EXP-2026-018 疑似重複" tone="risk" rec="建議人工審核" action="財務退回，請說明" />
        <CaseRow id="EXP-2026-011" name="新竹供應商年度會議交通" finding="行程在新竹，消費在高雄" tone="risk" rec="建議人工審核" action="人工確認通過（行程異動）" />
        <CaseRow id="EXP-2026-012" name="港都餐飲客戶餐敘" finding="憑證版型與歷史不一致" tone="risk" rec="建議人工審核" action="轉交進一步審查" />
        <CaseRow id="EXP-2026-015" name="年度軟體授權 NT$48,000" finding="超出 Agent 授權範圍" tone="ok" rec="建議通過" action="未自動執行，轉交人工" />
      </tbody>
    </table>
    <Footer />
  </div>
);

const ActionRow = ({ code, desc }: { code: string; desc: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 28,
      padding: '20px 0',
      borderBottom: `1px solid ${c.line}`,
    }}
  >
    <span style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: 'var(--osd-accent)', width: 250 }}>
      {code}
    </span>
    <span style={{ fontSize: 30 }}>{desc}</span>
  </div>
);

const RecAction: Page = () => (
  <div style={content}>
    <Heading eyebrow="B2 ・ 建議與動作分離">建議是判斷，動作是執行，兩者分開</Heading>
    <div style={{ display: 'flex', gap: 56, marginTop: 56 }}>
      <Card style={{ width: 460, flexShrink: 0 }}>
        <div style={{ fontSize: 26, color: c.muted, marginBottom: 28 }}>審查建議（只有三種）</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
          <Badge tone="ok" size={32}>建議通過</Badge>
          <Badge tone="warn" size={32}>建議補件</Badge>
          <Badge tone="risk" size={32}>建議人工審核</Badge>
        </div>
      </Card>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 26, color: c.muted, marginBottom: 8 }}>流程動作（Agent 與人工共用，執行者記入稽核）</div>
        <ActionRow code="PROCEED" desc="初審完成，推進至既有流程下一節點" />
        <ActionRow code="REQUEST_INFO" desc="要求補件或補充資訊" />
        <ActionRow code="ESCALATE" desc="轉交人工審查" />
        <ActionRow code="OVERRIDE" desc="人工覆寫 Agent 結果，保留原始紀錄" />
      </div>
    </div>
    <div style={{ marginTop: 'auto', fontSize: 30, borderLeft: '4px solid var(--osd-accent)', paddingLeft: 32 }}>
      「建議通過」不等於最終核准；不符合授權時，Agent 不執行，交由人工。
    </div>
    <Footer />
  </div>
);

const Control = ({ title, en, desc }: { title: string; en: string; desc: string }) => (
  <Card style={{ padding: '34px 38px' }}>
    <div style={{ fontSize: 36, fontWeight: 700 }}>{title}</div>
    <div style={{ fontSize: 22, color: c.dim, marginTop: 4 }}>{en}</div>
    <div style={{ fontSize: 26, color: c.muted, marginTop: 18, lineHeight: 1.5 }}>{desc}</div>
  </Card>
);

const Controls: Page = () => (
  <div style={content}>
    <Heading eyebrow="B3 ・ 控制機制">六道控制，AI 不會自己說了算</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginTop: 52 }}>
      <Control title="必要檢核" en="Required Checks" desc="每個面向都要有結果，沒查完不給建議" />
      <Control title="強制防護" en="Hard Guardrails" desc="超額、超出授權等紅線，一律攔下" />
      <Control title="獨立驗證" en="Independent Verification" desc="放行前，再由另一道檢查確認一次" />
      <Control title="佐證鏈" en="Evidence Chain" desc="每個判斷都連回規則與憑證，隨時回查" />
      <Control title="漸進式自動化" en="Progressive Automation" desc="先授權低風險案件，驗證後再逐步放寬" />
      <Control title="執行後監控" en="Post-action Monitoring" desc="放行後追蹤結果，有異常就調整授權" />
    </div>
    <div style={{ marginTop: 'auto', fontSize: 26, color: c.muted }}>
      自動執行條件：必要檢查完成＋證據充分＋規則明確＋無阻擋風險＋無未解決衝突＋位於企業授權範圍
    </div>
    <Footer />
  </div>
);

const ChainNode = ({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) => (
  <div style={{ display: 'flex', gap: 24 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
      <span style={{ width: 20, height: 20, borderRadius: 999, background: 'var(--osd-accent)', marginTop: 10 }} />
      {!last && <span style={{ flex: 1, width: 2, background: c.line, marginTop: 6 }} />}
    </div>
    <div style={{ paddingBottom: last ? 0 : 30 }}>
      <div style={{ fontSize: 22, color: 'var(--osd-accent)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 600, marginTop: 6, lineHeight: 1.4 }}>{children}</div>
    </div>
  </div>
);

const Evidence: Page = () => (
  <div style={content}>
    <Heading eyebrow="B4 ・ 佐證鏈">每個判斷，都連回憑證與規範</Heading>
    <div style={{ display: 'flex', gap: 56, marginTop: 48, alignItems: 'flex-start' }}>
      <img
        src={caseDetail}
        style={{
          width: 1040,
          borderRadius: 14,
          border: `1px solid ${c.line}`,
          display: 'block',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, paddingTop: 8 }}>
        <ChainNode label="發現">超出每晚上限 NT$1,200</ChainNode>
        <ChainNode label="佐證">憑證 EV-004 ・ NT$4,200</ChainNode>
        <ChainNode label="規範">P-01 國內住宿每晚 NT$3,000</ChainNode>
        <ChainNode label="結果" last>
          建議人工審核
          <br />
          <span style={{ color: c.muted, fontWeight: 400 }}>動作由財務決定</span>
        </ChainNode>
      </div>
    </div>
    <Footer />
  </div>
);

const ArchCol = ({ tag, title, children }: { tag: string; title: string; children: ReactNode }) => (
  <Card style={{ padding: '36px 40px' }}>
    <div style={{ fontSize: 22, color: 'var(--osd-accent)', fontWeight: 700, letterSpacing: '0.08em' }}>{tag}</div>
    <div style={{ fontSize: 36, fontWeight: 700, margin: '8px 0 20px' }}>{title}</div>
    {children}
  </Card>
);

const Arch: Page = () => (
  <div style={content}>
    <Heading eyebrow="B5 ・ 產品架構">理解、決策、執行，再用結果持續改善</Heading>
    <div
      style={{
        marginTop: 44,
        fontSize: 28,
        fontWeight: 600,
        padding: '18px 32px',
        borderRadius: 12,
        background: c.panel2,
        color: 'var(--osd-text)',
      }}
    >
      理解 → 決策 → 執行 → 觀察結果 → 持續改善
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginTop: 32 }}>
      <ArchCol tag="ENGINE" title="審查引擎">
        <Bullet>資料擷取與正規化</Bullet>
        <Bullet>佐證比對</Bullet>
        <Bullet>審查流程協調</Bullet>
        <Bullet>建議與流程動作</Bullet>
        <Bullet>稽核軌跡</Bullet>
      </ArchCol>
      <ArchCol tag="MODULES" title="審查模組">
        <Bullet>企業規範</Bullet>
        <Bullet>法規遵循套件</Bullet>
        <Bullet>真偽／舞弊風險訊號</Bullet>
        <Bullet>情境風險</Bullet>
      </ArchCol>
      <ArchCol tag="INTEGRATION" title="系統整合">
        <Bullet>檔案／批次</Bullet>
        <Bullet>ERP／BPM／費用系統</Bullet>
        <Bullet>企業卡</Bullet>
        <Bullet>會計／應付帳款</Bullet>
      </ArchCol>
    </div>
    <Footer />
  </div>
);

const FlowNode = ({ children, strong }: { children: ReactNode; strong?: boolean }) => (
  <div
    style={{
      fontSize: 30,
      fontWeight: 700,
      padding: '24px 30px',
      borderRadius: 14,
      background: strong ? 'rgba(91,147,255,0.16)' : c.panel,
      border: `1px solid ${strong ? 'rgba(91,147,255,0.5)' : c.line}`,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

const Arrow = () => <span style={{ fontSize: 32, color: c.dim }}>→</span>;

const Flywheel: Page = () => (
  <div style={content}>
    <Heading eyebrow="B6 ・ 決策資料">每一次人工決策，都讓制度更準</Heading>
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 72 }}>
      <FlowNode>案件</FlowNode>
      <Arrow />
      <FlowNode>Agent 發現</FlowNode>
      <Arrow />
      <FlowNode strong>人工決策</FlowNode>
      <Arrow />
      <FlowNode strong>覆寫</FlowNode>
      <Arrow />
      <FlowNode>最終結果</FlowNode>
    </div>
    <div
      style={{
        marginTop: 28,
        fontSize: 28,
        color: 'var(--osd-accent)',
        fontWeight: 600,
        borderTop: '2px dashed rgba(91,147,255,0.45)',
        paddingTop: 20,
      }}
    >
      回饋：調整規範、流程與自動化邊界
    </div>
    <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 26, color: c.muted, marginBottom: 8 }}>企業可以看見</div>
      <Bullet color="var(--osd-accent)">哪些規範最常造成補件或例外</Bullet>
      <Bullet color="var(--osd-accent)">哪些案件類型最常被人工覆寫</Bullet>
      <Bullet color="var(--osd-accent)">哪些控制條件可以逐步自動化</Bullet>
      <Bullet color="var(--osd-accent)">哪些制度與實際業務情境脫節</Bullet>
    </div>
    <Footer />
  </div>
);

const Phase = ({ m, title, gate, children }: { m: string; title: string; gate: string; children: ReactNode }) => (
  <Card style={{ padding: '30px 30px 34px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ fontFamily: mono, fontSize: 24, color: 'var(--osd-accent)', fontWeight: 700 }}>{m}</div>
    <div style={{ fontSize: 34, fontWeight: 800, margin: '12px 0 18px' }}>{title}</div>
    <div style={{ fontSize: 26, color: c.muted, lineHeight: 1.55, flex: 1 }}>{children}</div>
    <div
      style={{
        marginTop: 24,
        fontSize: 24,
        fontWeight: 600,
        paddingTop: 18,
        borderTop: `1px solid ${c.line}`,
      }}
    >
      {gate}
    </div>
  </Card>
);

const Roadmap: Page = () => (
  <div style={content}>
    <Heading eyebrow="B7 ・ 導入路線（提案假設）">導入一年，每過一關才進下一段</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 22, marginTop: 52, height: 520 }}>
      <Phase m="M1–M2" title="問題與規則" gate="關卡：範圍與責任人">
        盤點費用規範，建立規則集與判準基準
      </Phase>
      <Phase m="M3–M4" title="資料與原型" gate="關卡：資料與環境">
        單據擷取、去識別、權限與串接
      </Phase>
      <Phase m="M5–M7" title="限定試行" gate="關卡：誤判漏判紀錄">
        限定單位，Agent 與人工平行審查
      </Phase>
      <Phase m="M8–M9" title="驗收與修正" gate="關卡：修正或上線">
        依結果調整規則與防護機制
      </Phase>
      <Phase m="M10–M12" title="分批上線" gate="關卡：營運交接">
        分批部署，交接規則維護與監控
      </Phase>
    </div>
    <div style={{ marginTop: 'auto' }}>
      <Source>實際門檻與時程由客戶權責單位核定</Source>
    </div>
    <Footer />
  </div>
);

const Stake = ({ role, care, answer }: { role: string; care: string; answer: string }) => (
  <Card style={{ padding: '34px 40px' }}>
    <div style={{ fontSize: 34, fontWeight: 700 }}>{role}</div>
    <div style={{ fontSize: 28, color: c.muted, marginTop: 16 }}>在意：{care}</div>
    <div style={{ fontSize: 28, marginTop: 10 }}>
      <span style={{ color: 'var(--osd-accent)', fontWeight: 600 }}>CheckMate：</span>
      {answer}
    </div>
  </Card>
);

const Stakeholders: Page = () => (
  <div style={content}>
    <Heading eyebrow="B8 ・ 利害關係人">每個角色在意的事，都有對應</Heading>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 56 }}>
      <Stake role="財務初審人員（使用者）" care="這筆要不要我處理、依據在哪" answer="首屏先給建議與關鍵原因" />
      <Stake role="財務主管・CFO（決策者）" care="減少低價值人工、風險可控" answer="授權內才執行，逐步擴大" />
      <Stake role="IT・資訊安全" care="整合成本、權限與資料安全" answer="疊加既有系統，由檔案到 API" />
      <Stake role="內部稽核・風險管理" care="規則一致、決策可追溯" answer="每個判斷與覆寫都留紀錄" />
    </div>
    <Footer />
  </div>
);

const Ref = ({ title, url }: { title: string; url: string }) => (
  <div style={{ padding: '22px 0', borderBottom: `1px solid ${c.line}` }}>
    <div style={{ fontSize: 30, fontWeight: 600 }}>{title}</div>
    <div style={{ fontSize: 22, color: c.muted, marginTop: 6, fontFamily: mono }}>{url}</div>
  </div>
);

const Sources: Page = () => (
  <div style={content}>
    <Heading eyebrow="B9 ・ 資料來源">資料來源</Heading>
    <div style={{ marginTop: 40 }}>
      <Ref
        title="GBTA Foundation, Expense Reporting: Global Practices and Pain Points (2015)"
        url="gbta.org/new-study-reveals-pain-points-in-expense-reporting"
      />
      <Ref
        title="ACFE, Occupational Fraud 2024: A Report to the Nations（p.13 Fig.5、p.16 Fig.8）"
        url="acfe.com/-/media/files/acfe/pdfs/rttn/2024/2024-report-to-the-nations.pdf"
      />
    </div>
    <div style={{ marginTop: 40, fontSize: 26, color: c.muted }}>
      Demo 畫面、案件、規範與憑證皆為模擬資料。
    </div>
    <Footer />
  </div>
);

export const meta: SlideMeta = {
  title: 'CheckMate Demo Day Pitch',
  createdAt: '2026-09-28T22:01:25.168Z',
};

export default [
  Cover,
  Problem,
  Gap,
  Positioning,
  Film,
  Trust,
  Adoption,
  Closing,
  BackupDivider,
  CaseMap,
  RecAction,
  Controls,
  Evidence,
  Arch,
  Flywheel,
  Roadmap,
  Stakeholders,
  Sources,
] satisfies Page[];

export const notes: (string | undefined)[] = [
  `【約 10 秒】
大家好，我們是第五組。
CheckMate 是疊加在企業既有財務系統上的 AI 費用審查與控制層，目標只有一個：讓財務只處理真正需要人的案件。`,
  `【約 25 秒】
先看問題。GBTA 的研究顯示，大約每 5 份費用報告就有 1 份有錯誤或缺漏，每份補正還要多花 18 分鐘。
受訪企業平均一年光是補正，就花掉將近 3,000 小時。
因為不知道錯在哪一筆，所以每一筆都得有人看。`,
  `【約 25 秒】
現有做法有三種，但都不夠。
人工逐筆：慢，而且標準因人而異。
只靠規則：抓得到超額、缺件，但看不到情境、跨案件重複或拆單。
直接把 AI 丟進去：判斷難預測，也難追溯。
而這類風險是真的：ACFE 的研究指出，費用報支舞弊的中位數要 18 個月才被發現。`,
  `【約 30 秒】
CheckMate 不要求企業換系統，而是在既有 ERP、BPM 之上疊一層審查與控制。
它負責比對、規範檢核、找出規則外的風險訊號，給出三種建議：建議通過、建議補件、建議人工審核，並在授權範圍內完成後續處置，留下完整稽核紀錄。
第一階段只做初審，不做最終核准、入帳、付款或稅務申報。
（銜接）接下來 90 秒，看它實際審一批案件。`,
  `【影片 88 秒，不說話】
進入這頁會自動播放；若出現「點擊播放影片」，點一下畫面即可。點畫面可暫停／繼續。
影片結束後銜接：影片裡大家可能會想問：AI 錯了怎麼辦？`,
  `【約 35 秒】
AI 一定會錯，所以我們把錯分成兩種來設計。
第一種是漏判：有問題卻被放行，這最貴。所以能不能放行，看的是控制條件，不是模型多有信心。六個條件全部符合才推進，任何一項不符合，就轉補件或人工。
第二種是誤判：沒問題卻被攔下，代價只是多一次人工確認，而且可逆。財務可以直接覆寫，原始建議、原因、執行者、時間都保留，這些紀錄會回頭調整規範。
資料不足時，系統直接標示無法判斷，不硬猜。`,
  `【約 30 秒】
落地也照同一個邏輯。
第一步是影子審查：批次匯入案件，和人工平行審，Agent 不執行任何動作，只累積誤判和漏判的資料。
第二步限定授權：只開放低風險、可逆的動作，例如通知補件、轉交人工。
第三步依覆寫率與結果，逐步擴大可以自動推進的案件類型。
串接從檔案上傳開始，不需要先換掉 ERP。`,
  `【約 15 秒】
CheckMate 要做的，是讓財務從逐筆審查，轉成只處理真正需要人的例外。
謝謝，歡迎提問。`,
  `以下為 Q&A 備用頁，主線不播放。`,
  `被問「實際會遇到哪些案例」時使用。重點：EXP-015 是建議通過，但超出 Agent 授權，所以不自動執行、轉交人工。`,
  `被問「建議通過是不是就核准了」時使用。建議是判斷，動作是執行；Agent 與人工共用同一組動作，執行者記在稽核紀錄。`,
  `被問「怎麼避免 AI 亂來」時使用。六道控制完整版，底部是自動執行的六個條件。`,
  `被問「判斷依據在哪」時使用。以 EXP-2026-004 為例：發現、憑證、規範、結果一路可回查。`,
  `被問「系統怎麼組成、怎麼串」時使用。`,
  `被問「長期價值 / 護城河」時使用。每次人工決策與覆寫都成為調整規範與授權邊界的資料。`,
  `被問「導入要多久、怎麼推進」時使用。說明這是提案假設，每個關卡由客戶決定是否進下一段。`,
  `被問「誰會買、誰會擋」時使用。`,
  `被問數據出處時使用。`,
];
