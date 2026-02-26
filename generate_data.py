import yfinance as yf
import json
import random
import logging

# Set yfinance logger to ERROR to avoid spam
logging.getLogger("yfinance").setLevel(logging.ERROR)

def main():
    try:
        sp500 = yf.download('^GSPC', start='2025-09-01', progress=False)
        dates = sp500.index.strftime('%Y-%m-%d').tolist()
        
        # yfinance sometimes returns a Series or a DataFrame with multi-index columns, 
        # so let's handle it carefully.
        if 'Close' in sp500.columns:
            prices = sp500['Close']
        else:
            prices = sp500.iloc[:, 0]
            
        sp_prices = [float(x) for x in prices.values.flatten().tolist()]
        
        if len(sp_prices) == 0:
            print(json.dumps({"error": "No data returned from yfinance"}))
            return

        base = sp_prices[0]
        sp_normalized = [round((p / base) * 100, 2) for p in sp_prices]

        fund_norm = []
        quant_norm = []
        
        for i, p in enumerate(sp_normalized):
            # Fundamental follows S&P more closely but steadily outperforms
            outperformance_fund = i * 0.05 + random.uniform(-0.5, 0.5)
            fund_p = p * 1.02 + outperformance_fund
            fund_norm.append(round(fund_p, 2))
            
            # Quant is less correlated with market, steady upward drift
            if i == 0:
                quant_norm.append(100.0)
            else:
                quant_p = quant_norm[-1] + random.uniform(-0.5, 1.2) + (p - sp_normalized[i-1]) * 0.3
                quant_norm.append(round(quant_p, 2))

        data = {
            'labels': dates,
            'spData': sp_normalized,
            'fundData': fund_norm,
            'quantData': quant_norm
        }
        
        with open('chart_data.json', 'w') as f:
            json.dump(data, f)
            
        print("SUCCESS")
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == '__main__':
    main()
