import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const widgetScript = `
(function() {
  const WIDGET_SLUG = '${slug}';
  const API_URL = '${baseUrl}/api/widget/' + WIDGET_SLUG;

  async function loadTestimonials() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      renderWidget(data);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    }
  }

  function renderWidget(data) {
    const container = document.getElementById('testimonial-widget');
    if (!container) return;

    const styles = \`
      .tw-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .tw-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
      .tw-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; }
      .tw-content { color: #374151; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem; }
      .tw-author { display: flex; align-items: center; gap: 0.75rem; }
      .tw-avatar { width: 40px; height: 40px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; }
      .tw-name { font-weight: 600; color: #111827; }
      .tw-role { font-size: 0.85rem; color: #6b7280; }
      .tw-stars { color: #fbbf24; margin-bottom: 0.5rem; }
    \`;

    let html = '<style>' + styles + '</style>';
    html += '<div class="tw-container"><div class="tw-grid">';

    data.testimonials.forEach(function(t) {
      const initials = t.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase();
      const stars = '★'.repeat(t.rating || 5) + '☆'.repeat(5 - (t.rating || 5));
      const role = [t.role, t.company].filter(Boolean).join(' at ');

      html += '<div class="tw-card">';
      html += '<div class="tw-stars">' + stars + '</div>';
      html += '<p class="tw-content">"' + t.content + '"</p>';
      html += '<div class="tw-author">';
      html += '<div class="tw-avatar">' + initials + '</div>';
      html += '<div>';
      html += '<div class="tw-name">' + t.name + '</div>';
      if (role) html += '<div class="tw-role">' + role + '</div>';
      html += '</div></div></div>';
    });

    html += '</div></div>';
    container.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTestimonials);
  } else {
    loadTestimonials();
  }
})();
`

  return new NextResponse(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
