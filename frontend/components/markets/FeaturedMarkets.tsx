"use client";

import { motion } from "framer-motion";
import { GlassmorphicCard } from "@/components/common/GlassmorphicCard";

const mockMarkets = [
  {
    id: "1",
    description: "Will BTC exceed $100K by Dec 2025?",
    category: "crypto",
    yesPercentage: 65,
    volume: 125000,
  },
  {
    id: "2",
    description: "Will Argentina win Copa América 2025?",
    category: "sports",
    yesPercentage: 72,
    volume: 85000,
  },
  {
    id: "3",
    description: "Will AI replace 50% of jobs by 2030?",
    category: "entertainment",
    yesPercentage: 45,
    volume: 95000,
  },
];

export function FeaturedMarkets() {
  return (
    <section className="px-4 md:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12 gradient-text"
        >
          Featured Markets
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMarkets.map((market, index) => (
            <motion.div
              key={market.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassmorphicCard>
                <div className="p-6">
                  <div className="mb-4">
                    <span className="text-xs uppercase text-purple-400 font-semibold">
                      {market.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    {market.description}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">YES</span>
                      <span className="text-green-400 font-semibold">
                        {market.yesPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${market.yesPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-white/60">
                    <span>Volume: ${market.volume.toLocaleString()}</span>
                    <button
                      className="btn-neural px-4 py-2 text-sm"
                      tabIndex={0}
                      aria-label={`Bet on ${market.description}`}
                    >
                      Bet Now
                    </button>
                  </div>
                </div>
              </GlassmorphicCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

