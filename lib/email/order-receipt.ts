type OrderItem = {
  product_name: string
  size: string
  kit_type?: string
  quantity: number
  price: number
}

type OrderDetails = {
  id: string
  full_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  subtotal: number
  shipping_fee: number
  total: number
  created_at: string
  items: OrderItem[]
}

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`
}

export function customerReceiptHTML(order: OrderDetails) {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
          <p style="margin: 0; font-weight: 600; font-size: 14px; color: #111;">${item.product_name}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #888;">Size: ${item.size}${item.kit_type ? ` · ${item.kit_type}` : ''} · Qty: ${item.quantity}</p>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; color: #111;">
          ${formatNaira(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join('')

  return `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #111;">
    <div style="background: #000; padding: 24px; text-align: center;">
      <h1 style="color: #fff; font-size: 18px; letter-spacing: 2px; margin: 0; text-transform: uppercase;">Mekus Standard</h1>
    </div>

    <div style="padding: 32px 24px;">
      <h2 style="font-size: 22px; margin: 0 0 8px;">Order Confirmed 🎉</h2>
      <p style="font-size: 14px; color: #555; margin: 0 0 24px;">
        Hi ${order.full_name}, thank you for your order. Here's your receipt.
      </p>

      <p style="font-size: 12px; color: #888; margin: 0 0 24px; text-transform: uppercase; letter-spacing: 1px;">
        Order #${order.id.slice(0, 8).toUpperCase()} · ${new Date(order.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <table style="width: 100%; border-collapse: collapse;">
        ${itemsRows}
      </table>

      <table style="width: 100%; margin-top: 16px;">
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #555;">Subtotal</td>
          <td style="padding: 4px 0; font-size: 14px; text-align: right;">${formatNaira(order.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #555;">Shipping</td>
          <td style="padding: 4px 0; font-size: 14px; text-align: right;">${order.shipping_fee === 0 ? 'Free' : formatNaira(order.shipping_fee)}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; border-top: 1px solid #eee;">Total</td>
          <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; text-align: right; border-top: 1px solid #eee;">${formatNaira(order.total)}</td>
        </tr>
      </table>

      <div style="margin-top: 32px; padding: 16px; background: #f9f9f9; border-radius: 6px;">
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin: 0 0 8px;">Delivery Address</p>
        <p style="font-size: 14px; margin: 0; color: #111;">${order.full_name}</p>
        <p style="font-size: 14px; margin: 0; color: #111;">${order.address}</p>
        <p style="font-size: 14px; margin: 0; color: #111;">${order.city}, ${order.state}</p>
        <p style="font-size: 14px; margin: 0; color: #111;">${order.phone}</p>
      </div>

      <p style="font-size: 12px; color: #aaa; margin-top: 32px; text-align: center;">
        Questions about your order? Reply to this email or contact our support team.
      </p>
    </div>
  </div>
  `
}

export function adminNotificationHTML(order: OrderDetails) {
  const itemsList = order.items
    .map(
      (item) =>
        `<li style="font-size: 14px; margin-bottom: 4px;">${item.product_name} (${item.size}${item.kit_type ? `, ${item.kit_type}` : ''}) × ${item.quantity} — ${formatNaira(item.price * item.quantity)}</li>`
    )
    .join('')

  return `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #111;">
    <div style="background: #1E40AF; padding: 20px; text-align: center;">
      <h1 style="color: #fff; font-size: 16px; letter-spacing: 1px; margin: 0;">🛍️ New Order Received</h1>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 14px;"><strong>Order ID:</strong> ${order.id.slice(0, 8).toUpperCase()}</p>
      <p style="font-size: 14px;"><strong>Customer:</strong> ${order.full_name} (${order.email})</p>
      <p style="font-size: 14px;"><strong>Phone:</strong> ${order.phone}</p>
      <p style="font-size: 14px;"><strong>Address:</strong> ${order.address}, ${order.city}, ${order.state}</p>

      <h3 style="font-size: 14px; margin-top: 20px;">Items:</h3>
      <ul style="padding-left: 18px;">${itemsList}</ul>

      <p style="font-size: 16px; font-weight: 700; margin-top: 20px;">Total: ${formatNaira(order.total)}</p>

      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders" style="display: inline-block; margin-top: 16px; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
        View in Admin Panel
      </a>
    </div>
  </div>
  `
}