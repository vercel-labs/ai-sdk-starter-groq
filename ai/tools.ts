import { tool } from "ai";
import { z } from "zod";
import { analyzeManagementQuality, analyzeMoatStrength, analyzePredictability, calculateMungerValuation, generateInvestmentMemo, generateMungerOutput, getCompanyNews, getFinancialMetrics, getInsiderTrades, getMarketCap, searchLineItems } from "./utils";

export const charlieMungerTool = tool({
  description: "Analyze stocks using Charlie Munger's investing principles focusing on moat strength, management quality, predictability, and valuation.",
  parameters: z.object({
    ticker: z.string().describe("Stock ticker symbol to analyze"),
    endDate: z.string().describe("End date for analysis in YYYY-MM-DD format")
  }),
  execute: async ({ ticker, endDate }) => {
    try {
      // 1. Fetch all required data
      const metrics = await getFinancialMetrics(ticker, endDate, "annual", 10);
      
      const financial_line_items = await searchLineItems(
        ticker, 
        [
          "revenue",
          "net_income",
          "operating_income",
          "return_on_invested_capital",
          "gross_margin",
          "operating_margin",
          "free_cash_flow",
          "capital_expenditure",
          "cash_and_equivalents",
          "total_debt",
          "shareholders_equity",
          "outstanding_shares",
          "research_and_development",
          "goodwill_and_intangible_assets",
        ],
        endDate,
        "annual",
        10
      );
      
      const market_cap = await getMarketCap(ticker, endDate);
      const insider_trades = await getInsiderTrades(ticker, endDate, null, 100);
      // const company_news = await getCompanyNews(ticker, endDate, null, 100);

      // 2. Perform Munger-style analysis
      const moat_analysis = analyzeMoatStrength(metrics, financial_line_items);
      const management_analysis = analyzeManagementQuality(financial_line_items, insider_trades);
      const predictability_analysis = analyzePredictability(financial_line_items);
      const valuation_analysis = calculateMungerValuation(financial_line_items, market_cap);
      // const news_sentiment = analyzeNewsSentiment(company_news);

      // 3. Combine partial scores with Munger's weighting preferences
      const total_score = (
        moat_analysis.score * 0.35 +
        management_analysis.score * 0.25 +
        predictability_analysis.score * 0.25 +
        valuation_analysis.score * 0.15
      );
      
      // 4. Generate a simple signal based on the total score
      let signal: "bullish" | "bearish" | "neutral";
      if (total_score >= 7.5) {  // Munger has very high standards
        signal = "bullish";
      } else if (total_score <= 4.5) {
        signal = "bearish";
      } else {
        signal = "neutral";
      }

      // 5. Create analysis data similar to Python
      const analysis_data = {
        [ticker]: {
          signal,
          score: total_score,
          max_score: 10,
          moat_analysis,
          management_analysis,
          predictability_analysis,
          valuation_analysis,
          // news_sentiment
        }
      };

      // 6. Generate Munger-style output using LLM
      const munger_output = await generateMungerOutput(
        ticker,
        analysis_data,
      );

      console.log("Charlie Munger analysis output:", munger_output);

      // 7. Return the result
      return {
        signal: munger_output.signal,
        confidence: munger_output.confidence,
        reasoning: munger_output.reasoning,
        details: analysis_data[ticker]
      };
    } catch (error) {
      console.error("Error in Charlie Munger analysis:", error);
      return {
        signal: "neutral",
        confidence: 0,
        reasoning: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: {}
      };
    }
  }
});

export const investmentMemoTool = tool({
  description: "Generates a comprehensive investment memo for a given stock ticker, including business description, competitive landscape, financial analysis, growth prospects, and risk assessment.",
  parameters: z.object({
    ticker: z.string().describe("Stock ticker symbol to analyze"),
    endDate: z.string().describe("End date for analysis in YYYY-MM-DD format"),
    includeSources: z.boolean().optional().describe("Whether to include source references in the memo"),
    extraDocuments: z.array(z.string()).optional().describe("Additional document URLs or paths to analyze")
  }),
  execute: async ({ ticker, endDate, includeSources = true, extraDocuments = [] }) => {
    try {
      // 1. Fetch financial data (reuse existing API calls from charlieMungerTool)
      const metrics = await getFinancialMetrics(ticker, endDate, "annual", 10);
      const financial_line_items = await searchLineItems(
        ticker,
        [
          // Include all necessary financial metrics
          "revenue", "net_income", "operating_income", "return_on_invested_capital",
          "gross_margin", "operating_margin", "free_cash_flow", "capital_expenditure",
          "cash_and_equivalents", "total_debt", "shareholders_equity", "outstanding_shares",
          "research_and_development", "goodwill_and_intangible_assets"
        ],
        endDate,
        "annual",
        10
      );

      const market_cap = await getMarketCap(ticker, endDate);
      const insider_trades = await getInsiderTrades(ticker, endDate, null, 100);
      const company_news = await getCompanyNews(ticker, endDate, null, 100);

      // 2. Get additional data from external sources
      // - Fetch company description, competitors, industry analysis
      // - Get latest earnings call transcripts (can be implemented as separate functions)

      // 3. Generate content for each section of the memo
      const memo = await generateInvestmentMemo(
        ticker,
        {
          financialMetrics: metrics,
          lineItems: financial_line_items,
          marketCap: market_cap,
          insiderTrades: insider_trades,
          news: company_news,
          extraDocuments: extraDocuments
        }
      );

      // 4. Return the memo content and metadata
      return {
        ticker,
        title: `Investment Memo: ${memo.companyName} (${ticker})`,
        generationDate: new Date().toISOString(),
        content: memo.content,
        sections: memo.sections,
        summary: memo.summary
      };
    } catch (error) {
      console.error("Error generating investment memo:", error);
      return {
        error: error instanceof Error ? error.message : "Unknown error generating memo"
      };
    }
  }
});