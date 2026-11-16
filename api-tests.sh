#!/usr/bin/env bash
# =============================================
# API Test Examples — cURL Commands
# Base URL: http://localhost:8080
# =============================================
# NOTE: Run seed data first, or create users/items via the API.

BASE="http://localhost:8080/api"
AUTH="-u admin:admin123"

echo "=========================================="
echo "0. VERIFY BASIC AUTH (/api/auth/me)"
echo "=========================================="

curl -s $AUTH "$BASE/auth/me" | jq .

echo ""
echo "=========================================="
echo "1. CREATE USERS (if not seeded)"
echo "=========================================="

curl -s $AUTH -X POST "$BASE/users" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123", "role": "ADMIN"}' | jq .

curl -s $AUTH -X POST "$BASE/users" \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "password": "user123", "role": "USER"}' | jq .

curl -s $AUTH -X POST "$BASE/users" \
  -H "Content-Type: application/json" \
  -d '{"username": "user2", "password": "user123", "role": "USER"}' | jq .

curl -s $AUTH -X POST "$BASE/users" \
  -H "Content-Type: application/json" \
  -d '{"username": "user3", "password": "user123", "role": "USER"}' | jq .

echo ""
echo "=========================================="
echo "2. CREATE ITEMS (if not seeded)"
echo "=========================================="

curl -s $AUTH -X POST "$BASE/items" \
  -H "Content-Type: application/json" \
  -d '{"name": "Rice", "unit": "KG"}' | jq .

curl -s $AUTH -X POST "$BASE/items" \
  -H "Content-Type: application/json" \
  -d '{"name": "Wheat", "unit": "KG"}' | jq .

curl -s $AUTH -X POST "$BASE/items" \
  -H "Content-Type: application/json" \
  -d '{"name": "Paddy", "unit": "KG"}' | jq .

curl -s $AUTH -X POST "$BASE/items" \
  -H "Content-Type: application/json" \
  -d '{"name": "Dal", "unit": "KG"}' | jq .

curl -s $AUTH -X POST "$BASE/items" \
  -H "Content-Type: application/json" \
  -d '{"name": "Chana", "unit": "KG"}' | jq .

echo ""
echo "=========================================="
echo "3. RECORD A FUND (Capital Injection — ₹5,00,000)"
echo "=========================================="

curl -s $AUTH -X POST "$BASE/transactions/fund" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "amount": 500000.00,
    "description": "Initial capital injection"
  }' | jq .

echo ""
echo "=========================================="
echo "4. RECORD A DEBIT (Buy 500kg Rice @ ₹35/kg, 5kg bag cut)"
echo "=========================================="

curl -s $AUTH -X POST "$BASE/transactions/debit" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "userId": 2,
    "grossQty": 500.00,
    "tareWeight": 5.00,
    "ratePerUnit": 35.00,
    "description": "Purchased rice from Rajkot mandi"
  }' | jq .

echo ""
echo "=========================================="
echo "5. RECORD A DEBIT (Buy 300kg Wheat @ ₹28/kg, 3kg bag cut)"
echo "=========================================="

curl -s $AUTH -X POST "$BASE/transactions/debit" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 2,
    "userId": 2,
    "grossQty": 300.00,
    "tareWeight": 3.00,
    "ratePerUnit": 28.00,
    "description": "Purchased wheat from Ahmedabad mandi"
  }' | jq .

echo ""
echo "=========================================="
echo "6. RECORD A CREDIT (Sell 200kg Rice @ ₹42/kg to Sharma Traders — FULLY PAID)"
echo "=========================================="

curl -s $AUTH -X POST "$BASE/transactions/credit" \
  -H "Content-Type: application/json" \
  -d '{
    "dealerName": "Sharma Traders",
    "itemId": 1,
    "userId": 3,
    "grossQty": 205.00,
    "netQty": 200.00,
    "ratePerUnit": 42.00,
    "loadingCost": 150.00,
    "carrierCharges": 300.00,
    "paymentStatus": "FULLY_PAID",
    "description": "Sold rice to Sharma Traders, full payment received"
  }' | jq .

echo ""
echo "=========================================="
echo "7. RECORD A CREDIT (Sell 100kg Wheat @ ₹35/kg to Gupta & Sons — PENDING)"
echo "=========================================="

curl -s $AUTH -X POST "$BASE/transactions/credit" \
  -H "Content-Type: application/json" \
  -d '{
    "dealerName": "Gupta & Sons",
    "itemId": 2,
    "userId": 3,
    "grossQty": 102.00,
    "netQty": 100.00,
    "ratePerUnit": 35.00,
    "loadingCost": 100.00,
    "carrierCharges": 200.00,
    "paymentStatus": "PENDING",
    "description": "Sold wheat to Gupta & Sons, payment pending"
  }' | jq .

echo ""
echo "=========================================="
echo "8. RECORD AN EXPENSE (Delivery Cost ₹2,500)"
echo "=========================================="

curl -s $AUTH -X POST "$BASE/transactions/expense" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "expenseCategory": "DELIVERY_COST",
    "amount": 2500.00,
    "description": "Truck delivery charges for rice shipment"
  }' | jq .

echo ""
echo "=========================================="
echo "9. RECORD AN EXPENSE (Personal ₹1,000)"
echo "=========================================="

curl -s $AUTH -X POST "$BASE/transactions/expense" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "expenseCategory": "PERSONAL",
    "amount": 1000.00,
    "description": "Personal expense"
  }' | jq .

echo ""
echo "=========================================="
echo "10. LIST ALL TRANSACTIONS"
echo "=========================================="

curl -s $AUTH "$BASE/transactions" | jq .

echo ""
echo "=========================================="
echo "11. GET SINGLE TRANSACTION (ID=1)"
echo "=========================================="

curl -s $AUTH "$BASE/transactions/1" | jq .

echo ""
echo "=========================================="
echo "12. LIST TRANSACTIONS BY TYPE (DEBIT)"
echo "=========================================="

curl -s $AUTH "$BASE/transactions/type/DEBIT" | jq .

echo ""
echo "=========================================="
echo "13. DAILY REPORT (today)"
echo "=========================================="

curl -s $AUTH "$BASE/reports/daily?date=$(date +%Y-%m-%d)" | jq .

echo ""
echo "=========================================="
echo "14. PROFIT REPORT (this month)"
echo "=========================================="

curl -s $AUTH "$BASE/reports/profit?startDate=$(date +%Y-%m-01)&endDate=$(date +%Y-%m-%d)" | jq .

echo ""
echo "=========================================="
echo "15. PENDING FUNDS REPORT"
echo "=========================================="

curl -s $AUTH "$BASE/reports/pending-funds" | jq .

echo ""
echo "=========================================="
echo "16. EXPENSE REPORT (this month)"
echo "=========================================="

curl -s $AUTH "$BASE/reports/expenses?startDate=$(date +%Y-%m-01)&endDate=$(date +%Y-%m-%d)" | jq .

echo ""
echo "=========================================="
echo "17. LIST ALL USERS"
echo "=========================================="

curl -s $AUTH "$BASE/users" | jq .

echo ""
echo "=========================================="
echo "18. LIST ALL ITEMS"
echo "=========================================="

curl -s $AUTH "$BASE/items" | jq .

echo ""
echo "Done! All API tests completed."
