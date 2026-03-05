/**
 * Branded HTML email templates for Jobless Artist
 * Colors: #C75B39 accent, #FAF7F2 background, Playfair Display headings
 */

const ACCENT = '#C75B39';
const BG = '#FAF7F2';
const TEXT = '#1A1A1A';
const MUTED = '#6B6B6B';

function layout(title, bodyHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:${BG}; font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG}; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#FFFFFF; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color:${ACCENT}; padding:24px 32px; text-align:center;">
              <h1 style="margin:0; color:#FFFFFF; font-size:24px; font-weight:700; letter-spacing:0.5px;">
                Jobless Artist
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; background-color:#F5F0EB; border-top:1px solid #E8E0D8; text-align:center;">
              <p style="margin:0; font-size:12px; color:${MUTED};">
                &copy; ${new Date().getFullYear()} Jobless Artist. All rights reserved.
              </p>
              <p style="margin:4px 0 0; font-size:11px; color:${MUTED};">
                Handcrafted art that tells a story.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function heading(text) {
  return `<h2 style="margin:0 0 16px; color:${TEXT}; font-size:20px; font-weight:700;">${text}</h2>`;
}

function paragraph(text) {
  return `<p style="margin:0 0 12px; color:${TEXT}; font-size:14px; line-height:1.6;">${text}</p>`;
}

function mutedText(text) {
  return `<p style="margin:0 0 12px; color:${MUTED}; font-size:13px; line-height:1.5;">${text}</p>`;
}

function button(text, url) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="background-color:${ACCENT}; border-radius:8px; padding:12px 28px;">
          <a href="${url}" style="color:#FFFFFF; text-decoration:none; font-size:14px; font-weight:600; display:inline-block;">${text}</a>
        </td>
      </tr>
    </table>`;
}

function divider() {
  return '<hr style="border:none; border-top:1px solid #E8E0D8; margin:20px 0;" />';
}

function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

// ============== TEMPLATES ==============

function orderPlaced({ userName, orderId, items, totalAmount, shippingAddress, clientUrl }) {
  const itemRows = items.map((item) =>
    `<tr>
      <td style="padding:8px 0; font-size:13px; color:${TEXT}; border-bottom:1px solid #F0EBE6;">${item.title || 'Art piece'}</td>
      <td style="padding:8px 0; font-size:13px; color:${MUTED}; text-align:center; border-bottom:1px solid #F0EBE6;">${item.quantity}</td>
      <td style="padding:8px 0; font-size:13px; color:${TEXT}; text-align:right; border-bottom:1px solid #F0EBE6;">${formatPrice(item.price * item.quantity)}</td>
    </tr>`
  ).join('');

  return {
    subject: `Order Confirmed - #${orderId.slice(-8).toUpperCase()}`,
    html: layout('Order Confirmed', `
      ${heading('Thank you for your order!')}
      ${paragraph(`Hello ${userName},`)}
      ${paragraph('Your order has been placed successfully. Here are the details:')}
      ${divider()}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr style="background-color:#F5F0EB;">
          <td style="padding:8px; font-size:12px; font-weight:600; color:${MUTED};">ITEM</td>
          <td style="padding:8px; font-size:12px; font-weight:600; color:${MUTED}; text-align:center;">QTY</td>
          <td style="padding:8px; font-size:12px; font-weight:600; color:${MUTED}; text-align:right;">AMOUNT</td>
        </tr>
        ${itemRows}
      </table>
      <p style="margin:0 0 16px; text-align:right; font-size:16px; font-weight:700; color:${ACCENT};">
        Total: ${formatPrice(totalAmount)}
      </p>
      ${shippingAddress ? mutedText(`Shipping to: ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`) : ''}
      ${button('View Order', `${clientUrl}/orders/${orderId}`)}
    `),
  };
}

