import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-8">
          Your testimonial has been submitted successfully.<br />
          We really appreciate your feedback!
        </p>
        <Link href="/" className="text-indigo-600 hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
