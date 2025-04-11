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
