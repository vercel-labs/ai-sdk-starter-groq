import axios from 'axios';
import Anthropic from "@anthropic-ai/sdk";


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
  reporting_period: string;
  period: 'annual';
  currency: string;
  outstanding_shares: number;
  total_debt: number;
  goodwill_and_intangible_assets: number,
  cash_and_equivalents: number,
  shareholders_equity: number,
  free_cash_flow: number,
  net_income: number,
  capital_expenditure: number,
  research_and_development: number,
  operating_income: number,
  revenue: number,
  operating_margin: number,
  return_on_invested_capital: number,
  gross_margin: number
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
    if (financialLineItems.length > 0) {
      // Convert decimal values to percentage (e.g., 0.15 to 15%)
      const roicValues = financialLineItems.map(item => item.return_on_invested_capital);
      
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
    if (financialLineItems.length >= 3) {
      const grossMargins = financialLineItems.map(item => item.gross_margin);
      
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
      const capexRevenueItems = financialLineItems.filter(item => 
        item.capital_expenditure && item.capital_expenditure !== null && item.revenue && item.revenue !== null && item.revenue > 0
      );
      
      const capexToRevenue: number[] = [];

      for (const item of capexRevenueItems) {
        const capexRatio = Math.abs(item.capital_expenditure) / item.revenue;
        capexToRevenue.push(capexRatio)
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
      item.research_and_development && item.research_and_development !== null
    );
    
    const goodwillItems = financialLineItems.filter(item => 
      item.goodwill_and_intangible_assets && item.goodwill_and_intangible_assets !== null
    );
    
    if (rAndDItems.length > 0) {
      const rAndDSum = rAndDItems.reduce((sum, item) => sum + item.research_and_development, 0);
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

/**
 * Evaluate management quality using Munger's criteria
 */
export function analyzeManagementQuality(
  financialLineItems: LineItem[], 
  insiderTrades: InsiderTrade[]
): { score: number; details: string } {
  let score = 0;
  const details: string[] = [];
  
  if (!financialLineItems || financialLineItems.length === 0) {
    return {
      score: 0,
      details: "Insufficient data to analyze management quality"
    };
  }
  
  // 1. Capital allocation - Check FCF to net income ratio
  // Munger values companies that convert earnings to cash
  const fcfAndNetIncomeItems = financialLineItems.filter(item => 
    item.free_cash_flow && item.free_cash_flow !== null && item.net_income && item.net_income !== null
  );

  
  const fcfToNiRatios: number[] = [];
  for (const item of fcfAndNetIncomeItems) {
    const fcf = item.free_cash_flow;
    const netIncome = item.net_income;
    
    if (netIncome > 0) {
      fcfToNiRatios.push(fcf / netIncome);
    }
  }

  if (fcfToNiRatios.length > 0) {
    const avgRatio = fcfToNiRatios.reduce((sum, val) => sum + val, 0) / fcfToNiRatios.length;
    
    if (avgRatio > 1.1) {  // FCF > net income suggests good accounting
      score += 3;
      details.push(`Excellent cash conversion: FCF/NI ratio of ${avgRatio.toFixed(2)}`);
    } else if (avgRatio > 0.9) {  // FCF roughly equals net income
      score += 2;
      details.push(`Good cash conversion: FCF/NI ratio of ${avgRatio.toFixed(2)}`);
    } else if (avgRatio > 0.7) {  // FCF somewhat lower than net income
      score += 1;
      details.push(`Moderate cash conversion: FCF/NI ratio of ${avgRatio.toFixed(2)}`);
    } else {
      details.push(`Poor cash conversion: FCF/NI ratio of only ${avgRatio.toFixed(2)}`);
    }
  } else {
    details.push("Could not calculate FCF to Net Income ratios");
  }
  
  // 2. Debt management - Munger is cautious about debt
  const debtAndEquityItems = financialLineItems.filter(item => 
    item.total_debt && item.total_debt !== null && item.shareholders_equity && item.shareholders_equity !== null
  ).sort(
    (a, b) => new Date(b.reporting_period).getTime() - new Date(a.reporting_period).getTime()
  );

  // Calculate D/E ratio for most recent period
  const recentDebtValue = debtAndEquityItems[0].total_debt;
  const recentEquityValue = debtAndEquityItems[0].shareholders_equity;
  const recentDeRatio = recentDebtValue / recentEquityValue;

  if (recentEquityValue > 0) {
    const recentDeRatio = recentDebtValue / recentEquityValue;
    
    if (recentDeRatio < 0.3) {  // Very low debt
      score += 3;
      details.push(`Conservative debt management: D/E ratio of ${recentDeRatio.toFixed(2)}`);
    } else if (recentDeRatio < 0.7) {  // Moderate debt
      score += 2;
      details.push(`Prudent debt management: D/E ratio of ${recentDeRatio.toFixed(2)}`);
    } else if (recentDeRatio < 1.5) {  // Higher but still reasonable debt
      score += 1;
      details.push(`Moderate debt level: D/E ratio of ${recentDeRatio.toFixed(2)}`);
    } else {
      details.push(`High debt level: D/E ratio of ${recentDeRatio.toFixed(2)}`);
    }
  } else {
    details.push("Negative or zero equity value");
  }
  
  // 3. Cash management efficiency - Munger values appropriate cash levels
  const cashAndRevenueItems = financialLineItems.filter(item => 
    item.cash_and_equivalents && item.cash_and_equivalents !== null && item.revenue && item.revenue !== null
  ).sort(
    (a, b) => new Date(b.reporting_period).getTime() - new Date(a.reporting_period).getTime()
  );

  // Calculate recent cash and revenue values
  const recentCashValue = cashAndRevenueItems[0].cash_and_equivalents;
  const recentRevenueValue = cashAndRevenueItems[0].revenue;

  if (recentRevenueValue > 0) {
    const cashToRevenue = recentCashValue / recentRevenueValue;
    
    if (0.1 <= cashToRevenue && cashToRevenue <= 0.25) {
      // Goldilocks zone - not too much, not too little
      score += 2;
      details.push(`Prudent cash management: Cash/Revenue ratio of ${cashToRevenue.toFixed(2)}`);
    } else if ((0.05 <= cashToRevenue && cashToRevenue < 0.1) || 
              (0.25 < cashToRevenue && cashToRevenue <= 0.4)) {
      // Reasonable but not ideal
      score += 1;
      details.push(`Acceptable cash position: Cash/Revenue ratio of ${cashToRevenue.toFixed(2)}`);
    } else if (cashToRevenue > 0.4) {
      // Too much cash - potentially inefficient capital allocation
      details.push(`Excess cash reserves: Cash/Revenue ratio of ${cashToRevenue.toFixed(2)}`);
    } else {
      // Too little cash - potentially risky
      details.push(`Low cash reserves: Cash/Revenue ratio of ${cashToRevenue.toFixed(2)}`);
    }
  } else {
    details.push("Zero or negative revenue");
  }

  // 4. Insider activity - Munger values skin in the game
  if (insiderTrades && insiderTrades.length > 0) {
    // Count buys vs. sells
    const buys = insiderTrades.filter(trade => 
      trade.transaction_type && 
      ['buy', 'purchase'].includes(trade.transaction_type.toLowerCase())
    ).length;
    
    const sells = insiderTrades.filter(trade => 
      trade.transaction_type && 
      ['sell', 'sale'].includes(trade.transaction_type.toLowerCase())
    ).length;
    
    // Calculate the buy ratio
    const totalTrades = buys + sells;
    if (totalTrades > 0) {
      const buyRatio = buys / totalTrades;
      
      if (buyRatio > 0.7) {  // Strong insider buying
        score += 2;
        details.push(`Strong insider buying: ${buys}/${totalTrades} transactions are purchases`);
      } else if (buyRatio > 0.4) {  // Balanced insider activity
        score += 1;
        details.push(`Balanced insider trading: ${buys}/${totalTrades} transactions are purchases`);
      } else if (buyRatio < 0.1 && sells > 5) {  // Heavy selling
        score -= 1;  // Penalty for excessive selling
        details.push(`Concerning insider selling: ${sells}/${totalTrades} transactions are sales`);
      } else {
        details.push(`Mixed insider activity: ${buys}/${totalTrades} transactions are purchases`);
      }
    } else {
      details.push("No recorded insider transactions");
    }
  } else {
    details.push("No insider trading data available");
  }
  
  // 5. Consistency in share count - Munger prefers stable/decreasing shares
  const shareCountItems = financialLineItems.filter(item => 
    item.outstanding_shares && item.outstanding_shares !== null
  ).sort(
    (a, b) => new Date(b.reporting_period).getTime() - new Date(a.reporting_period).getTime()
  );
  
  if (shareCountItems.length >= 3) {
    const oldestCount = shareCountItems[0].outstanding_shares;
    const newestCount = shareCountItems[shareCountItems.length - 1].outstanding_shares;
    
    if (newestCount < oldestCount * 0.95) {  // 5%+ reduction in shares
      score += 2;
      details.push("Shareholder-friendly: Reducing share count over time");
    } else if (newestCount < oldestCount * 1.05) {  // Stable share count
      score += 1;
      details.push("Stable share count: Limited dilution");
    } else if (newestCount > oldestCount * 1.2) {  // >20% dilution
      score -= 1;  // Penalty for excessive dilution
      details.push("Concerning dilution: Share count increased significantly");
    } else {
      details.push("Moderate share count increase over time");
    }
  } else {
    details.push("Insufficient share count data");
  }
  
  // Scale score to 0-10 range
  // Maximum possible raw score would be 12 (3+3+2+2+2)
  const finalScore = Math.max(0, Math.min(10, score * 10 / 12));
  
  return {
    score: finalScore,
    details: details.join("; ")
  };
}

/**
 * Assess the predictability of the business using Munger's approach
 */
export function analyzePredictability(
  financialLineItems: LineItem[]
): { score: number; details: string } {
  let score = 0;
  const details: string[] = [];
  
  if (!financialLineItems || financialLineItems.length < 5) {
    return {
      score: 0,
      details: "Insufficient data to analyze business predictability (need 5+ years)"
    };
  }
  
  // 1. Revenue stability and growth
  const revenueItems = financialLineItems.filter(item => 
    item.revenue && item.revenue !== null
  ).sort((a, b) => 
    new Date(b.reporting_period).getTime() - new Date(a.reporting_period).getTime()
  );
  
  if (revenueItems.length >= 5) {
    const revenues = revenueItems.map(item => item.revenue);
    
    // Calculate year-over-year growth rates
    const growthRates: number[] = [];
    for (let i = 0; i < revenues.length - 1; i++) {
      if (revenues[i+1] > 0) {
        growthRates.push(revenues[i] / revenues[i+1] - 1);
      }
    }
    
    if (growthRates.length >= 4) {
      const avgGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
      
      // Calculate growth volatility (average deviation from mean growth)
      const growthVolatility = growthRates.reduce(
        (sum, rate) => sum + Math.abs(rate - avgGrowth), 0
      ) / growthRates.length;
      
      if (avgGrowth > 0.05 && growthVolatility < 0.1) {
        // Steady, consistent growth (Munger loves this)
        score += 3;
        details.push(`Highly predictable revenue: ${(avgGrowth * 100).toFixed(1)}% avg growth with low volatility`);
      } else if (avgGrowth > 0 && growthVolatility < 0.2) {
        // Positive but somewhat volatile growth
        score += 2;
        details.push(`Moderately predictable revenue: ${(avgGrowth * 100).toFixed(1)}% avg growth with some volatility`);
      } else if (avgGrowth > 0) {
        // Growing but unpredictable
        score += 1;
        details.push(`Growing but less predictable revenue: ${(avgGrowth * 100).toFixed(1)}% avg growth with high volatility`);
      } else {
        details.push(`Declining or highly unpredictable revenue: ${(avgGrowth * 100).toFixed(1)}% avg growth`);
      }
    } else {
      details.push("Insufficient revenue growth history");
    }
  } else {
    details.push("Insufficient revenue history for predictability analysis");
  }
  
  // 2. Operating income stability
  const opIncomeItems = financialLineItems.filter(item => 
    item.operating_income && item.operating_income !== null
  );
  
  if (opIncomeItems.length >= 5) {
    const opIncomes = opIncomeItems.map(item => item.operating_income);
    
    // Count positive operating income periods
    const positivePeriods = opIncomes.filter(income => income > 0).length;
    
    if (positivePeriods === opIncomes.length) {
      // Consistently profitable operations
      score += 3;
      details.push("Highly predictable operations: Operating income positive in all periods");
    } else if (positivePeriods >= opIncomes.length * 0.8) {
      // Mostly profitable operations
      score += 2;
      details.push(`Predictable operations: Operating income positive in ${positivePeriods}/${opIncomes.length} periods`);
    } else if (positivePeriods >= opIncomes.length * 0.6) {
      // Somewhat profitable operations
      score += 1;
      details.push(`Somewhat predictable operations: Operating income positive in ${positivePeriods}/${opIncomes.length} periods`);
    } else {
      details.push(`Unpredictable operations: Operating income positive in only ${positivePeriods}/${opIncomes.length} periods`);
    }
  } else {
    details.push("Insufficient operating income history");
  }
  
  // 3. Margin consistency - Munger values stable margins
  const opMarginItems = financialLineItems.filter(item => 
    item.operating_margin && item.operating_margin !== null
  );
  
  if (opMarginItems.length >= 5) {
    const opMargins = opMarginItems.map(item => item.operating_margin);
    
    // Calculate margin volatility
    const avgMargin = opMargins.reduce((sum, margin) => sum + margin, 0) / opMargins.length;
    const marginVolatility = opMargins.reduce(
      (sum, margin) => sum + Math.abs(margin - avgMargin), 0
    ) / opMargins.length;
    
    if (marginVolatility < 0.03) {  // Very stable margins
      score += 2;
      details.push(`Highly predictable margins: ${(avgMargin * 100).toFixed(1)}% avg with minimal volatility`);
    } else if (marginVolatility < 0.07) {  // Moderately stable margins
      score += 1;
      details.push(`Moderately predictable margins: ${(avgMargin * 100).toFixed(1)}% avg with some volatility`);
    } else {
      details.push(`Unpredictable margins: ${(avgMargin * 100).toFixed(1)}% avg with high volatility (${(marginVolatility * 100).toFixed(1)}%)`);
    }
  } else {
    details.push("Insufficient margin history");
  }
  
  // 4. Cash generation reliability
  const fcfItems = financialLineItems.filter(item => 
    item.free_cash_flow && item.free_cash_flow !== null
  );
  
  if (fcfItems.length >= 5) {
    const fcfValues = fcfItems.map(item => item.free_cash_flow);
    
    // Count positive FCF periods
    const positiveFcfPeriods = fcfValues.filter(fcf => fcf > 0).length;
    
    if (positiveFcfPeriods === fcfValues.length) {
      // Consistently positive FCF
      score += 2;
      details.push("Highly predictable cash generation: Positive FCF in all periods");
    } else if (positiveFcfPeriods >= fcfValues.length * 0.8) {
      // Mostly positive FCF
      score += 1;
      details.push(`Predictable cash generation: Positive FCF in ${positiveFcfPeriods}/${fcfValues.length} periods`);
    } else {
      details.push(`Unpredictable cash generation: Positive FCF in only ${positiveFcfPeriods}/${fcfValues.length} periods`);
    }
  } else {
    details.push("Insufficient free cash flow history");
  }
  
  // Scale score to 0-10 range
  // Maximum possible raw score would be 10 (3+3+2+2)
  const finalScore = Math.min(10, score * 10 / 10);
  
  return {
    score: finalScore,
    details: details.join("; ")
  };
}

/**
 * Calculate intrinsic value using Munger's approach focusing on owner earnings
 */
export function calculateMungerValuation(
  financialLineItems: LineItem[],
  marketCap: number | null
): {
  score: number;
  details: string;
  intrinsicValueRange?: {
    conservative: number;
    reasonable: number;
    optimistic: number;
  };
  fcfYield?: number;
  normalizedFcf?: number;
} {
  let score = 0;
  const details: string[] = [];
  
  if (!financialLineItems || !marketCap || marketCap <= 0) {
    return {
      score: 0,
      details: "Insufficient data to perform valuation"
    };
  }
  
  // Get FCF values (Munger's preferred "owner earnings" metric)
  const fcfValues: number[] = [];
  for (const item of financialLineItems) {
    if (item.free_cash_flow && item.free_cash_flow !== null) {
      fcfValues.push(item.free_cash_flow);
    }
  }
  
  if (!fcfValues.length || fcfValues.length < 3) {
    return {
      score: 0,
      details: "Insufficient free cash flow data for valuation"
    };
  }
  
  // 1. Normalize earnings by taking average of last 3-5 years
  // (Munger prefers to normalize earnings to avoid over/under-valuation based on cyclical factors)
  const periodsToAverage = Math.min(5, fcfValues.length);
  const normalizedFcf = fcfValues
    .slice(0, periodsToAverage)
    .reduce((sum, val) => sum + val, 0) / periodsToAverage;
  
  if (normalizedFcf <= 0) {
    return {
      score: 0,
      details: `Negative or zero normalized FCF (${normalizedFcf}), cannot value`
    };
  }
  
  // 2. Calculate FCF yield (inverse of P/FCF multiple)
  const fcfYield = normalizedFcf / marketCap;
  
  // 3. Apply Munger's FCF multiple based on business quality
  // Munger would pay higher multiples for wonderful businesses
  if (fcfYield > 0.08) {  // >8% FCF yield (P/FCF < 12.5x)
    score += 4;
    details.push(`Excellent value: ${(fcfYield * 100).toFixed(1)}% FCF yield`);
  } else if (fcfYield > 0.05) {  // >5% FCF yield (P/FCF < 20x)
    score += 3;
    details.push(`Good value: ${(fcfYield * 100).toFixed(1)}% FCF yield`);
  } else if (fcfYield > 0.03) {  // >3% FCF yield (P/FCF < 33x)
    score += 1;
    details.push(`Fair value: ${(fcfYield * 100).toFixed(1)}% FCF yield`);
  } else {
    details.push(`Expensive: Only ${(fcfYield * 100).toFixed(1)}% FCF yield`);
  }
  
  // 4. Calculate simple intrinsic value range
  // Munger tends to use straightforward valuations, avoiding complex DCF models
  const conservativeValue = normalizedFcf * 10;  // 10x FCF = 10% yield
  const reasonableValue = normalizedFcf * 15;    // 15x FCF ≈ 6.7% yield
  const optimisticValue = normalizedFcf * 20;    // 20x FCF = 5% yield
  
  // 5. Calculate margins of safety
  const currentToReasonable = (reasonableValue - marketCap) / marketCap;
  
  if (currentToReasonable > 0.3) {  // >30% upside
    score += 3;
    details.push(`Large margin of safety: ${(currentToReasonable * 100).toFixed(1)}% upside to reasonable value`);
  } else if (currentToReasonable > 0.1) {  // >10% upside
    score += 2;
    details.push(`Moderate margin of safety: ${(currentToReasonable * 100).toFixed(1)}% upside to reasonable value`);
  } else if (currentToReasonable > -0.1) {  // Within 10% of reasonable value
    score += 1;
    details.push(`Fair price: Within 10% of reasonable value (${(currentToReasonable * 100).toFixed(1)}%)`);
  } else {
    details.push(`Expensive: ${(-currentToReasonable * 100).toFixed(1)}% premium to reasonable value`);
  }
  
  // 6. Check earnings trajectory for additional context
  // Munger likes growing owner earnings
  if (fcfValues.length >= 3) {
    const recentAvg = (fcfValues[0] + fcfValues[1] + fcfValues[2]) / 3;
    const olderAvg = fcfValues.length >= 6 
      ? (fcfValues[fcfValues.length-1] + fcfValues[fcfValues.length-2] + fcfValues[fcfValues.length-3]) / 3
      : fcfValues[fcfValues.length-1];
    
    if (recentAvg > olderAvg * 1.2) {  // >20% growth in FCF
      score += 3;
      details.push("Growing FCF trend adds to intrinsic value");
    } else if (recentAvg > olderAvg) {
      score += 2;
      details.push("Stable to growing FCF supports valuation");
    } else {
      details.push("Declining FCF trend is concerning");
    }
  }
  
  // Scale score to 0-10 range
  // Maximum possible raw score would be 10 (4+3+3)
  const finalScore = Math.min(10, score * 10 / 10);
  
  return {
    score: finalScore,
    details: details.join("; "),
    intrinsicValueRange: {
      conservative: conservativeValue,
      reasonable: reasonableValue,
      optimistic: optimisticValue
    },
    fcfYield: fcfYield,
    normalizedFcf: normalizedFcf
  };
}

interface CharlieMungerSignal {
  signal: "bullish" | "bearish" | "neutral";
  confidence: number;
  reasoning: string;
}

/**
 * Generates investment decisions in the style of Charlie Munger using an LLM
 */
export async function generateMungerOutput(
  ticker: string,
  analysis_data: Record<string, any>,
): Promise<CharlieMungerSignal> {

  console.log("analysis_data", analysis_data);
  // Create system prompt
  const systemPrompt = `You are a Charlie Munger AI agent, making investment decisions using his principles:

  1. Focus on the quality and predictability of the business.
  2. Rely on mental models from multiple disciplines to analyze investments.
  3. Look for strong, durable competitive advantages (moats).
  4. Emphasize long-term thinking and patience.
  5. Value management integrity and competence.
  6. Prioritize businesses with high returns on invested capital.
  7. Pay a fair price for wonderful businesses.
  8. Never overpay, always demand a margin of safety.
  9. Avoid complexity and businesses you don't understand.
  10. "Invert, always invert" - focus on avoiding stupidity rather than seeking brilliance.
  
  Rules:
  - Praise businesses with predictable, consistent operations and cash flows.
  - Value businesses with high ROIC and pricing power.
  - Prefer simple businesses with understandable economics.
  - Admire management with skin in the game and shareholder-friendly capital allocation.
  - Focus on long-term economics rather than short-term metrics.
  - Be skeptical of businesses with rapidly changing dynamics or excessive share dilution.
  - Avoid excessive leverage or financial engineering.
  - Provide a rational, data-driven recommendation (bullish, bearish, or neutral).
  
  When providing your reasoning, be thorough and specific by:
  1. Explaining the key factors that influenced your decision the most (both positive and negative)
  2. Applying at least 2-3 specific mental models or disciplines to explain your thinking
  3. Providing quantitative evidence where relevant (e.g., specific ROIC values, margin trends)
  4. Citing what you would "avoid" in your analysis (invert the problem)
  5. Using Charlie Munger's direct, pithy conversational style in your explanation`;
  
  // Create user prompt
  const userPrompt = `Based on the following analysis, create a Munger-style investment signal.

  Analysis Data for ${ticker}:
  ${JSON.stringify(analysis_data, null, 2)}
  
  Return the trading signal in this JSON format:
  {
    "signal": "bullish/bearish/neutral",
    "confidence": float (0-100),
    "reasoning": "string"
  }`;

  try {
    // Call LLM with prompt
    // This is a simplified version - in a real implementation you would use your
    // preferred LLM client like OpenAI, Anthropic, etc.
    const response = await callLLM(systemPrompt, userPrompt);
    return parseResponse(response);
  } catch (error) {
    console.error("Error generating Munger output:", error);
    return {
      signal: "neutral",
      confidence: 0,
      reasoning: "Error in analysis, defaulting to neutral"
    };
  }
}

async function callLLM(
  systemPrompt: string,
  userPrompt: string,
): Promise<Anthropic.Messages.Message> {
  const anthropic = new Anthropic();

  const msg = await anthropic.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 1000,
    temperature: 1,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userPrompt,
          }
        ]
      }
    ]
  });
  return msg;
}

