import { tool } from "ai";
import { z } from "zod";
import { analyzeManagementQuality, analyzeMoatStrength, analyzePredictability, calculateMungerValuation, generateMungerOutput, getCompanyNews, getFinancialMetrics, getInsiderTrades, getMarketCap, searchLineItems } from "./utils";

export const weatherTool = tool({
  description: "Get the weather in a location",
  parameters: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
  execute: async ({ location }) => ({
    location,
    temperature: 72 + Math.floor(Math.random() * 21) - 10,
  }),
});

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
      console.log('financial_line_items', financial_line_items[0]);
      
      const market_cap = await getMarketCap(ticker, endDate);
      const insider_trades = await getInsiderTrades(ticker, endDate, null, 100);
      // const company_news = await getCompanyNews(ticker, endDate, null, 100);

      // 2. Perform Munger-style analysis
      const moat_analysis = analyzeMoatStrength(metrics, financial_line_items);
      const management_analysis = analyzeManagementQuality(financial_line_items, insider_trades);
      const predictability_analysis = analyzePredictability(financial_line_items);
      const valuation_analysis = calculateMungerValuation(financial_line_items, market_cap);
      // const news_sentiment = analyzeNewsSentiment(company_news);

      console.log("market_cap", market_cap);
      console.log("insider_trades", insider_trades.length);
      console.log("financial_line_items", financial_line_items.length);
      console.log("moat_analysis", moat_analysis);

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
