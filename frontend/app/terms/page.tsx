'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Shield, AlertTriangle, Scale } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="outline" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <GlassCard className="p-6 sm:p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
          </div>

          <div className="text-sm text-gray-400 mb-8">
            <p>Last Updated: December 15, 2025</p>
            <p>Effective Date: December 15, 2025</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-400" />
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By accessing, using, or interacting with MetaPredict.fun ("the Platform", "we", "us", or "our"), 
                you acknowledge that you have read, understood, and agree to be bound by these Terms of Service 
                ("Terms"). If you do not agree to these Terms, you must not access or use the Platform.
              </p>
              <p className="leading-relaxed mt-4">
                These Terms constitute a legally binding agreement between you and MetaPredict.fun. We reserve the 
                right to modify these Terms at any time, and such modifications shall be effective immediately upon 
                posting. Your continued use of the Platform after any such modifications constitutes your acceptance 
                of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                2. Testnet Status and Regulatory Notice
              </h2>
              <p className="leading-relaxed">
                <strong className="text-yellow-400">IMPORTANT:</strong> MetaPredict.fun is currently operating on 
                opBNB Testnet, which is a test network environment. The Platform is in an experimental and development 
                phase. All transactions, tokens, and digital assets on the testnet have no real-world value and are 
                for testing purposes only.
              </p>
              <p className="leading-relaxed mt-4">
                We are actively working with legal and regulatory advisors in multiple jurisdictions, including but not 
                limited to Mexico, British Virgin Islands (BVI), and other international jurisdictions, to ensure 
                compliance with applicable laws and regulations before launching on mainnet. The Platform's transition 
                to mainnet is subject to obtaining necessary regulatory approvals and compliance certifications.
              </p>
              <p className="leading-relaxed mt-4">
                You acknowledge and agree that participation in the testnet does not guarantee access to any mainnet 
                version of the Platform, and we reserve the right to modify, suspend, or terminate the Platform at 
                any time without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" />
                3. Description of Service
              </h2>
              <p className="leading-relaxed">
                MetaPredict.fun is a decentralized prediction market protocol built on blockchain technology. The 
                Platform enables users to create, participate in, and resolve prediction markets using:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Multi-AI consensus oracle system (utilizing Gemini, Llama, Mistral AI models)</li>
                <li>Chainlink Data Streams for real-time price feeds</li>
                <li>Insurance pool mechanisms for user protection</li>
                <li>DAO governance for dispute resolution</li>
                <li>Reputation and staking systems</li>
                <li>Cross-chain aggregation capabilities</li>
              </ul>
              <p className="leading-relaxed mt-4">
                The Platform operates as a decentralized protocol, meaning that smart contracts deployed on the 
                blockchain govern the operation of markets, resolution mechanisms, and fund distribution. We do not 
                control, operate, or have the ability to reverse transactions once executed on the blockchain.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Eligibility and User Requirements</h2>
              <p className="leading-relaxed">
                To use the Platform, you must:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Be at least 18 years of age (or the age of majority in your jurisdiction)</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be prohibited from using the Platform under applicable laws or regulations</li>
                <li>Not be located in, or a resident of, any jurisdiction where prediction markets, gambling, or 
                    cryptocurrency trading is prohibited or restricted</li>
                <li>Comply with all applicable laws, including but not limited to anti-money laundering (AML), 
                    know-your-customer (KYC), and sanctions regulations</li>
                <li>Not use the Platform for any illegal purposes or in violation of any laws</li>
              </ul>
              <p className="leading-relaxed mt-4">
                You are solely responsible for determining whether your use of the Platform is legal in your 
                jurisdiction. We reserve the right to restrict or deny access to users from certain jurisdictions 
                at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Prohibited Uses</h2>
              <p className="leading-relaxed">
                You agree not to use the Platform to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Engage in money laundering, terrorist financing, or other illegal financial activities</li>
                <li>Create markets that promote illegal activities, hate speech, or harm to others</li>
                <li>Manipulate market outcomes or engage in market manipulation</li>
                <li>Interfere with or disrupt the Platform's operation or security</li>
                <li>Attempt to reverse engineer, decompile, or extract source code from the Platform</li>
                <li>Use automated systems, bots, or scripts to interact with the Platform without authorization</li>
                <li>Impersonate any person or entity or misrepresent your affiliation with any entity</li>
                <li>Collect or harvest information about other users without their consent</li>
                <li>Transmit any viruses, malware, or harmful code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Risks and Disclaimers</h2>
              <p className="leading-relaxed">
                <strong className="text-red-400">YOU ACKNOWLEDGE AND AGREE THAT USE OF THE PLATFORM INVOLVES 
                SUBSTANTIAL RISKS:</strong>
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li><strong>Testnet Environment:</strong> The Platform operates on testnet, which may have bugs, 
                    errors, or unexpected behavior. All testnet tokens have no value.</li>
                <li><strong>Smart Contract Risks:</strong> Smart contracts are immutable once deployed. Bugs, 
                    vulnerabilities, or exploits may result in loss of funds.</li>
                <li><strong>AI Oracle Risks:</strong> AI-powered oracles may produce incorrect or biased results. 
                    While we use multi-AI consensus, no system is infallible.</li>
                <li><strong>Blockchain Risks:</strong> Blockchain networks may experience congestion, forks, or 
                    other technical issues affecting Platform operation.</li>
                <li><strong>Regulatory Risks:</strong> Laws and regulations regarding prediction markets and 
                    cryptocurrencies are evolving and may change, potentially affecting Platform availability.</li>
                <li><strong>Market Risks:</strong> Prediction markets involve financial risk. You may lose all 
                    funds deposited in markets.</li>
                <li><strong>Insurance Limitations:</strong> While we offer insurance mechanisms, coverage may be 
                    limited and subject to terms and conditions.</li>
                <li><strong>Technology Risks:</strong> The Platform relies on third-party services (AI providers, 
                    blockchain networks, Chainlink) that may fail or be unavailable.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
              <p className="leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, METAPREDICT.FUN, ITS AFFILIATES, OFFICERS, 
                DIRECTORS, EMPLOYEES, AGENTS, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or other intangible losses</li>
                <li>Damages resulting from your use or inability to use the Platform</li>
                <li>Damages resulting from unauthorized access to or alteration of your data</li>
                <li>Damages resulting from bugs, errors, or vulnerabilities in smart contracts</li>
                <li>Damages resulting from AI oracle inaccuracies or failures</li>
                <li>Damages resulting from blockchain network issues or failures</li>
                <li>Damages resulting from regulatory actions or changes in law</li>
              </ul>
              <p className="leading-relaxed mt-4">
                OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE USE OF THE PLATFORM 
                SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRIOR TO THE ACTION GIVING 
                RISE TO LIABILITY, OR ONE HUNDRED U.S. DOLLARS ($100), WHICHEVER IS GREATER.
              </p>
              <p className="leading-relaxed mt-4">
                Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the 
                above limitations may not apply to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. No Financial Advice</h2>
              <p className="leading-relaxed">
                The Platform and all information, content, and materials available through the Platform are provided 
                for informational purposes only. Nothing on the Platform constitutes financial, investment, legal, 
                tax, or other professional advice.
              </p>
              <p className="leading-relaxed mt-4">
                You should consult with qualified professionals before making any financial decisions. We do not 
                recommend, endorse, or advise on any particular market, prediction, or investment strategy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Intellectual Property</h2>
              <p className="leading-relaxed">
                The Platform, including its design, text, graphics, logos, icons, images, software, and other content, 
                is the property of MetaPredict.fun or its licensors and is protected by copyright, trademark, and other 
                intellectual property laws.
              </p>
              <p className="leading-relaxed mt-4">
                Smart contracts deployed on the blockchain are open-source and may be used in accordance with their 
                respective licenses. However, the Platform's user interface, branding, and proprietary technology 
                remain our intellectual property.
              </p>
              <p className="leading-relaxed mt-4">
                You may not copy, modify, distribute, sell, or lease any part of the Platform without our prior written 
                consent, except as expressly permitted by these Terms or applicable open-source licenses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless MetaPredict.fun, its affiliates, officers, 
                directors, employees, agents, and service providers from and against any and all claims, damages, 
                obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to 
                attorney's fees) arising from:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                <li>Your use of or access to the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any law or regulation</li>
                <li>Your violation of any third-party rights</li>
                <li>Any content you submit, post, or transmit through the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Termination</h2>
              <p className="leading-relaxed">
                We may terminate or suspend your access to the Platform immediately, without prior notice or liability, 
                for any reason, including if you breach these Terms.
              </p>
              <p className="leading-relaxed mt-4">
                Upon termination, your right to use the Platform will cease immediately. However, provisions of 
                these Terms that by their nature should survive termination shall survive, including but not limited 
                to ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law and Dispute Resolution</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the British Virgin 
                Islands, without regard to its conflict of law provisions.
              </p>
              <p className="leading-relaxed mt-4">
                Any dispute arising out of or relating to these Terms or the Platform shall be resolved through 
                binding arbitration in accordance with the rules of the International Chamber of Commerce (ICC), 
                with the seat of arbitration in the British Virgin Islands. The arbitration shall be conducted in 
                English.
              </p>
              <p className="leading-relaxed mt-4">
                Notwithstanding the foregoing, we reserve the right to seek injunctive relief in any court of 
                competent jurisdiction to protect our intellectual property or prevent unauthorized use of the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Severability</h2>
              <p className="leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be 
                limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in 
                full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Entire Agreement</h2>
              <p className="leading-relaxed">
                These Terms, together with our Privacy Policy and Disclaimer, constitute the entire agreement between 
                you and MetaPredict.fun regarding your use of the Platform and supersede all prior agreements and 
                understandings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Contact Information</h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="leading-relaxed mt-4">
                <strong>Email:</strong> legal@metapredict.fun<br />
                <strong>Website:</strong> https://metapredict.fun<br />
                <strong>X (Twitter):</strong> @metapredictbnb<br />
                <strong>Telegram:</strong> @metapredictbnb
              </p>
            </section>

            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-200">
                <strong>By using MetaPredict.fun, you acknowledge that you have read, understood, and agree to be 
                bound by these Terms of Service.</strong>
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