function paymentConfirmed({ userName, orderId, totalAmount, clientUrl }) {
  return {
    subject: `Payment Confirmed - #${orderId.slice(-8).toUpperCase()}`,
    html: layout('Payment Confirmed', `
      ${heading('Payment Received!')}
      ${paragraph(`Hello ${userName},`)}
      ${paragraph(`We've received your payment of <strong>${formatPrice(totalAmount)}</strong> for order #${orderId.slice(-8).toUpperCase()}.`)}
      ${paragraph('Your order is now being prepared. We\'ll notify you when it ships.')}
      ${button('View Order', `${clientUrl}/orders/${orderId}`)}
    `),
  };
}

function orderShipped({ userName, orderId, trackingId, clientUrl }) {
  return {
    subject: `Order Shipped - #${orderId.slice(-8).toUpperCase()}`,
    html: layout('Order Shipped', `
      ${heading('Your order is on its way!')}
      ${paragraph(`Hello ${userName},`)}
      ${paragraph(`Your order #${orderId.slice(-8).toUpperCase()} has been shipped.`)}
      ${trackingId ? paragraph(`<strong>Tracking ID:</strong> ${trackingId}`) : ''}
      ${button('View Order', `${clientUrl}/orders/${orderId}`)}
    `),
  };
}

function orderDelivered({ userName, orderId, clientUrl }) {
  return {
    subject: `Order Delivered - #${orderId.slice(-8).toUpperCase()}`,
    html: layout('Order Delivered', `
      ${heading('Your order has been delivered!')}
      ${paragraph(`Hello ${userName},`)}
      ${paragraph(`Your order #${orderId.slice(-8).toUpperCase()} has been delivered. We hope you love your new art!`)}
      ${paragraph('If you have any questions, feel free to reach out.')}
      ${button('View Order', `${clientUrl}/orders/${orderId}`)}
    `),
  };
}

function customOrderQuote({ userName, orderId, price, message, clientUrl }) {
  return {
    subject: `Quote Received for Custom Order #${orderId.slice(-8).toUpperCase()}`,
    html: layout('Custom Order Quote', `
      ${heading('You have a new quote!')}
      ${paragraph(`Hello ${userName},`)}
      ${paragraph(`The artist has quoted <strong>${formatPrice(price)}</strong> for your custom order #${orderId.slice(-8).toUpperCase()}.`)}
      ${message ? mutedText(`Artist's note: "${message}"`) : ''}
      ${paragraph('You can accept, counter, or reject this quote from your profile.')}
      ${button('View Quote', `${clientUrl}/profile`)}
    `),
  };
}

function customOrderNegotiationUpdate({ userName, orderId, action, price, message, clientUrl }) {
  const actionText = {
    counter: 'sent a counter-offer',
    accept: 'accepted the price',
    reject: 'rejected the quote',
  };
  return {
    subject: `Custom Order Update - #${orderId.slice(-8).toUpperCase()}`,
    html: layout('Custom Order Update', `
      ${heading('Negotiation Update')}
      ${paragraph(`Hello ${userName},`)}
      ${paragraph(`There's an update on your custom order #${orderId.slice(-8).toUpperCase()}: ${actionText[action] || action}.`)}
      ${price ? paragraph(`Price: <strong>${formatPrice(price)}</strong>`) : ''}
      ${message ? mutedText(`Message: "${message}"`) : ''}
      ${button('View Details', `${clientUrl}/profile`)}
    `),
  };
}

function adminNewOrder({ orderId, userName, userEmail, totalAmount, itemCount, clientUrl }) {
  return {
    subject: `New Order Received - #${orderId.slice(-8).toUpperCase()}`,
    html: layout('New Order', `
      ${heading('New Order Received!')}
      ${paragraph(`A new order has been placed:`)}
      ${paragraph(`<strong>Order:</strong> #${orderId.slice(-8).toUpperCase()}`)}
      ${paragraph(`<strong>Customer:</strong> ${userName} (${userEmail})`)}
      ${paragraph(`<strong>Items:</strong> ${itemCount}`)}
      ${paragraph(`<strong>Total:</strong> ${formatPrice(totalAmount)}`)}
      ${button('View in Admin', `${clientUrl}/control-panel/orders`)}
    `),
  };
}

function adminNewCustomOrder({ orderId, userName, userEmail, orderType, clientUrl }) {
  return {
    subject: `New Custom Order Request - #${orderId.slice(-8).toUpperCase()}`,
    html: layout('New Custom Order', `
      ${heading('New Custom Order Request!')}
      ${paragraph(`A new custom order request has been submitted:`)}
      ${paragraph(`<strong>Order:</strong> #${orderId.slice(-8).toUpperCase()}`)}
      ${paragraph(`<strong>Customer:</strong> ${userName} (${userEmail})`)}
      ${paragraph(`<strong>Type:</strong> ${orderType}`)}
      ${button('View in Admin', `${clientUrl}/control-panel/custom-orders`)}
    `),
  };
}

module.exports = {
  orderPlaced,
  paymentConfirmed,
  orderShipped,
  orderDelivered,
  customOrderQuote,
  customOrderNegotiationUpdate,
  adminNewOrder,
  adminNewCustomOrder,
};
