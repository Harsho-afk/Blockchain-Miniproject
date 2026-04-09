const samples = [
  {
    title: "The Future of Renewable Energy",
    author: "Priya Nair",
    content: "Solar and wind technologies are rapidly making fossil fuels obsolete...",
    contentType: "article",
    description: "An in-depth look at renewable energy trends",
    aiUsed: true,
    aiTools: ["ChatGPT", "Claude"],
    aiPercentage: 70,
    humanEditPercentage: 40,
    aiUsageDetails: "Used ChatGPT for initial research summary, Claude for structural edits.",
    license: "CC BY 4.0"
  },
  {
    title: "Hand-Painted Coastal Landscape",
    author: "Marco Bellini",
    content: "Oil on canvas, 24x36 inches. Created entirely by hand in Tuscany studio.",
    contentType: "image",
    description: "Traditional oil painting of Amalfi coastline",
    aiUsed: false,
    aiTools: [],
    aiPercentage: 0,
    humanEditPercentage: 100,
    aiUsageDetails: "",
    license: "All Rights Reserved"
  },
  {
    title: "Algorithmic Trading Bot in Python",
    author: "Dev Sharma",
    content: "import pandas as pd\nimport numpy as np\ndef moving_average_strategy(df):\n    df['MA20'] = df['close'].rolling(20).mean()...",
    contentType: "code",
    description: "Python trading bot using moving average crossover",
    aiUsed: true,
    aiTools: ["Copilot", "ChatGPT"],
    aiPercentage: 55,
    humanEditPercentage: 60,
    aiUsageDetails: "GitHub Copilot used for boilerplate. ChatGPT consulted for strategy logic.",
    license: "MIT"
  },
  {
    title: "Mindfulness in the Modern Age",
    author: "Sarah Chen",
    content: "In our hyper-connected world, finding moments of stillness has become...",
    contentType: "blog post",
    description: "Blog post on mindfulness practices for busy professionals",
    aiUsed: true,
    aiTools: ["Jasper"],
    aiPercentage: 30,
    humanEditPercentage: 80,
    aiUsageDetails: "Used Jasper for initial outline only. All prose written by human author.",
    license: "CC BY-NC 4.0"
  },
  {
    title: "Q3 2024 Financial Analysis Report",
    author: "Aiko Tanaka",
    content: "Revenue grew 18% YoY driven by SaaS subscription expansion into APAC markets...",
    contentType: "report",
    description: "Quarterly financial report for internal stakeholders",
    aiUsed: false,
    aiTools: [],
    aiPercentage: 0,
    humanEditPercentage: 100,
    aiUsageDetails: "",
    license: "All Rights Reserved"
  },
  {
    title: "AI Ethics Framework for Enterprises",
    author: "Dr. Lena Braun",
    content: "Organizations deploying AI must establish governance structures that address bias, transparency, and accountability...",
    contentType: "report",
    description: "Comprehensive framework for ethical AI deployment",
    aiUsed: true,
    aiTools: ["Claude", "Perplexity"],
    aiPercentage: 40,
    humanEditPercentage: 75,
    aiUsageDetails: "Claude used for literature review synthesis. Perplexity for citation discovery. All analysis and conclusions by human author.",
    license: "CC BY 4.0"
  }
];

async function seed() {
  console.log("Seeding blockchain with sample disclosures...\n");

  for (const sample of samples) {
    try {
      const res = await fetch("http://localhost:3001/api/disclosures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sample)
      });
      const data = await res.json();
      if (data.success) {
        console.log(`Block #${data.blockIndex} — "${sample.title}"`);
        console.log(`Hash: ${data.blockHash.slice(0, 24)}...`);
      } else {
        console.log(`Failed: "${sample.title}" — ${data.error}`);
      }
    } catch (e) {
      console.error(`Error seeding "${sample.title}":`, e.message);
    }

    // Small delay between submissions
    await new Promise(r => setTimeout(r, 500));
  }

  console.log("\nSeeding complete!");

  // Print stats
  try {
    const stats = await fetch("http://localhost:3001/api/stats").then(r => r.json());
    console.log("\nChain Stats:");
    console.log(`   Total blocks: ${stats.totalBlocks}`);
    console.log(`   Disclosures:  ${stats.totalDisclosures}`);
    console.log(`   AI used:      ${stats.aiUsedCount}`);
    console.log(`   Human only:   ${stats.humanOnlyCount}`);
    console.log(`   Chain valid:  ${stats.chainValid}`);
  } catch (e) {
    console.error("Could not fetch stats:", e.message);
  }
}

seed();
