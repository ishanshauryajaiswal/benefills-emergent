import os
import resend
import logging
import asyncio

logger = logging.getLogger(__name__)

# Initialize the Resend API client with the API key from environment variables
resend.api_key = os.getenv("RESEND_API_KEY")

def _send_order_confirmation_sync(customer_email: str, order_details: dict):
    """
    Synchronous function to send the order confirmation email via Resend.
    """
    if not resend.api_key:
        logger.warning("RESEND_API_KEY is not set. Email not sent.")
        return

    order_id = order_details.get("id", "Unknown")
    total = order_details.get("total", 0)
    
    # Generate HTML for items
    items_html = ""
    for item in order_details.get("items", []):
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{item.get('name')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{item.get('quantity')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹{item.get('price')}</td>
        </tr>
        """

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Order Confirmed!</h2>
        <p>Thank you for your purchase from Benefills. Your order <strong>#{order_id}</strong> is currently being processed.</p>
        
        <h3>Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
                <tr style="background-color: #f9fafb;">
                    <th style="padding: 10px;">Item</th>
                    <th style="padding: 10px;">Qty</th>
                    <th style="padding: 10px;">Price</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
            <strong>Total Paid: ₹{total}</strong>
        </div>
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you have any questions, feel free to reply to this email.
        </p>
    </div>
    """

    params = {
        "from": "Benefills <orders@benefills.com>",
        "to": [customer_email],
        "subject": f"Benefills Order Confirmation #{order_id}",
        "html": html_content,
    }

    try:
        response = resend.Emails.send(params)
        logger.info(f"Order confirmation email sent successfully: {response}")
    except Exception as e:
        logger.error(f"Failed to send order confirmation email: {str(e)}")


async def send_order_confirmation(customer_email: str, order_details: dict):
    """
    Asynchronous wrapper to send order confirmation without blocking the main thread.
    """
    loop = asyncio.get_event_loop()
    # Run the synchronous resend API call in a thread pool
    await loop.run_in_executor(None, _send_order_confirmation_sync, customer_email, order_details)
