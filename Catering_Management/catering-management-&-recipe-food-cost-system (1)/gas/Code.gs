/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT (GAS) - CATERING & RECIPE FOOD COST NOTIFICATION WEBHOOK
 * Deploy as: Web App (Execute as: Me, Who has access: Anyone)
 * ==============================================================================
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const type = data.type; // 'order_confirmation', 'payment_reminder', 'production_reminder', 'shipment_reminder'
    const recipient = data.recipient; // email tujuan
    const subject = data.subject || 'Notifikasi Sistem Catering Management';
    const payload = data.payload || {};

    let htmlBody = '';

    if (type === 'order_confirmation') {
      htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a;">Konfirmasi Pesanan Catering #${payload.order_number || ''}</h2>
          <p>Halo <strong>${payload.customer_name || 'Pelanggan'}</strong>,</p>
          <p>Terima kasih telah mempercayakan acara Anda kepada kami. Berikut adalah rincian pesanan Anda:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;">Tanggal Acara</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${payload.event_date || '-'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Jenis Acara</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${payload.event_type || '-'}</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;">Lokasi Acara</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${payload.event_location || '-'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Total Biaya</td><td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Rp ${Number(payload.total_amount || 0).toLocaleString('id-ID')}</strong></td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;">Down Payment (DP)</td><td style="padding: 8px; border: 1px solid #cbd5e1;">Rp ${Number(payload.down_payment || 0).toLocaleString('id-ID')}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Sisa Pembayaran</td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #dc2626;"><strong>Rp ${Number(payload.remaining_balance || 0).toLocaleString('id-ID')}</strong></td></tr>
          </table>
          <p style="font-size: 13px; color: #64748b;">Harap lakukan pelunasan sebelum hari H pelaksanaan acara.</p>
        </div>
      `;
    } else if (type === 'payment_reminder') {
      htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #b45309;">Pengingat Pembayaran Catering #${payload.order_number || ''}</h2>
          <p>Yth. <strong>${payload.customer_name || 'Pelanggan'}</strong>,</p>
          <p>Pengingat sisa tagihan pesanan katering Anda sebesar <strong>Rp ${Number(payload.remaining_balance || 0).toLocaleString('id-ID')}</strong> untuk acara pada tanggal <strong>${payload.event_date || '-'}</strong>.</p>
          <p>Silakan hubungi admin kami untuk instruksi pembayaran via Transfer Bank atau QRIS.</p>
        </div>
      `;
    } else if (type === 'shipment_reminder') {
      htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0284c7;">Status Pengiriman Pesanan #${payload.order_number || ''}</h2>
          <p>Halo <strong>${payload.customer_name || 'Pelanggan'}</strong>,</p>
          <p>Pesanan Anda saat ini berstatus: <strong>${payload.shipment_status || 'Dalam perjalanan'}</strong>.</p>
          <p>Kurir: <strong>${payload.courier_name || 'Kurir Catering'}</strong></p>
          <p>Tujuan: ${payload.destination_address || '-'}</p>
        </div>
      `;
    } else {
      htmlBody = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>${subject}</h2>
          <p>${payload.message || 'Notifikasi dari Sistem Catering Management.'}</p>
        </div>
      `;
    }

    if (recipient) {
      GmailApp.sendEmail(recipient, subject, '', {
        htmlBody: htmlBody
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Email successfully sent via Gmail App Script'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
