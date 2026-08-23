import { ArrowUpRight, Check } from 'lucide-react'

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="auth-page">
      <section className="auth-story">        <div className="auth-brand"><span className="logo-mark light"><img src="/logo.png?v=20260820" alt="" /></span><span>فیرشِر</span></div>
        <div className="story-copy">
          <p className="eyebrow light">دنگ‌ها، ساده و شفاف</p>
          <h1>با هم خرج کنید.<br /><em>رفیق بمانید.</em></h1>
          <p>یک جای ساده برای هزینه‌های گروهی، حساب‌های روشن و پرداخت‌هایی که همه متوجه‌شان می‌شوند.</p>
        </div>
        <div className="story-card">
          <div className="story-card-head"><span>آخر هفته شمال</span><span className="status-pill"><Check size={12} /> به‌روز</span></div>
          <div className="mini-balance"><div><small>مانده شما</small><strong>۱۴۸٬۲۰۰ تومان</strong></div><span><ArrowUpRight size={20} /></span></div>
          <div className="mini-people"><span>م</span><span>س</span><span>ع</span><p>۳ دوست این هفته تسویه کردند</p></div>
        </div>
        <p className="story-footer">تقسیم منصفانه؛ گفت‌وگوهای ناخوشایند کمتر.</p>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  )
}
