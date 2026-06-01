// Follow this setup guide to integrate the Resend API: https://supabase.com/docs/guides/functions/examples/send-emails
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const payload = await req.json()

    // We only care about deals that just got updated to 'completed'
    if (payload.type !== 'UPDATE' || payload.record.status !== 'completed' || payload.old_record.status === 'completed') {
      return new Response(JSON.stringify({ message: "Not a newly completed deal" }), { status: 200 })
    }

    const deal = payload.record
    if (!deal.vendor_email) {
      return new Response(JSON.stringify({ message: "No vendor email for this deal" }), { status: 200 })
    }

    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all members of this deal
    const { data: members, error: membersError } = await supabaseClient
      .from('group_members')
      .select('user_id')
      .eq('deal_id', deal.id)

    if (membersError) throw membersError
    if (!members || members.length === 0) {
      return new Response(JSON.stringify({ message: "No members found" }), { status: 200 })
    }

    const userIds = members.map(m => m.user_id)

    // Fetch user profiles to get shipping details
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('full_name, email, address_line, city, state, zip_code, country')
      .in('id', userIds)

    if (profilesError) throw profilesError

    // Generate CSV
    const csvHeaders = ['Full Name', 'Email', 'Address', 'City', 'State', 'Zip', 'Country']
    const csvRows = profiles.map(p => [
      p.full_name,
      p.email,
      p.address_line,
      p.city,
      p.state,
      p.zip_code,
      p.country
    ].map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',')) // escape quotes

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')
    const csvBase64 = btoa(unescape(encodeURIComponent(csvContent))) // Base64 encode for email attachment

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Dealmate Orders <orders@yourdomain.com>', // Replace with your verified domain in Resend
        to: deal.vendor_email,
        subject: `Dealmate: New Orders for ${deal.title}`,
        html: `<p>Hello!</p><p>Congratulations, your deal on Dealmate for <strong>${deal.title}</strong> has successfully been completed!</p><p>Attached is the CSV file containing the shipping details of all ${profiles.length} customers who participated.</p>`,
        attachments: [
          {
            filename: `dealmate-orders-${deal.id}.csv`,
            content: csvBase64
          }
        ]
      })
    })

    const data = await res.json()

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
