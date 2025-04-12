import { tool } from "ai";
import { z } from "zod";
import { analyzeMoatStrength, getCompanyNews, getFinancialMetrics, getInsiderTrades, getMarketCap, searchLineItems } from "./utils";

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
  description: "",
  parameters: z.object({
    ticker: z.string().describe("Stock ticker symbol to analyze"),
    endDate: z.string().describe("End date for analysis in YYYY-MM-DD format"),
  }),
  execute: async ({ ticker, endDate }) => {
    try {
      const period = "annual";
      // 1. Fetch all required data
      const metrics = await getFinancialMetrics(ticker, endDate, period, 10);
      const marketCap = await getMarketCap(ticker, endDate);
      
      const lineItems = await searchLineItems(
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
        period,
        10
      );
      
      const insiderTrades = await getInsiderTrades(ticker, endDate);
      const companyNews = await getCompanyNews(ticker, endDate);

      // // 2. Perform Munger-style analysis
      const moatAnalysis = analyzeMoatStrength(metrics, lineItems);
      // const managementAnalysis = analyzeManagementQuality(lineItems, insiderTrades);
      // const predictabilityAnalysis = analyzePredictability(lineItems);
      // const valuationAnalysis = calculateMungerValuation(lineItems, marketCap);
      // const newsSentiment = analyzeNewsSentiment(companyNews);

      // // 3. Generate overall rating and reasoning
      // const overallScore = 
      //   (moatAnalysis.score * 0.35) + 
      //   (managementAnalysis.score * 0.25) + 
      //   (predictabilityAnalysis.score * 0.25) + 
      //   (valuationAnalysis.score * 0.15);

      // let signal: "bullish" | "bearish" | "neutral";
      // let confidence: number;

      // // Determine signal based on score and valuation
      // if (overallScore > 7.5 && valuationAnalysis.intrinsicValueRange?.reasonable > marketCap * 1.3) {
      //   signal = "bullish";
      //   confidence = Math.min(100, overallScore * 10);
      // } else if (overallScore < 4 || valuationAnalysis.intrinsicValueRange?.conservative < marketCap * 0.7) {
      //   signal = "bearish";
      //   confidence = Math.min(100, (10 - overallScore) * 10);
      // } else {
      //   signal = "neutral";
      //   confidence = 50 + Math.abs((overallScore - 5) * 10);
      // }

      // // 4. Return structured analysis
      // return {
      //   signal,
      //   confidence,
      //   reasoning: `Charlie Munger analysis for ${ticker}: Moat strength (${moatAnalysis.score.toFixed(1)}/10), Management quality (${managementAnalysis.score.toFixed(1)}/10), Business predictability (${predictabilityAnalysis.score.toFixed(1)}/10), and Valuation (${valuationAnalysis.score.toFixed(1)}/10). ${moatAnalysis.details}. ${managementAnalysis.details}. ${valuationAnalysis.details}.`,
      //   details: {
      //     moatAnalysis,
      //     managementAnalysis,
      //     predictabilityAnalysis,
      //     valuationAnalysis,
      //     newsSentiment
      //   }
      // };

      const x = {
        // metrics,
        // marketCap,
        // lineItems,
        // insiderTrades,
        // companyNews,
        moatAnalysis,
      }
      console.log("Charlie Munger analysis data:", x);
      return x;

    } catch (error) {
      console.error("Error in Charlie Munger analysis:", error);
      return {
        signal: "neutral",
        confidence: 0,
        reasoning: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: {}
      };
    }
  },
});
