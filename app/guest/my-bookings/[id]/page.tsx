'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GuestNavbar from '@/app/components/GuestNavbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Calendar, MapPin, Users, CreditCard, CheckCircle, Clock, XCircle, 
  AlertCircle, LogIn, LogOut, ArrowLeft, Loader2, Home, Phone, Mail
} from 'lucide-react'

interface Booking {
  id: number
  booking_reference: string
  room_number: string
  room_type: string
  check_in_date: string
  check_out_date: string
  number_of_guests: number
  status: string
  total_amount: number
  paid_amount: number
  outstanding_amount: number
  branch_name: string
  branch_location: string
  checked_in_at: string | null
  checked_out_at: string | null
  special_requests: string | null
  created_at: string
}

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CreditCard')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bookings/${bookingId}`)
      const data = await response.json()
      
      if (data.success) {
        setBooking(data.booking)
      } else {
        setMessage({ type: 'error', text: 'Booking not found' })
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      setMessage({ type: 'error', text: 'Failed to load booking details' })
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!booking || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid payment amount' })
      return
    }

    try {
      setProcessing(true)
      console.log('[PAYMENT] Sending payment request:', {
        booking_id: booking.id,
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod
      })

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod
        })
      })
      
      const data = await response.json()
      console.log('[PAYMENT] Response:', data)

      if (data.success) {
        setMessage({ type: 'success', text: 'Payment processed successfully!' })
        setShowPaymentDialog(false)
        setPaymentAmount('')
        setTimeout(() => fetchBooking(), 500)
      } else {
        setMessage({ type: 'error', text: data.error || 'Payment failed' })
      }
    } catch (err) {
      console.error('[PAYMENT] Error:', err)
      setMessage({ type: 'error', text: 'Payment processing failed' })
    } finally {
      setProcessing(false)
    }
  }

  const handleCheckIn = async () => {
    if (!booking) return

    if (booking.outstanding_amount > 0) {
      setMessage({ type: 'error', text: 'Please complete payment before checking in' })
      setPaymentAmount(booking.outstanding_amount.toString())
      setShowPaymentDialog(true)
      return
    }

    try {
      setProcessing(true)
      const response = await fetch(`/api/bookings/${booking.id}/checkin`, {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Checked in successfully!' })
        fetchBooking()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to check in' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to check in' })
    } finally {
      setProcessing(false)
    }
  }

  const handleCheckOut = async () => {
    if (!booking) return

    if (booking.outstanding_amount > 0) {
      setMessage({ type: 'error', text: 'Please clear outstanding balance before checking out' })
      setPaymentAmount(booking.outstanding_amount.toString())
      setShowPaymentDialog(true)
      return
    }

    try {
      setProcessing(true)
      const response = await fetch(`/api/bookings/${booking.id}/checkout`, {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Checked out successfully!' })
        fetchBooking()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to check out' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to check out' })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = () => {
    if (!booking) return null

    if (booking.status === 'Cancelled') {
      return <span className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-bold flex items-center gap-2"><XCircle className="w-4 h-4" />Cancelled</span>
    }
    if (booking.status === 'CheckedOut') {
      return <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" />Completed</span>
    }
    if (booking.status === 'CheckedIn') {
      return <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2"><Clock className="w-4 h-4" />Active</span>
    }
    if (booking.status === 'Confirmed') {
      return <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" />Confirmed</span>
    }
    return <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-sm font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" />Pending</span>
  }

  const canCheckIn = () => {
    if (!booking) return false
    const today = new Date()
    const checkIn = new Date(booking.check_in_date)
    return booking.status === 'Confirmed' && checkIn <= today && booking.outstanding_amount === 0
  }

  const canCheckOut = () => {
    if (!booking) return false
    return booking.status === 'CheckedIn' && booking.outstanding_amount === 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-100/30">
        <GuestNavbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-100/30">
        <GuestNavbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-white/90 backdrop-blur-lg shadow-xl border border-gray-200/50 rounded-2xl">
            <CardContent className="p-16 text-center">
              <AlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-6">Booking not found</p>
              <Button 
                onClick={() => router.push('/guest/my-bookings')}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-6 text-lg rounded-xl shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to My Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const nights = Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-100/30">
      <GuestNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl shadow-md backdrop-blur-sm ${
            message.type === 'success' 
              ? 'bg-green-50/80 text-green-800 border border-green-200' 
              : 'bg-red-50/80 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Back Button */}
        <Button
          onClick={() => router.push('/guest/my-bookings')}
          variant="outline"
          className="mb-6 border-2 border-gray-300 hover:border-amber-500 hover:bg-amber-50 font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Bookings
        </Button>

        {/* Status Banner */}
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-black rounded-2xl shadow-xl mb-8 border-0">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">Booking Details</h1>
                </div>
                <p className="text-black/80 font-mono text-lg">{booking.booking_reference}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Details */}
            <Card className="bg-white/90 backdrop-blur-lg shadow-lg border border-gray-200/50 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Home className="w-6 h-6 text-amber-600" />
                  Room Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6 p-5 bg-amber-50/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                      <Home className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Room Type</p>
                      <p className="text-lg font-bold text-gray-900">{booking.room_type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                      <Home className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Room Number</p>
                      <p className="text-lg font-bold text-gray-900">{booking.room_number}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                      <MapPin className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Branch</p>
                      <p className="text-lg font-bold text-gray-900">{booking.branch_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                      <Users className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Guests</p>
                      <p className="text-lg font-bold text-gray-900">{booking.number_of_guests} Guest{booking.number_of_guests > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-sm text-gray-600">{booking.branch_location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card className="bg-white/90 backdrop-blur-lg shadow-lg border border-gray-200/50 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-amber-600" />
                  Stay Details
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-5 bg-green-50/50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <LogIn className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-bold uppercase">Check-in</p>
                        <p className="text-xl font-bold text-gray-900">
                          {new Date(booking.check_in_date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {booking.checked_in_at && (
                      <p className="text-sm text-green-700 font-medium mt-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Checked in: {new Date(booking.checked_in_at).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>

                  <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <LogOut className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-bold uppercase">Check-out</p>
                        <p className="text-xl font-bold text-gray-900">
                          {new Date(booking.check_out_date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {booking.checked_out_at && (
                      <p className="text-sm text-blue-700 font-medium mt-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Checked out: {new Date(booking.checked_out_at).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Total Duration</span>
                    <span className="text-lg font-bold text-amber-600">{nights} Night{nights > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {booking.special_requests && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-bold text-gray-700 mb-2">Special Requests</p>
                    <p className="text-sm text-gray-600">{booking.special_requests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="bg-white/90 backdrop-blur-lg shadow-lg border border-gray-200/50 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Actions</h2>
                <div className="flex gap-3 flex-wrap">
                  {booking.outstanding_amount > 0 && (
                    <Button
                      onClick={() => {
                        setPaymentAmount(booking.outstanding_amount.toString())
                        setShowPaymentDialog(true)
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay Now
                    </Button>
                  )}
                  {canCheckIn() && (
                    <Button
                      onClick={handleCheckIn}
                      disabled={processing}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      Check In
                    </Button>
                  )}
                  {canCheckOut() && (
                    <Button
                      onClick={handleCheckOut}
                      disabled={processing}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Check Out
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card className="bg-white/90 backdrop-blur-lg shadow-lg border border-gray-200/50 rounded-2xl overflow-hidden sticky top-4">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                  Payment Summary
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${Number(booking.total_amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Paid Amount
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      ${Number(booking.paid_amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border-2 border-amber-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-bold">Outstanding</span>
                      <span className="text-2xl font-bold text-amber-600">
                        ${Number(booking.outstanding_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {booking.outstanding_amount === 0 && booking.paid_amount > 0 && (
                    <div className="p-4 bg-green-50/80 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 text-green-700 font-bold">
                        <CheckCircle className="w-5 h-5" />
                        Fully Paid
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Info */}
            <Card className="bg-white/90 backdrop-blur-lg shadow-lg border border-gray-200/50 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Booking Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(booking.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Reference Number</p>
                    <p className="text-sm font-mono font-bold text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
                      {booking.booking_reference}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Status</p>
                    {getStatusBadge()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-white">
          <DialogHeader className="border-b border-amber-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-amber-600" />
              Make Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {booking && (
              <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200 shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 font-medium">Booking Reference</p>
                    <p className="text-sm font-mono font-bold text-gray-900">{booking.booking_reference}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 font-medium">Total Amount</p>
                    <p className="text-sm font-bold text-gray-900">${Number(booking.total_amount).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 font-medium">Amount Paid</p>
                    <p className="text-sm font-bold text-green-600">${Number(booking.paid_amount).toFixed(2)}</p>
                  </div>
                  <div className="pt-2 border-t border-amber-300">
                    <div className="flex justify-between items-center">
                      <p className="text-base text-gray-900 font-bold">Outstanding Balance</p>
                      <p className="text-xl font-bold text-red-600">${Number(booking.outstanding_amount).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                Payment Amount
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-base font-semibold"
                placeholder="Enter amount"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-base font-semibold bg-white"
              >
                <option value="CreditCard">Credit Card</option>
                <option value="DebitCard">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="BankTransfer">Bank Transfer</option>
              </select>
            </div>

            <div className="p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 font-medium">
                  This is a demo payment system. No actual charges will be made to your account.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Process Payment
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowPaymentDialog(false)}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 font-bold py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
