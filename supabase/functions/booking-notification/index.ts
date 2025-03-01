
// Follow this setup guide to integrate the Deno runtime and Node.js Fetch API
// in your Supabase Edge Function: https://deno.land/manual/examples/deploy_edge

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  type: 'confirmation' | 'cancellation';
  email: string;
  booking: {
    id: string;
    date: string;
    startTime: string;
    turfName: string;
    price: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, booking } = await req.json() as EmailRequest;

    // Format booking date
    const formattedDate = new Date(booking.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Format price in Indian Rupees
    const formattedPrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(booking.price);

    // Email subject and body based on notification type
    let subject: string;
    let body: string;

    if (type === 'confirmation') {
      subject = `Booking Confirmed: ${booking.turfName}`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4CAF50; text-align: center;">Booking Confirmed!</h2>
          <p>Dear Customer,</p>
          <p>Your booking has been confirmed. Here are the details:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Booking ID:</strong> ${booking.id}</p>
            <p><strong>Turf:</strong> ${booking.turfName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${booking.startTime}</p>
            <p><strong>Amount Paid:</strong> ${formattedPrice}</p>
          </div>
          
          <p>Please arrive 15 minutes before your scheduled time.</p>
          <p>If you need to cancel, please do so at least 7 hours in advance through your account.</p>
          
          <p style="text-align: center; margin-top: 30px; color: #666;">Thank you for choosing our service!</p>
        </div>
      `;
    } else {
      subject = `Booking Cancelled: ${booking.turfName}`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #F44336; text-align: center;">Booking Cancelled</h2>
          <p>Dear Customer,</p>
          <p>Your booking has been cancelled as requested. Here are the details of the cancelled booking:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Booking ID:</strong> ${booking.id}</p>
            <p><strong>Turf:</strong> ${booking.turfName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${booking.startTime}</p>
            <p><strong>Amount:</strong> ${formattedPrice}</p>
          </div>
          
          <p>If you didn't request this cancellation, please contact us immediately.</p>
          
          <p style="text-align: center; margin-top: 30px; color: #666;">We hope to see you again soon!</p>
        </div>
      `;
    }

    // In a real production app, you'd integrate with an email service like Resend, SendGrid, etc.
    // For now, we'll just log the email content
    console.log(`Email would be sent to: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    // To actually send emails, you would add your email service integration here
    // For example with Resend:
    // 
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // await resend.emails.send({
    //   from: 'noreply@yourdomain.com',
    //   to: [email],
    //   subject: subject,
    //   html: body,
    // });

    return new Response(
      JSON.stringify({ success: true, message: "Notification processed" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error processing notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
};

Deno.serve(handler);