function parseResponse(response: Anthropic.Messages.Message): CharlieMungerSignal {
  const content = response.content[0];
  let parsedResponse: CharlieMungerSignal;
  switch (content.type) {
    case "text":
      let cleanedText = content.text
        .replace(/```json\n?|\n?```/g, "")
        .trim();
      parsedResponse = JSON.parse(cleanedText);
      break;
    default:
      throw new Error("Unexpected response format");
  }


  return {
    signal: parsedResponse.signal,
    confidence: parsedResponse.confidence,
    reasoning: parsedResponse.reasoning
  };
}

interface MemoSection {
  title: string;
  content: string;
}

interface InvestmentMemo {
  companyName: string;
  ticker: string;
  summary: string;
  content: string;
  sections: MemoSection[];
}

export async function generateInvestmentMemo(
  ticker: string,
  data: {
    financialMetrics: FinancialMetrics[],
    lineItems: LineItem[],
    marketCap: number | null,
    insiderTrades: InsiderTrade[],
    news: CompanyNews[],
    extraDocuments: string[]
  }
): Promise<InvestmentMemo> {
  // Create the memo structure
  const sections: MemoSection[] = [
    { title: "Business Description", content: "" },
    { title: "Competitive Landscape", content: "" },
    { title: "Financial Analysis", content: "" },
    { title: "Growth Prospects", content: "" },
    { title: "Opportunities & Risks", content: "" }
  ];

  // Perform the existing Munger-style analysis to incorporate in different sections
  const moat_analysis = analyzeMoatStrength(data.financialMetrics, data.lineItems);
  const management_analysis = analyzeManagementQuality(data.lineItems, data.insiderTrades);
  const predictability_analysis = analyzePredictability(data.lineItems);
  const valuation_analysis = calculateMungerValuation(data.lineItems, data.marketCap);

  // Generate prompt for LLM to create each section
  const companyName = await getCompanyName(ticker); // New function to get company name

  // Use Anthropic to generate each section (similar pattern to generateMungerOutput)
  const businessDescription = await generateBusinessDescriptionSection(ticker, companyName, data);
  const competitiveLandscape = await generateCompetitiveLandscapeSection(ticker, companyName, data, moat_analysis);
  const financialAnalysis = await generateFinancialAnalysisSection(ticker, companyName, data, management_analysis, valuation_analysis);
  const growthProspects = await generateGrowthProspectsSection(ticker, companyName, data, predictability_analysis);
  const opportunitiesRisks = await generateOpportunitiesRisksSection(ticker, companyName, data);

  // Assign content to each section
  sections[0].content = businessDescription;
  sections[1].content = competitiveLandscape;
  sections[2].content = financialAnalysis;
  sections[3].content = growthProspects;
  sections[4].content = opportunitiesRisks;

  // Generate executive summary
  const summary = await generateExecutiveSummary(ticker, companyName, sections);

  // Compile the full memo content
  const content = `# Investment Memo: ${companyName} (${ticker})\n\n## Executive Summary\n\n${summary}\n\n` +
    sections.map(section => `## ${section.title}\n\n${section.content}`).join('\n\n');

  return {
    companyName,
    ticker,
    summary,
    content,
    sections
  };
}

// Implement each section generator function following the same pattern
// as the existing generateMungerOutput function
async function generateBusinessDescriptionSection(ticker: string, companyName: string, data: any): Promise<string> {
  const systemPrompt = `You are a professional investment analyst creating a Business Description section for an investment memo.`;
  const userPrompt = `Create a comprehensive business description for ${companyName} (${ticker}) based on the following data...`;

  const response = await callLLM(systemPrompt, userPrompt);
  return extractTextContent(response);
}

// Similar implementations for other section generators...

function extractTextContent(response: any): string {
  const content = response.content[0];
  return content.type === "text" ? content.text : "";
}