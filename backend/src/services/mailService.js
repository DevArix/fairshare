import nodemailer from 'nodemailer'

export function mailReady() {
  if (process.env.NODE_ENV === 'test') return true
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM)
}

export async function sendResetEmail(email, token) {
  const appUrl = (process.env.APP_URL || 'http://127.0.0.1:4173').replace(/\/$/, '')
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`
  if (process.env.NODE_ENV === 'test') return resetUrl

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'بازیابی رمز عبور',
      text: `برای انتخاب رمز عبور جدید، این لینک را باز کنید:\n${resetUrl}\nاین لینک تا ۳۰ دقیقه معتبر است. اگر شما این درخواست را ثبت نکرده‌اید، این پیام را نادیده بگیرید.`,
      html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.8;color:#2f174f"><h2>بازیابی رمز عبور</h2><p>برای انتخاب رمز عبور جدید روی دکمه زیر بزنید.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#6d3fc0;color:#fff;text-decoration:none">تعیین رمز عبور جدید</a></p><p>این لینک تا ۳۰ دقیقه معتبر است. اگر شما این درخواست را ثبت نکرده‌اید، این پیام را نادیده بگیرید.</p></div>`
    })
    return resetUrl
  } catch {
    throw Object.assign(new Error('ارسال ایمیل انجام نشد؛ تنظیمات سرویس ایمیل را بررسی کنید'), { status: 502 })
  }
}
