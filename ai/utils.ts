import axios from 'axios';

interface FinancialMetrics {
    ticker: string;
    report_period: string;
    period: string;
    currency: string;
    market_cap: number | null;
    enterprise_value: number | null;
    price_to_earnings_ratio: number | null;
    price_to_book_ratio: number | null;
    price_to_sales_ratio: number | null;
    enterprise_value_to_ebitda_ratio: number | null;
    enterprise_value_to_revenue_ratio: number | null;
    free_cash_flow_yield: number | null;
    gross_margin: number | null;
    operating_margin: number | null;
    net_margin: number | null;
    return_on_equity: number | null;
    return_on_assets: number | null;
    return_on_invested_capital: number | null;
    asset_turnover: number | null;
    inventory_turnover: number | null;
    receivables_turnover: number | null;
    days_sales_outstanding: number | null;
    operating_cycle: number | null;
    working_capital_turnover: number | null;
    current_ratio: number | null;
    quick_ratio: number | null;
    cash_ratio: number | null;
    operating_cash_flow_ratio: number | null;
    debt_to_equity: number | null;
    debt_to_assets: number | null;
    interest_coverage: number | null;
    revenue_growth: number | null;
    earnings_growth: number | null;
    book_value_growth: number | null;
    earnings_per_share_growth: number | null;
    free_cash_flow_growth: number | null;
    operating_income_growth: number | null;
    ebitda_growth: number | null;
    payout_ratio: number | null;
    earnings_per_share: number | null;
    book_value_per_share: number | null;
    free_cash_flow_per_share: number | null;
}
  
interface FinancialMetricsResponse {
    financial_metrics: FinancialMetrics[];
}
  
/**
  * Fetch financial metrics from the API
  */
export async function getFinancialMetrics(
    ticker: string,
    endDate: string,
    period: string = "ttm",
    limit: number = 10
): Promise<FinancialMetrics[]> {
    // Prepare headers for API authentication
    const headers: Record<string, string> = {};
    const apiKey = process.env.FINANCIAL_DATASETS_API_KEY;
    if (apiKey) {
      headers["X-API-KEY"] = apiKey;
    }
  
    // Build the API request URL
    const url = `https://api.financialdatasets.ai/financial-metrics/?ticker=${ticker}&report_period_lte=${endDate}&limit=${limit}&period=${period}`;
    
    try {
      // Make the API request
      const response = await axios.get(url, { headers });
      
      if (response.status !== 200) {
        throw new Error(`Error fetching financial metrics: ${response.status} - ${response.statusText}`);
      }
      
      // Parse the response
      const data = response.data as FinancialMetricsResponse;
      const financialMetrics = data.financial_metrics;
      
      if (!financialMetrics || financialMetrics.length === 0) {
        console.log(`No financial metrics found for ${ticker}`);
        return [];
      }
      
      return financialMetrics;
    } catch (error) {
      console.error(`Error fetching financial metrics for ${ticker}:`, error);
      throw error;
    }
}

/**
 * Fetch market cap for a ticker from financial metrics
 * @param ticker The stock ticker symbol
 * @param endDate End date for analysis in YYYY-MM-DD format
 * @returns The market cap as a number, or null if not available
 */
export async function getMarketCap(
    ticker: string,
    endDate: string
): Promise<number | null> {
    try {
      // Fetch financial metrics with limit=1 since we only need the most recent data
      const metrics = await getFinancialMetrics(ticker, endDate, "ttm", 1);
      
      // If we have metrics and the first one has market cap, return it
      if (metrics && metrics.length > 0 && metrics[0].market_cap !== null) {
        return metrics[0].market_cap;
      }
      
      // Otherwise return null
      return null;
    } catch (error) {
      console.error(`Error fetching market cap for ${ticker}:`, error);
      return null;
    }
}

// Define interfaces for LineItem data
interface LineItem {
    ticker: string;
    line_item: string;
    value: number;
    report_date: string;
    filing_date: string;
    period: string;
    unit: string;
    currency: string;
}
  
interface LineItemResponse {
    search_results: LineItem[];
}
  
/**
  * Search for specific financial line items
  */
export async function searchLineItems(
    ticker: string,
    lineItems: string[],
    endDate: string,
    period: string = "ttm",
    limit: number = 10
): Promise<LineItem[]> {
    // Prepare headers for API authentication
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    const apiKey = process.env.FINANCIAL_DATASETS_API_KEY;
    if (apiKey) {
      headers["X-API-KEY"] = apiKey;
    }
  
    try {
      // Build request body
      const body = {
        tickers: [ticker],
        line_items: lineItems,
        end_date: endDate,
        period: period,
        limit: limit
      };
  
      // Make the API request
      const response = await axios.post(
        "https://api.financialdatasets.ai/financials/search/line-items", 
        body, 
        { headers }
      );
      
      if (response.status !== 200) {
        throw new Error(`Error fetching line items: ${response.status} - ${response.statusText}`);
      }
      
      // Parse the response
      const data = response.data as LineItemResponse;
      const searchResults = data.search_results;
      
      if (!searchResults || searchResults.length === 0) {
        console.log(`No line items found for ${ticker}`);
        return [];
      }
      
      return searchResults.slice(0, limit);
    } catch (error) {
      console.error(`Error searching line items for ${ticker}:`, error);
      throw error;
    }
}

