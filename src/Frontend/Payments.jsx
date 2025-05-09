import React, { useState } from "react";
// import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../Frontend/Payments.css";

const PaymentsPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  return (
    <div className="payments-page dark">
      {/* <Navbar /> */}
      
      <div className="payments-container">
        <h1 className="page-title">Payment</h1>
        
        <div className="payment-content">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-item">
              <span>Charging Station:</span>
              <span>Green Energy Station</span>
            </div>
            <div className="summary-item">
              <span>Duration:</span>
              <span>30 minutes</span>
            </div>
            <div className="summary-item">
              <span>Energy Consumed:</span>
              <span>15 kWh</span>
            </div>
            <div className="summary-item total">
              <span>Total Amount:</span>
              <span>Rs. 18,000</span>
            </div>
          </div>
          
          <div className="payment-methods">
            <h2>Payment Method</h2>
            <div className="method-options">
              <button
                className={`method-btn ${paymentMethod === "creditCard" ? "active" : ""}`}
                onClick={() => setPaymentMethod("creditCard")}
              >
                Credit/Debit Card
              </button>
              <button
                className={`method-btn ${paymentMethod === "paypal" ? "active" : ""}`}
                onClick={() => setPaymentMethod("paypal")}
              >
                PayPal
              </button>
              <button
                className={`method-btn ${paymentMethod === "bankTransfer" ? "active" : ""}`}
                onClick={() => setPaymentMethod("bankTransfer")}
              >
                Bank Transfer
              </button>
            </div>
            
            {paymentMethod === "creditCard" && (
              <form className="card-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    value={cardDetails.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="pay-btn" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Pay Rs. 18,000"}
                </button>
              </form>
            )}
            
            {paymentMethod === "paypal" && (
              <div className="alternative-method">
                <p>You will be redirected to PayPal to complete your payment.</p>
                <button className="pay-btn">Proceed to PayPal</button>
              </div>
            )}
            
            {paymentMethod === "bankTransfer" && (
              <div className="alternative-method">
                <p>Bank transfer details will be provided after order confirmation.</p>
                <button className="pay-btn">Request Bank Details</button>
              </div>
            )}
            
            {paymentSuccess && (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Payment Successful!</h3>
                <p>Your transaction has been completed successfully.</p>
                <button 
                  className="continue-btn"
                  onClick={() => setPaymentSuccess(false)}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentsPage;