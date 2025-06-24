//README.md
# 🛒 Supermart Analytics Dashboard

A comprehensive retail analytics and sales prediction platform built with Next.js, featuring machine learning-powered sales forecasting using XGBoost.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![XGBoost](https://img.shields.io/badge/ML-XGBoost-orange)

## 🌟 Features

### 📊 **Analytics Dashboard**
- **Real-time Sales Metrics**: Total sales, orders, average order value, and active cities
- **Interactive Charts**: Sales overview, category distribution, regional analysis
- **Monthly Trends**: Seasonal patterns and profit analysis
- **Category Insights**: Performance breakdown with visual progress indicators
- **Regional Performance**: Geographic sales distribution across Tamil Nadu

### 🤖 **AI-Powered Sales Prediction**
- **Machine Learning Model**: Trained XGBoost regressor for accurate sales forecasting
- **Multi-factor Analysis**: Considers product category, location, timing, and market conditions
- **Interactive Interface**: User-friendly form with real-time parameter adjustment
- **Detailed Results**: Financial breakdown with profit margins and insights

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Professional Interface**: Clean, modern design with intuitive navigation
- **Real-time Updates**: Dynamic data loading with loading states
- **Error Handling**: Comprehensive error messages and recovery options

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.8+
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd supermart-analytics-dashboard
   \`\`\`

2. **Install Node.js dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Install Python dependencies**
   \`\`\`bash
   pip install pandas scikit-learn xgboost joblib matplotlib seaborn numpy
   \`\`\`

4. **Set up the data**
   - Place your `new_orders.csv` file in the `data/` directory
   - Ensure the CSV has columns: Order Date, Category, Sub Category, City, Region, State, Sales, Profit, Discount

5. **Train the machine learning model**
   \`\`\`bash
   
   # Run the training pipeline
   ./scripts/run_training.sh
   
   # Or run directly with Python
   python scripts/train_model.py
   \`\`\`

6. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)




### Data Format

Your `new_orders.csv` should have these columns:

| Column | Type | Description |
|--------|------|-------------|
| Order Date | Date | Order date (YYYY-MM-DD format) |
| Category | String | Product category |
| Sub Category | String | Product subcategory |
| City | String | City name |
| Region | String | Geographic region |
| State | String | State name |
| Sales | Number | Sales amount in ₹ |
| Profit | Number | Profit amount in ₹ |
| Discount | Number | Discount percentage (0-1) |

## 🤖 Machine Learning Pipeline

### Model Training Process

1. **Data Preprocessing**
   - Date feature extraction (month, year, day of week)
   - Categorical encoding using LabelEncoder
   - Feature engineering (profit margins, discount categories)
   - Data cleaning and validation

2. **Feature Engineering**
   - `high_discount`: Binary flag for discounts > 20%
   - `profit_margin`: Calculated profit percentage
   - `is_weekend`: Weekend order indicator
   - `Region_Category`: Interaction features

3. **Model Training**
   - **Algorithm**: XGBoost Regressor
   - **Validation**: 3-fold cross-validation
   - **Hyperparameter Tuning**: GridSearchCV
   - **Features**: 15 engineered features

4. **Model Evaluation**
   - **Metrics**: R² Score, Mean Squared Error
   - **Validation**: Train/test split (80/20)
   - **Performance Tracking**: Saved in model_metrics.json

### Prediction Features

The model uses these features for prediction:
- Product category and subcategory
- Geographic location (city, region, state)
- Temporal features (month, year, day of week)
- Business parameters (discount, profit margin)
- Market conditions (weekend/weekday)

## 📊 API Endpoints

### Analytics API
\`\`\`
GET /api/analytics
\`\`\`
Returns dashboard analytics data including sales metrics, category distribution, and regional performance.

### Prediction API
\`\`\`
POST /api/predict
Content-Type: application/json

{
  "category": 0,
  "subCategory": 0,
  "city": 2,
  "region": 1,
  "state": 0,
  "discount": 0.1,
  "month": 6,
  "year": 2024,
  "dayOfWeek": 0,
  "isWeekend": 0,
  "profitMargin": 0.2
}
\`\`\`

### Debug Endpoints
\`\`\`
GET /api/debug/files     # Check file system status
GET /api/test-models     # Verify model files
\`\`\`

## 🛠️ Development

### Running in Development Mode

\`\`\`bash
# Start the development server
npm run dev

# Run with specific port
npm run dev -- -p 3001
\`\`\`



## 🧪 Testing

### Verify Setup
\`\`\`bash
python scripts/verify_setup.py
\`\`\`

### Test Data Structure
\`\`\`bash
python scripts/test_data.py
\`\`\`

### Debug Model Files
Visit `http://localhost:3000/api/test-models` in your browser.

## 🚨 Troubleshooting

### Common Issues

#### 1. "Model files not found" Error
**Solution:**
\`\`\`bash
# Ensure models folder is in project root
ls -la models/

# Re-run training if files missing
python scripts/train_model.py
\`\`\`

#### 2. "Analytics data not available" Error
**Solution:**
\`\`\`bash
# Check if CSV file exists
ls -la data/new_orders.csv

# Verify data format
python scripts/test_data.py

# Re-run training
./scripts/run_training.sh
\`\`\`

#### 3. Python Dependencies Missing
**Solution:**
\`\`\`bash
# Install required packages
pip install pandas scikit-learn xgboost joblib matplotlib seaborn numpy

# Or use requirements file
pip install -r requirements.txt
\`\`\`

#### 4. Charts Not Displaying Data
**Solution:**
1. Check browser console for errors
2. Verify analytics.json exists in data/processed/
3. Refresh the page
4. Re-run training script if needed


### Debug Steps

1. **Check file structure**:
   \`\`\`bash
   ls -la
   ls -la models/
   ls -la data/processed/
   \`\`\`

2. **Verify model training**:
   \`\`\`bash
   python scripts/verify_setup.py
   \`\`\`

3. **Check API endpoints**:
   - Visit `/api/debug/files`
   - Visit `/api/test-models`
   - Check browser console logs

4. **Re-run training pipeline**:
   \`\`\`bash
   ./scripts/run_training.sh
   \`\`\`



## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add build commands**:
   - Build Command: `npm run build`
   - Install Command: `npm install`
4. **Add Python runtime** (if needed for serverless functions)