// Define interfaces for InsiderTrade data
interface InsiderTrade {
    ticker: string;
    insider_name: string;
    title: string;
    transaction_type: string;
    price: number | null;
    quantity: number;
    ownership_type: string;
    filing_date: string;
    transaction_date: string | null;
    post_transaction_amount: number | null;
    sec_form_url: string | null;
  }
  
  interface InsiderTradeResponse {
    insider_trades: InsiderTrade[];
  }

  
/**
  * Get insider trades for a ticker
  */
export async function getInsiderTrades(
    ticker: string,
    endDate: string,
    startDate: string | null = null,
    limit: number = 1000
): Promise<InsiderTrade[]> {
    // Prepare headers for API authentication
    const headers: Record<string, string> = {};
    const apiKey = process.env.FINANCIAL_DATASETS_API_KEY;
    if (apiKey) {
      headers["X-API-KEY"] = apiKey;
    }
    
    try {
      const allTrades: InsiderTrade[] = [];
      let currentEndDate = endDate;
      
      while (true) {
        // Build the URL with parameters
        let url = `https://api.financialdatasets.ai/insider-trades/?ticker=${ticker}&filing_date_lte=${currentEndDate}&limit=${limit}`;
        
        if (startDate) {
          url += `&filing_date_gte=${startDate}`;
        }
        
        // Make the API request
        const response = await axios.get(url, { headers });
        
        if (response.status !== 200) {
          throw new Error(`Error fetching insider trades: ${response.status} - ${response.statusText}`);
        }
        
        // Parse the response
        const data = response.data as InsiderTradeResponse;
        const insiderTrades = data.insider_trades;
        
        if (!insiderTrades || insiderTrades.length === 0) {
          break;
        }
        
        allTrades.push(...insiderTrades);
        
        // Only continue pagination if we have a start date and got a full page
        if (!startDate || insiderTrades.length < limit) {
          break;
        }
        
        // Update end date to the oldest filing date from current batch for next iteration
        const oldestDate = insiderTrades
          .map(trade => trade.filing_date)
          .sort()[0]
          .split('T')[0];
          
        currentEndDate = oldestDate;
        
        // If we've reached or passed the start date, we can stop
        if (startDate && currentEndDate <= startDate) {
          break;
        }
      }
      
      return allTrades;
    } catch (error) {
      console.error(`Error fetching insider trades for ${ticker}:`, error);
      throw error;
    }
}


// Define interface for company news
interface CompanyNews {
    ticker: string;
    title: string;
    publication_date: string;
    source: string;
    url: string;
    summary: string | null;
    sentiment: string | null;
    relevance_score: number | null;
  }
  
  interface CompanyNewsResponse {
    company_news: CompanyNews[];
  }
  
  /**
   * Fetch company news from the API
   */
  export async function getCompanyNews(
    ticker: string,
    endDate: string,
    startDate: string | null = null,
    limit: number = 100
  ): Promise<CompanyNews[]> {
    // Prepare headers for API authentication
    const headers: Record<string, string> = {};
    const apiKey = process.env.FINANCIAL_DATASETS_API_KEY;
    if (apiKey) {
      headers["X-API-KEY"] = apiKey;
    }
    
    try {
      // Build the API request URL
      let url = `https://api.financialdatasets.ai/news/?ticker=${ticker}&end_date=${endDate}`;
      
      if (startDate) {
        url += `&publication_date_gte=${startDate}`;
      }
      
      // Make the API request
      const response = await axios.get(url, { headers });
      
      if (response.status !== 200) {
        throw new Error(`Error fetching company news: ${response.status} - ${response.statusText}`);
      }
      
      // Parse the response
      const data = response.data as CompanyNewsResponse;
      const companyNews = data.company_news;
      
      if (!companyNews || companyNews.length === 0) {
        console.log(`No news found for ${ticker}`);
        return [];
      }
      
      return companyNews;
    } catch (error) {
      console.error(`Error fetching news for ${ticker}:`, error);
      throw error;
    }
  }
  
  /**
   * Analyze the business's competitive advantage using Munger's approach
   */
  export function analyzeMoatStrength(
    metrics: FinancialMetrics[], 
    financialLineItems: LineItem[]
  ): { score: number; details: string } {
    let score = 0;
    const details: string[] = [];
    
    if (!metrics || !financialLineItems || metrics.length === 0 || financialLineItems.length === 0) {
      return {
        score: 0,
        details: "Insufficient data to analyze moat strength"
      };
    }
    
    // 1. Return on Invested Capital (ROIC) analysis - Munger's favorite metric
    const roicItems = financialLineItems.filter(item => 
      item.line_item === "return_on_invested_capital" && item.value !== null
    );
    
    if (roicItems.length > 0) {
      // Convert decimal values to percentage (e.g., 0.15 to 15%)
      const roicValues = roicItems.map(item => item.value);
      
      // Check if ROIC consistently above 15% (Munger's threshold)
      const highRoicCount = roicValues.filter(r => r > 0.15).length;
      
      if (highRoicCount >= roicValues.length * 0.8) {  // 80% of periods show high ROIC
        score += 3;
        details.push(`Excellent ROIC: >15% in ${highRoicCount}/${roicValues.length} periods`);
      } else if (highRoicCount >= roicValues.length * 0.5) {  // 50% of periods
        score += 2;
        details.push(`Good ROIC: >15% in ${highRoicCount}/${roicValues.length} periods`);
      } else if (highRoicCount > 0) {
        score += 1;
        details.push(`Mixed ROIC: >15% in only ${highRoicCount}/${roicValues.length} periods`);
      } else {
        details.push("Poor ROIC: Never exceeds 15% threshold");
      }
    } else {
      details.push("No ROIC data available");
    }
    
    // 2. Pricing power - check gross margin stability and trends
    const grossMarginItems = financialLineItems.filter(item => 
      item.line_item === "gross_margin" && item.value !== null
    );
    
    if (grossMarginItems.length >= 3) {
      const grossMargins = grossMarginItems.map(item => item.value);
      
      // Munger likes stable or improving gross margins
      let marginTrend = 0;
      for (let i = 1; i < grossMargins.length; i++) {
        if (grossMargins[i] >= grossMargins[i-1]) {
          marginTrend++;
        }
      }
      
      if (marginTrend >= grossMargins.length * 0.7) {  // Improving in 70% of periods
        score += 2;
        details.push("Strong pricing power: Gross margins consistently improving");
      } else if (grossMargins.reduce((sum, val) => sum + val, 0) / grossMargins.length > 0.3) {  // Average margin > 30%
        score += 1;
        details.push(`Good pricing power: Average gross margin ${(grossMargins.reduce((sum, val) => sum + val, 0) / grossMargins.length * 100).toFixed(1)}%`);
      } else {
        details.push("Limited pricing power: Low or declining gross margins");
      }
    } else {
      details.push("Insufficient gross margin data");
    }
    
    // 3. Capital intensity - Munger prefers low capex businesses
    if (financialLineItems.length >= 3) {
      const capexItems = financialLineItems.filter(item => 
        item.line_item === "capital_expenditure" && item.value !== null
      );
      
      const revenueItems = financialLineItems.filter(item => 
        item.line_item === "revenue" && item.value !== null && item.value > 0
      );
      
      const capexToRevenue: number[] = [];
      
      // Match capex to revenue for the same periods
      for (let i = 0; i < capexItems.length; i++) {
        const capexItem = capexItems[i];
        const matchingRevenue = revenueItems.find(r => r.report_date === capexItem.report_date);
        
        if (matchingRevenue && matchingRevenue.value > 0) {
          // Note: capital_expenditure is typically negative in financial statements
          const capexRatio = Math.abs(capexItem.value) / matchingRevenue.value;
          capexToRevenue.push(capexRatio);
        }
      }
      
      if (capexToRevenue.length > 0) {
        const avgCapexRatio = capexToRevenue.reduce((sum, val) => sum + val, 0) / capexToRevenue.length;
        
        if (avgCapexRatio < 0.05) {  // Less than 5% of revenue
          score += 2;
          details.push(`Low capital requirements: Avg capex ${(avgCapexRatio * 100).toFixed(1)}% of revenue`);
        } else if (avgCapexRatio < 0.10) {  // Less than 10% of revenue
          score += 1;
          details.push(`Moderate capital requirements: Avg capex ${(avgCapexRatio * 100).toFixed(1)}% of revenue`);
        } else {
          details.push(`High capital requirements: Avg capex ${(avgCapexRatio * 100).toFixed(1)}% of revenue`);
        }
      } else {
        details.push("No capital expenditure data available");
      }
    } else {
      details.push("Insufficient data for capital intensity analysis");
    }
    
    // 4. Intangible assets - Munger values R&D and intellectual property
    const rAndDItems = financialLineItems.filter(item => 
      item.line_item === "research_and_development" && item.value !== null
    );
    
    const goodwillItems = financialLineItems.filter(item => 
      item.line_item === "goodwill_and_intangible_assets" && item.value !== null
    );
    
    if (rAndDItems.length > 0) {
      const rAndDSum = rAndDItems.reduce((sum, item) => sum + item.value, 0);
      if (rAndDSum > 0) {  // If company is investing in R&D
        score += 1;
        details.push("Invests in R&D, building intellectual property");
      }
    }
    
    if (goodwillItems.length > 0) {
      score += 1;
      details.push("Significant goodwill/intangible assets, suggesting brand value or IP");
    }
    
    // Scale score to 0-10 range
    const finalScore = Math.min(10, score * 10 / 9);  // Max possible raw score is 9
    
    return {
      score: finalScore,
      details: details.join("; ")
    };
  }